import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { toaster } from "@/components/ui/toaster";

export interface PointsTransaction {
  id: string;
  student_id: string;
  type: string;
  points: number;
  related_quiz_id?: string | null;
  expires_at?: string | null;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CreditTransaction {
  id: string;
  student_id: string;
  type: string;
  amount_naira: number;
  related_points_transaction_id?: string | null;
  related_invoice_id?: string | null;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface StreakInfo {
  student_id: string;
  current_streak_days: number;
  last_active_date: string;
  grace_used_in_window: boolean;
  window_start_date: string;
}

export function usePointsSystem() {
  const { authdStudent } = useAuthdStudentData();
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [dailyEarned, setDailyEarned] = useState<number>(0);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const studentId = authdStudent?.id;

  // 1. Fetch current balances, streak, and history
  const fetchPointsData = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // A. Get active points balance via RPC or direct SQL query fallback
      const { data: ptsBalData, error: ptsBalErr } = await supabase.rpc(
        "get_points_balance",
        { p_student_id: studentId }
      );
      if (!ptsBalErr && typeof ptsBalData === "number") {
        setPointsBalance(ptsBalData);
      } else {
        // Fallback calculation directly from points_transactions
        const { data: txs } = await supabase
          .from("points_transactions")
          .select("points, expires_at")
          .eq("student_id", studentId);

        if (txs) {
          const now = new Date();
          const validSum = txs.reduce((acc, row) => {
            if (!row.expires_at || new Date(row.expires_at) > now) {
              return acc + (row.points || 0);
            }
            return acc;
          }, 0);
          setPointsBalance(validSum);
        }
      }

      // B. Get active Naira credit balance
      const { data: crBalData, error: crBalErr } = await supabase.rpc(
        "get_credit_balance",
        { p_student_id: studentId }
      );
      if (!crBalErr && crBalData !== null) {
        setCreditBalance(Number(crBalData) || 0);
      } else {
        const { data: ctxs } = await supabase
          .from("credit_transactions")
          .select("amount_naira")
          .eq("student_id", studentId);
        if (ctxs) {
          const csum = ctxs.reduce((acc, row) => acc + (Number(row.amount_naira) || 0), 0);
          setCreditBalance(csum);
        }
      }

      // C. Get daily earned points today
      const todayWatStr = new Date(Date.now() + 1 * 3600 * 1000).toISOString().split("T")[0];
      const { data: dailyData } = await supabase.rpc("get_daily_earned_points", {
        p_student_id: studentId,
        p_date: todayWatStr,
      });
      setDailyEarned(dailyData || 0);

      // D. Get streak record
      const { data: streakData } = await supabase
        .from("student_streaks")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();

      if (streakData) {
        setStreakInfo(streakData);
      }

      // E. Get Points Transactions
      const { data: pTxData } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (pTxData) {
        setPointsHistory(pTxData);
      }

      // F. Get Credit Transactions
      const { data: cTxData } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (cTxData) {
        setCreditHistory(cTxData);
      }
    } catch (err: any) {
      console.warn("Points sync note:", err?.message || "offline");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // 2. Award Daily Login Points on mount
  const awardDailyLogin = useCallback(async () => {
    if (!studentId) return;

    try {
      // Call Edge Function or fallback RPC/direct insert
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://ais-dev-zznm53354f22xrz54kfnwn-544188797831.europe-west2.run.app"}/functions/v1/award-points`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            event: "login",
            student_id: studentId,
          }),
        }
      );

      if (response.ok) {
        const resData = await response.json();
        if (resData.login_points_awarded > 0) {
          toaster.create({
            title: "🌟 Daily Login Bonus!",
            description: `You earned +${resData.login_points_awarded} iGrades Points (IGG) for logging in today! Streak: ${resData.streak?.current_streak_days || 1} Days 🔥`,
            type: "success",
            duration: 5000,
          });
        }
      }
    } catch (e) {
      console.warn("Edge function login award notice:", e);
    } finally {
      fetchPointsData();
    }
  }, [studentId, fetchPointsData]);

  useEffect(() => {
    if (studentId) {
      awardDailyLogin();
    }
  }, [studentId]);

  // 3. Convert Points to Naira Subscription Store Credit
  const convertPoints = async (pointsToConvert: number): Promise<boolean> => {
    if (!studentId) return false;

    if (pointsToConvert < 100) {
      toaster.create({
        title: "Minimum Requirement",
        description: "Minimum 100 points required to convert.",
        type: "error",
      });
      return false;
    }

    if (pointsToConvert % 100 !== 0) {
      toaster.create({
        title: "Invalid Amount",
        description: "Points must be converted in increments of 100 (e.g. 100, 200, 300).",
        type: "error",
      });
      return false;
    }

    if (pointsBalance < pointsToConvert) {
      toaster.create({
        title: "Insufficient Points",
        description: `You have ${pointsBalance} IGG points available. Minimum needed: ${pointsToConvert}.`,
        type: "error",
      });
      return false;
    }

    try {
      setActionLoading(true);

      const { data, error } = await supabase.rpc("fn_convert_points_to_credit", {
        p_student_id: studentId,
        p_points_to_convert: pointsToConvert,
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        const nairaAdded = data.naira_credit_added;
        toaster.create({
          title: "🎉 Conversion Successful!",
          description: `Converted ${pointsToConvert} IGG Points into ₦${nairaAdded.toLocaleString()} subscription store credit!`,
          type: "success",
          duration: 6000,
        });
        await fetchPointsData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Conversion error:", err);
      toaster.create({
        title: "Conversion Failed",
        description: err.message || "Failed to convert points to subscription credit.",
        type: "error",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Apply Store Credit to Invoice
  const applyCredit = async (invoiceId: string, invoiceAmountNaira: number): Promise<boolean> => {
    if (!studentId) return false;

    try {
      setActionLoading(true);
      const { data, error } = await supabase.rpc("fn_apply_credit_to_invoice", {
        p_student_id: studentId,
        p_invoice_id: invoiceId,
        p_invoice_amount: invoiceAmountNaira,
      });

      if (error) throw error;

      if (data && data.success) {
        toaster.create({
          title: "Store Credit Applied!",
          description: `Applied ₦${data.credit_applied_naira.toLocaleString()} credit towards invoice. Remaining invoice: ₦${data.remaining_invoice_amount.toLocaleString()}`,
          type: "success",
        });
        await fetchPointsData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Apply credit error:", err);
      toaster.create({
        title: "Credit Application Failed",
        description: err.message || "Failed to apply store credit.",
        type: "error",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    pointsBalance,
    creditBalance,
    dailyEarned,
    streakInfo,
    pointsHistory,
    creditHistory,
    loading,
    actionLoading,
    fetchPointsData,
    convertPoints,
    applyCredit,
  };
}
