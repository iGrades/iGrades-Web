/**
 * Centralized Entitlement Engine for iGrades B2C Subscription System
 * 
 * SOURCE OF TRUTH FOR B2C MONETIZATION:
 * - BASIC: ₦0 (Free starter access, core learning remains 100% accessible)
 * - STANDARD: ₦15,000 / month (Expanded assessment & recent past questions)
 * - PREMIUM: ₦25,000 / month (Full exam simulation, all past questions, tutors & advanced parent intelligence)
 * 
 * CORE PRINCIPLE:
 * Core learning is NEVER paywalled: Lessons, PDFs, Curriculum Subjects, Basic Quizzes,
 * Progress Tracking, Streaks, and iGG Points are accessible on ALL plans.
 * 
 * PARENT MODEL:
 * Parents DO NOT pay directly. There is NO separate Parent subscription.
 * Parent premium features (Weekly Reports, Action Radar, Cognitive Diagnostics)
 * are unlocked based on the connected child's Premium subscription.
 */

export type PlanTier = "basic" | "standard" | "premium";
export type SubscriptionStatus = "active" | "expired" | "canceled" | "past_due" | "none";

export interface PlanDetails {
  id: PlanTier;
  name: string;
  priceFormatted: string;
  amount: number;
  description: string;
  features: string[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanDetails> = {
  basic: {
    id: "basic",
    name: "Basic",
    priceFormatted: "₦0",
    amount: 0,
    description: "Full core secondary curriculum access with 1 monthly exam simulation",
    features: [
      "All secondary school subjects & curriculum topics",
      "Full video lesson catalog & study guides",
      "Comprehensive PDF curriculum notes & formula sheets",
      "Basic quizzes & practice tests",
      "Basic progress tracking & score history",
      "Streaks & iGG Points (earn, track & convert rewards)",
      "1 Exam-Mode take per month (WAEC, JAMB, NECO simulation)",
      "Past Questions: Older examination archives unlocked (Recent 5 years locked)",
      "Normal account & profile management",
      "Parent Portal: Free child connection, basic progress & activity overview",
    ],
  },
  standard: {
    id: "standard",
    name: "Standard",
    priceFormatted: "₦15,000",
    amount: 15000,
    description: "Expanded assessment with up to 20 monthly exam simulations",
    features: [
      "Everything in Basic plan",
      "Up to 20 Exam-Mode takes per month",
      "Full JAMB UTME 4-Subject Mock Simulations (up to 20/mo)",
      "Past Questions: Most recent 3 years unlocked (Remaining 2 years locked)",
      "Detailed diagnostic analytics & topic strength breakdown",
      "Personalized revision recommendations",
      "Parent Portal: Multi-child monitoring & basic progress tracking",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceFormatted: "₦25,000",
    amount: 25000,
    description: "Complete academic mastery with unlimited exams, all past questions & tutors",
    features: [
      "Everything in Standard plan",
      "Unlimited Exam-Mode takes (no 20-attempt limit)",
      "Past Questions: Full access to all recent 5 years & entire archive",
      "Learning with an iGrades Tutor (VIP Early Access & priority matching)",
      "Unlocks Parent Weekly Reports for connected parents",
      "Unlocks Parent Action Radar for connected parents",
      "Unlocks Parent Cognitive Diagnostics for connected parents",
      "Deep longitudinal learning analytics",
    ],
  },
};

/**
 * Normalizes subscription plan string and handles status.
 * Expired / inactive status on paid tiers falls back to basic.
 */
export function normalizePlan(
  rawPlan?: string | null,
  rawStatus?: string | null
): { plan: PlanTier; effectivePlan: PlanTier; isActive: boolean; isExpired: boolean } {
  const statusLower = (rawStatus || "").trim().toLowerCase();
  const isExpired = statusLower === "expired" || statusLower === "canceled" || statusLower === "past_due";

  let detectedPlan: PlanTier = "basic";
  if (rawPlan) {
    const p = rawPlan.trim().toLowerCase();
    if (p.includes("premium")) {
      detectedPlan = "premium";
    } else if (p.includes("standard")) {
      detectedPlan = "standard";
    } else {
      detectedPlan = "basic";
    }
  }

  const isActive = !isExpired && (statusLower === "active" || detectedPlan === "basic" || !statusLower);
  const effectivePlan: PlanTier = isActive ? detectedPlan : "basic";

  return {
    plan: detectedPlan,
    effectivePlan,
    isActive,
    isExpired,
  };
}

export interface EntitlementCheckResult {
  allowed: boolean;
  requiredPlan: PlanTier;
  reason?: string;
  isLocked?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CORE LEARNING ENTITLEMENTS (MUST REMAIN 100% ACCESSIBLE TO BASIC)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subjects are core learning: never paywalled.
 */
export function checkSubjectAccess(
  _effectivePlan: PlanTier,
  _subjectIndex: number = 0,
  _subjectName?: string
): EntitlementCheckResult {
  return { allowed: true, requiredPlan: "basic", isLocked: false };
}

export function getMaxAllowedSubjects(_effectivePlan: PlanTier): number {
  return 100; // All subjects accessible
}

/**
 * Video lessons are core learning: never paywalled.
 */
export function checkVideoAccess(
  _effectivePlan: PlanTier,
  _videoIndex: number = 0,
  _videoTitle?: string
): EntitlementCheckResult {
  return { allowed: true, requiredPlan: "basic", isLocked: false };
}

/**
 * PDFs are core learning: never paywalled.
 */
export function checkPdfAccess(
  _effectivePlan: PlanTier,
  _pdfIndex: number = 0,
  _pdfTitle?: string
): EntitlementCheckResult {
  return { allowed: true, requiredPlan: "basic", isLocked: false };
}

/**
 * Basic quizzes & quick tests are core learning: never paywalled.
 */
export function checkBasicQuizAccess(_effectivePlan: PlanTier): EntitlementCheckResult {
  return { allowed: true, requiredPlan: "basic", isLocked: false };
}

/**
 * iGG Points, streaks & reward conversions: never paywalled.
 */
export function checkPointsAccess(
  _effectivePlan: PlanTier,
  _feature: "earning" | "viewing" | "streaks" | "history" | "conversion" = "viewing"
): EntitlementCheckResult {
  return {
    allowed: true,
    requiredPlan: "basic",
    isLocked: false,
    reason: "iGG Points, daily streaks, earning, and reward conversions are freely accessible on all plans.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXAM QUIZ MODE ENTITLEMENTS (MONETIZED ASSESSMENT FEATURE)
// ─────────────────────────────────────────────────────────────────────────────

export const BASIC_MONTHLY_EXAM_ATTEMPTS = 1;
export const STANDARD_MONTHLY_EXAM_ATTEMPTS = 20;

/**
 * Evaluates whether a student can take an Exam Quiz Mode attempt.
 * - Basic: 1 take per month
 * - Standard: Up to 20 takes per month
 * - Premium: Full/unlimited access
 */
export function checkExamModeAccess(
  effectivePlan: PlanTier,
  monthlyAttemptsUsed: number
): EntitlementCheckResult {
  if (effectivePlan === "premium") {
    return {
      allowed: true,
      requiredPlan: "premium",
      isLocked: false,
      reason: "Unlimited exam access included on Premium.",
    };
  }

  if (effectivePlan === "standard") {
    if (monthlyAttemptsUsed < STANDARD_MONTHLY_EXAM_ATTEMPTS) {
      return {
        allowed: true,
        requiredPlan: "standard",
        isLocked: false,
        reason: `${monthlyAttemptsUsed} of ${STANDARD_MONTHLY_EXAM_ATTEMPTS} exam attempts used this month.`,
      };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: "You've reached your 20 exam attempts for this month. Upgrade to Premium for unlimited exam access.",
    };
  }

  // Basic
  if (monthlyAttemptsUsed < BASIC_MONTHLY_EXAM_ATTEMPTS) {
    return {
      allowed: true,
      requiredPlan: "basic",
      isLocked: false,
      reason: `${monthlyAttemptsUsed} of ${BASIC_MONTHLY_EXAM_ATTEMPTS} exam attempts used this month.`,
    };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: "You've used your exam attempt for this month. Upgrade to Standard (up to 20 attempts) or Premium (unlimited).",
  };
}

/**
 * Legacy alias for mode check during quiz setup.
 * Note: opening instructions does NOT consume an attempt.
 */
export function checkQuizModeAccess(
  effectivePlan: PlanTier,
  mode: string,
  monthlyAttemptsUsed: number = 0
): EntitlementCheckResult {
  const normMode = (mode || "").trim().toLowerCase();
  if (normMode !== "examination") {
    // Quick test / basic quiz is accessible to all
    return { allowed: true, requiredPlan: "basic", isLocked: false };
  }
  return checkExamModeAccess(effectivePlan, monthlyAttemptsUsed);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PAST QUESTIONS (PROTECTED 5-YEAR COLLECTION)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard past question years:
 * The most recent 5 years form the protected collection:
 * [2026, 2025, 2024, 2023, 2022]
 * 
 * BASIC:
 * 2026 — locked (Premium)
 * 2025 — locked (Premium)
 * 2024 — locked (Standard/Premium)
 * 2023 — locked (Standard/Premium)
 * 2022 — locked (Standard/Premium)
 * Older (2021 and older) — unlocked
 * 
 * STANDARD:
 * 2026 — locked (Premium)
 * 2025 — locked (Premium)
 * 2024 — unlocked
 * 2023 — unlocked
 * 2022 — unlocked
 * Older — unlocked
 * 
 * PREMIUM:
 * All years unlocked
 */
export const DEFAULT_PQ_YEARS = [
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
];

export function getProtectedPqYears(availableYears: string[] = DEFAULT_PQ_YEARS): {
  protected5: string[];
  premiumOnly2: string[];
  standardUnlocked3: string[];
} {
  // Sort descending
  const sorted = [...availableYears].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  const protected5 = sorted.slice(0, 5);
  const premiumOnly2 = protected5.slice(0, 2); // 2026, 2025
  const standardUnlocked3 = protected5.slice(2, 5); // 2024, 2023, 2022
  return { protected5, premiumOnly2, standardUnlocked3 };
}

export function checkPastQuestionYearAccess(
  effectivePlan: PlanTier,
  year: string,
  availableYears: string[] = DEFAULT_PQ_YEARS
): EntitlementCheckResult {
  if (effectivePlan === "premium") {
    return { allowed: true, requiredPlan: "premium", isLocked: false };
  }

  const { protected5, premiumOnly2, standardUnlocked3 } = getProtectedPqYears(availableYears);

  // If not in the protected recent 5 years, it is an older archive year -> unlocked
  if (!protected5.includes(year)) {
    return { allowed: true, requiredPlan: "basic", isLocked: false };
  }

  // If it's one of the top 2 newest years (e.g. 2026, 2025)
  if (premiumOnly2.includes(year)) {
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: `Past Questions from ${year} are part of the latest examination collection and require a Premium subscription.`,
    };
  }

  // If it's one of the next 3 years (e.g. 2024, 2023, 2022)
  if (standardUnlocked3.includes(year)) {
    if (effectivePlan === "standard") {
      return { allowed: true, requiredPlan: "standard", isLocked: false };
    }
    // Basic plan
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: `The most recent 5 years of Past Questions (${year}) are locked on the Basic plan. Upgrade to Standard to unlock recent past questions.`,
    };
  }

  return { allowed: true, requiredPlan: "basic", isLocked: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LEARNING WITH A TUTOR (PREMIUM ONLY)
// ─────────────────────────────────────────────────────────────────────────────

export function checkTutorAccess(effectivePlan: PlanTier): EntitlementCheckResult {
  if (effectivePlan === "premium") {
    return {
      allowed: true,
      requiredPlan: "premium",
      isLocked: false,
      reason: "Full Premium access to iGrades Tutors.",
    };
  }

  return {
    allowed: false,
    requiredPlan: "premium",
    isLocked: true,
    reason: "Get guided support with an iGrades Tutor. Premium feature — iGrades Tutors are coming soon.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PARENT MONETIZATION MODEL (TIED TO CONNECTED CHILD'S SUBSCRIPTION)
// ─────────────────────────────────────────────────────────────────────────────
// Parents DO NOT pay directly. Access is derived from the connected child's plan.
// Basic Child:
//   Weekly Reports -> LOCKED
//   Action Radar -> LOCKED
//   Cognitive Diagnostics -> LOCKED
// Standard Child:
//   Weekly Reports -> LOCKED
//   Action Radar -> LOCKED
//   Cognitive Diagnostics -> LOCKED
// Premium Child:
//   Weekly Reports -> UNLOCKED
//   Action Radar -> UNLOCKED
//   Cognitive Diagnostics -> UNLOCKED

export type ParentPremiumFeature = "weekly_reports" | "action_radar" | "cognitive_diagnostics";

export function checkParentFeatureAccess(
  childEffectivePlan: PlanTier,
  feature: ParentPremiumFeature,
  childName: string = "your child"
): EntitlementCheckResult {
  if (childEffectivePlan === "premium") {
    return {
      allowed: true,
      requiredPlan: "premium",
      isLocked: false,
    };
  }

  switch (feature) {
    case "weekly_reports":
      return {
        allowed: false,
        requiredPlan: "premium",
        isLocked: true,
        reason: `Weekly Reports provide detailed weekly academic progress digests and are available when ${childName} is on Premium.`,
      };
    case "action_radar":
      return {
        allowed: false,
        requiredPlan: "premium",
        isLocked: true,
        reason: `Action Radar identifies key focus areas and is available with ${childName}'s Premium plan.`,
      };
    case "cognitive_diagnostics":
      return {
        allowed: false,
        requiredPlan: "premium",
        isLocked: true,
        reason: `Cognitive Diagnostics uncover deeper learning patterns and are available with ${childName}'s Premium plan.`,
      };
  }
}

/**
 * Child connection is a core free parent feature: never paywalled.
 */
export function checkAddChildAccess(_effectivePlan?: PlanTier): EntitlementCheckResult {
  return { allowed: true, requiredPlan: "basic", isLocked: false };
}

export function getMaxChildrenAllowed(_effectivePlan?: PlanTier): number {
  return 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PLAN COMPARISON MATRIX
// ─────────────────────────────────────────────────────────────────────────────

export interface FeatureComparisonRow {
  feature: string;
  category: "core" | "assessment" | "tutor" | "parent";
  basic: string;
  standard: string;
  premium: string;
}

export const PLAN_COMPARISON_MATRIX: FeatureComparisonRow[] = [
  { feature: "Core Dashboard", category: "core", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Lessons & Videos", category: "core", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "PDF Study Guides", category: "core", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Basic Quizzes", category: "core", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Progress Tracking", category: "core", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "Daily Streaks", category: "core", basic: "✓", standard: "✓", premium: "✓" },
  { feature: "iGG Points", category: "core", basic: "✓", standard: "✓", premium: "✓" },
  {
    feature: "Exam Mode",
    category: "assessment",
    basic: "1 / month",
    standard: "20 / month",
    premium: "Full access (Unlimited)",
  },
  {
    feature: "Past Questions",
    category: "assessment",
    basic: "Recent 5 years locked",
    standard: "Recent 3 years unlocked",
    premium: "Full access (All years)",
  },
  {
    feature: "iGrades Tutor",
    category: "tutor",
    basic: "—",
    standard: "—",
    premium: "Premium (Coming Soon)",
  },
  {
    feature: "Parent Weekly Reports",
    category: "parent",
    basic: "—",
    standard: "—",
    premium: "✓ (via Child's Premium)",
  },
  {
    feature: "Parent Action Radar",
    category: "parent",
    basic: "—",
    standard: "—",
    premium: "✓ (via Child's Premium)",
  },
  {
    feature: "Cognitive Diagnostics",
    category: "parent",
    basic: "—",
    standard: "—",
    premium: "✓ (via Child's Premium)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPATIBILITY & HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export function getTodaySparkCount(studentId?: string): number {
  if (typeof window === "undefined" || !studentId) return 0;
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `spark_count_${studentId}_${today}`;
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function setTodaySparkCount(count: number, studentId?: string): void {
  if (typeof window === "undefined" || !studentId) return;
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `spark_count_${studentId}_${today}`;
    localStorage.setItem(key, count.toString());
  } catch {
    // ignore
  }
}

export function getSparkDailyLimit(effectivePlan: PlanTier): number {
  switch (effectivePlan) {
    case "premium":
      return 150;
    case "standard":
      return 30;
    case "basic":
    default:
      return 10;
  }
}

export function checkSparkDailyUsageAccess(
  effectivePlan: PlanTier,
  currentDailyCount: number
): EntitlementCheckResult {
  const limit = getSparkDailyLimit(effectivePlan);
  if (currentDailyCount < limit) {
    return { allowed: true, requiredPlan: "basic", isLocked: false };
  }
  return {
    allowed: false,
    requiredPlan: effectivePlan === "basic" ? "standard" : "premium",
    isLocked: true,
    reason: `You've reached your daily AI companion limit (${limit} messages/day). Upgrade to expand your daily usage.`,
  };
}

export function incrementTodayTimedQuizCount(_studentId?: string): number {
  return 0;
}
