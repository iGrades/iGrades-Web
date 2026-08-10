-- ==============================================================================
-- iGrades Points & Subscription Credit Rewards System Migration
-- ==============================================================================
-- Append-only financial ledgers for Points and Subscription Credit
-- Anti-gaming controls, rolling 12-month expiry, atomic conversions, and WAT streak tracking.

-- ------------------------------------------------------------------------------
-- 1. Custom Enum Types
-- ------------------------------------------------------------------------------

CREATE TYPE points_transaction_type AS ENUM (
  'login',
  'quiz_first_attempt',
  'streak_bonus_7',
  'streak_bonus_30',
  'expiry',
  'conversion_debit',
  'admin_adjustment'
);

CREATE TYPE credit_transaction_type AS ENUM (
  'conversion_credit',
  'invoice_debit',
  'admin_adjustment'
);

-- ------------------------------------------------------------------------------
-- 2. Append-Only Ledger Tables
-- ------------------------------------------------------------------------------

-- Points Transaction Ledger
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  type points_transaction_type NOT NULL,
  points INTEGER NOT NULL, -- Positive for earns, negative for debits/expiry
  related_quiz_id TEXT NULL,
  expires_at TIMESTAMPTZ NULL, -- Populated on earning rows (rolling 12-month end of month)
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Credit Transaction Ledger (Naira ₦ store credit)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  type credit_transaction_type NOT NULL,
  amount_naira NUMERIC(12, 2) NOT NULL, -- Positive for credits, negative for debits
  related_points_transaction_id UUID REFERENCES points_transactions(id) ON DELETE SET NULL NULL,
  related_invoice_id TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Student Streak Tracking Table
CREATE TABLE IF NOT EXISTS student_streaks (
  student_id TEXT PRIMARY KEY,
  current_streak_days INTEGER DEFAULT 0 NOT NULL,
  last_active_date DATE NOT NULL,
  grace_used_in_window BOOLEAN DEFAULT FALSE NOT NULL,
  window_start_date DATE NOT NULL,
  last_7_streak_awarded_at DATE NULL,
  last_30_streak_awarded_at DATE NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. Performance Indexes
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_points_tx_student_created 
  ON points_transactions(student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_points_tx_student_expires 
  ON points_transactions(student_id, expires_at) 
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_points_tx_student_quiz 
  ON points_transactions(student_id, related_quiz_id) 
  WHERE related_quiz_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_tx_student_created 
  ON credit_transactions(student_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS)
-- ------------------------------------------------------------------------------
-- IMPORTANT ARCHITECTURAL NOTE ON RLS & SECURITY:
-- Policies explicitly match on the `student_id` column (e.g., student_id = auth.uid()::text),
-- NOT `user_id`. Direct client-side INSERT policies are intentionally OMITTED.
-- All ledger modifications MUST be executed through SECURITY DEFINER PostgreSQL functions 
-- or Edge Functions using the service_role key to prevent students from granting themselves points.

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_streaks ENABLE ROW LEVEL SECURITY;

-- Read-only policies for students
CREATE POLICY "Students can view their own points transactions"
  ON points_transactions FOR SELECT
  USING (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own credit transactions"
  ON credit_transactions FOR SELECT
  USING (student_id = auth.uid()::text);

CREATE POLICY "Students can view their own streak status"
  ON student_streaks FOR SELECT
  USING (student_id = auth.uid()::text);

-- ------------------------------------------------------------------------------
-- 5. Ledger Balance Calculation Functions & Views
-- ------------------------------------------------------------------------------

-- Calculate current active (non-expired) points balance for a student
CREATE OR REPLACE FUNCTION get_points_balance(p_student_id TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(points), 0)::INTEGER
  FROM points_transactions
  WHERE student_id = p_student_id
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- Calculate current active Naira ₦ store credit balance for a student
CREATE OR REPLACE FUNCTION get_credit_balance(p_student_id TEXT)
RETURNS NUMERIC(12, 2)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount_naira), 0.00)::NUMERIC(12, 2)
  FROM credit_transactions
  WHERE student_id = p_student_id;
$$;

-- Calculate daily points earned by a student from capped sources (login + quiz_first_attempt)
CREATE OR REPLACE FUNCTION get_daily_earned_points(
  p_student_id TEXT,
  p_date DATE DEFAULT (NOW() AT TIME ZONE 'Africa/Lagos')::DATE
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(points), 0)::INTEGER
  FROM points_transactions
  WHERE student_id = p_student_id
    AND type IN ('login', 'quiz_first_attempt')
    AND points > 0
    AND (created_at AT TIME ZONE 'Africa/Lagos')::DATE = p_date;
$$;

-- Summary views for real-time reporting & auditing
CREATE OR REPLACE VIEW v_student_points_summary AS
SELECT
  student_id,
  get_points_balance(student_id) AS active_points_balance,
  COALESCE(SUM(CASE WHEN points > 0 THEN points ELSE 0 END), 0) AS total_points_earned_all_time,
  COALESCE(SUM(CASE WHEN type = 'conversion_debit' THEN ABS(points) ELSE 0 END), 0) AS total_points_converted,
  COALESCE(SUM(CASE WHEN type = 'expiry' THEN ABS(points) ELSE 0 END), 0) AS total_points_expired
FROM points_transactions
GROUP BY student_id;

CREATE OR REPLACE VIEW v_student_credit_summary AS
SELECT
  student_id,
  get_credit_balance(student_id) AS active_credit_balance_naira,
  COALESCE(SUM(CASE WHEN type = 'conversion_credit' THEN amount_naira ELSE 0 END), 0) AS total_credit_converted_naira,
  COALESCE(SUM(CASE WHEN type = 'invoice_debit' THEN ABS(amount_naira) ELSE 0 END), 0) AS total_credit_spent_naira
FROM credit_transactions
GROUP BY student_id;

-- ------------------------------------------------------------------------------
-- 6. Atomic Ledger Operation Helper Functions (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Convert Points to Naira Credit atomically in a single transaction
CREATE OR REPLACE FUNCTION fn_convert_points_to_credit(
  p_student_id TEXT,
  p_points_to_convert INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INT;
  v_naira_amount NUMERIC(12, 2);
  v_pts_tx_id UUID;
  v_credit_tx_id UUID;
  v_new_pts_balance INT;
  v_new_credit_balance NUMERIC(12, 2);
BEGIN
  -- 1. Validate conversion thresholds
  IF p_points_to_convert < 100 THEN
    RAISE EXCEPTION 'Minimum conversion requirement is 100 points.';
  END IF;

  IF p_points_to_convert % 100 != 0 THEN
    RAISE EXCEPTION 'Conversion points must be a multiple of 100.';
  END IF;

  -- 2. Verify active points balance
  v_current_balance := get_points_balance(p_student_id);
  IF v_current_balance < p_points_to_convert THEN
    RAISE EXCEPTION 'Insufficient points balance. Available: %, Requested: %', v_current_balance, p_points_to_convert;
  END IF;

  -- 3. Fixed conversion rate: 100 points = ₦1,000
  v_naira_amount := (p_points_to_convert / 100.0) * 1000.00;

  -- 4. Record negative conversion_debit entry in points_transactions
  INSERT INTO points_transactions (
    student_id,
    type,
    points,
    expires_at,
    metadata
  ) VALUES (
    p_student_id,
    'conversion_debit',
    -p_points_to_convert,
    NULL,
    jsonb_build_object(
      'conversion_rate', '100_pts_to_1000_ngn',
      'naira_credit_generated', v_naira_amount
    )
  ) RETURNING id INTO v_pts_tx_id;

  -- 5. Record positive conversion_credit entry in credit_transactions
  INSERT INTO credit_transactions (
    student_id,
    type,
    amount_naira,
    related_points_transaction_id,
    metadata
  ) VALUES (
    p_student_id,
    'conversion_credit',
    v_naira_amount,
    v_pts_tx_id,
    jsonb_build_object(
      'points_converted', p_points_to_convert,
      'conversion_rate', '100_pts_to_1000_ngn'
    )
  ) RETURNING id INTO v_credit_tx_id;

  -- 6. Retrieve new balances
  v_new_pts_balance := get_points_balance(p_student_id);
  v_new_credit_balance := get_credit_balance(p_student_id);

  RETURN jsonb_build_object(
    'success', true,
    'student_id', p_student_id,
    'points_converted', p_points_to_convert,
    'naira_credit_added', v_naira_amount,
    'points_tx_id', v_pts_tx_id,
    'credit_tx_id', v_credit_tx_id,
    'new_points_balance', v_new_pts_balance,
    'new_credit_balance_naira', v_new_credit_balance
  );
END;
$$;

-- Apply store credit balance towards subscription invoice atomically
CREATE OR REPLACE FUNCTION fn_apply_credit_to_invoice(
  p_student_id TEXT,
  p_invoice_id TEXT,
  p_invoice_amount NUMERIC(12, 2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available_credit NUMERIC(12, 2);
  v_credit_to_apply NUMERIC(12, 2);
  v_credit_tx_id UUID;
  v_remaining_credit NUMERIC(12, 2);
  v_remaining_invoice NUMERIC(12, 2);
BEGIN
  IF p_invoice_amount <= 0 THEN
    RAISE EXCEPTION 'Invoice amount must be greater than 0.';
  END IF;

  v_available_credit := get_credit_balance(p_student_id);
  
  IF v_available_credit <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No credit balance available.',
      'credit_applied', 0.00,
      'remaining_invoice', p_invoice_amount,
      'remaining_credit', 0.00
    );
  END IF;

  -- Apply up to available balance or invoice amount, whichever is lower
  v_credit_to_apply := LEAST(v_available_credit, p_invoice_amount);

  INSERT INTO credit_transactions (
    student_id,
    type,
    amount_naira,
    related_invoice_id,
    metadata
  ) VALUES (
    p_student_id,
    'invoice_debit',
    -v_credit_to_apply,
    p_invoice_id,
    jsonb_build_object(
      'original_invoice_amount', p_invoice_amount,
      'applied_at', NOW()
    )
  ) RETURNING id INTO v_credit_tx_id;

  v_remaining_credit := get_credit_balance(p_student_id);
  v_remaining_invoice := p_invoice_amount - v_credit_to_apply;

  RETURN jsonb_build_object(
    'success', true,
    'student_id', p_student_id,
    'invoice_id', p_invoice_id,
    'credit_applied_naira', v_credit_to_apply,
    'remaining_invoice_amount', v_remaining_invoice,
    'remaining_credit_balance', v_remaining_credit,
    'credit_tx_id', v_credit_tx_id
  );
END;
$$;
