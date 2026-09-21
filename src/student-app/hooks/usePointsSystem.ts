import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { toaster } from "@/components/ui/toaster";
import { celebratePointsGained } from "@/student-app/components/rewards/pointsCelebrationStore";

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

      // A. Query Supabase student_points table directly (primary database source of truth)
      let foundInDb = false;
      try {
        const { data: spData, error: spErr } = await supabase
          .from("student_points")
          .select("*")
          .eq("student_id", studentId)
          .maybeSingle();

        if (!spErr && spData) {
          foundInDb = true;
          setPointsBalance(spData.points_balance ?? 0);
          setStreakInfo({
            student_id: studentId,
            current_streak_days: spData.current_streak ?? 0,
            longest_streak: spData.longest_streak ?? 0,
            last_active_date: spData.last_login_date ?? "",
            grace_used_in_window: false,
            window_start_date: spData.last_login_date ?? "",
            milestone_7_awarded: (spData.longest_streak ?? 0) >= 7,
            milestone_30_awarded: (spData.longest_streak ?? 0) >= 30,
            updated_at: spData.updated_at ?? new Date().toISOString(),
          });
        }
      } catch (dbErr) {
        console.warn("Direct student_points fetch note:", dbErr);
      }

      // B. Query Supabase points_history table directly
      try {
        const { data: histData, error: histErr } = await supabase
          .from("points_history")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false })
          .limit(30);

        if (!histErr && histData && histData.length > 0) {
          setPointsHistory(
            histData.map((h) => ({
              id: h.id,
              student_id: h.student_id,
              type: h.reason,
              points: h.amount,
              description: h.description || "",
              created_at: h.created_at,
            }))
          );
        }
      } catch (histErr) {
        console.warn("Direct points_history fetch note:", histErr);
      }

      // C. Server API call for store credit and enriched data
      try {
        const res = await fetch(`/api/points-data/${studentId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (!foundInDb && typeof json.data.pointsBalance === "number") {
              setPointsBalance(json.data.pointsBalance);
            }
            setCreditBalance(json.data.creditBalance ?? 0);
            setDailyEarned(json.data.dailyEarned ?? 0);
            if (!foundInDb && json.data.streakInfo) {
              setStreakInfo(json.data.streakInfo);
            }
            if (json.data.pointsHistory?.length && pointsHistory.length === 0) {
              setPointsHistory(json.data.pointsHistory);
            }
            setCreditHistory(json.data.creditHistory ?? []);
            return;
          }
        }
      } catch (apiErr) {
        console.warn("Points API fallback:", apiErr);
      }

      // Supabase RPC or direct SQL query fallback if not found
      if (!foundInDb) {
        const { data: ptsBalData, error: ptsBalErr } = await supabase.rpc(
          "get_points_balance",
          { p_student_id: studentId }
        );
        if (!ptsBalErr && typeof ptsBalData === "number") {
          setPointsBalance(ptsBalData);
        }
      }

      // Active Naira credit balance
      const { data: crBalData, error: crBalErr } = await supabase.rpc(
        "get_credit_balance",
        { p_student_id: studentId }
      );
      if (!crBalErr && crBalData !== null) {
        setCreditBalance(Number(crBalData) || 0);
      }

      // Daily earned points today
      const todayWatStr = new Date(Date.now() + 1 * 3600 * 1000).toISOString().split("T")[0];
      const { data: dailyData } = await supabase.rpc("get_daily_earned_points", {
        p_student_id: studentId,
        p_date: todayWatStr,
      });
      setDailyEarned(dailyData || 0);
    } catch (err: any) {
      console.warn("Points sync note:", err?.message || "offline");
    } finally {
      setLoading(false);
    }
  }, [studentId, pointsHistory.length]);

  // 2. Award Daily Login Points on mount
  const awardDailyLogin = useCallback(async () => {
    if (!studentId) return;

    try {
      const todayWatStr = new Date(Date.now() + 1 * 3600 * 1000).toISOString().split("T")[0];

      // Pre-check if already claimed today in Supabase student_points table
      try {
        const { data: spRecord } = await supabase
          .from("student_points")
          .select("points_balance, last_login_date, current_streak, longest_streak")
          .eq("student_id", studentId)
          .maybeSingle();

        if (spRecord) {
          setPointsBalance(spRecord.points_balance ?? 0);
          if (spRecord.last_login_date === todayWatStr) {
            // Already claimed today! Do not re-award or show popup
            return;
          }
        }
      } catch (checkErr) {
        console.warn("Pre-check error in awardDailyLogin:", checkErr);
      }

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      let response = await fetch("/api/award-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || import.meta.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          event: "login",
          student_id: studentId,
        }),
      });

      if (!response.ok) {
        // Fallback to functions URL
        response = await fetch(
          `${import.meta.env.SUPABASE_URL || ""}/functions/v1/award-points`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token || import.meta.env.SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              event: "login",
              student_id: studentId,
            }),
          }
        );
      }

      if (response.ok) {
        const resData = await response.json();
        const pointsGained = (resData.login_points_awarded || 0) + (resData.milestone_points_awarded || 0);
        if (pointsGained > 0) {
          celebratePointsGained({
            points: pointsGained,
            title: "🌟 Daily Login Bonus!",
            description: `You earned +${pointsGained} iGG Points for logging in today! Keep learning and building your streak!`,
            eventType: "login",
            streakDays: resData.streak?.current_streak_days,
            milestonePoints: resData.milestone_points_awarded,
            newBalance: resData.points_balance,
          });
        }
        if (typeof resData.points_balance === "number") {
          setPointsBalance(resData.points_balance);
        }
      } else {
        // Direct Supabase fallback write if server endpoints are not reached
        const { data: spRecord } = await supabase
          .from("student_points")
          .select("*")
          .eq("student_id", studentId)
          .maybeSingle();

        if (spRecord && spRecord.last_login_date === todayWatStr) {
          setPointsBalance(spRecord.points_balance ?? 0);
          return;
        }

        const curBal = spRecord?.points_balance ?? 0;
        const curStreak = spRecord?.current_streak ?? 0;
        const newBal = curBal + 5;
        const newStreak = curStreak + 1;
        const newLongest = Math.max(spRecord?.longest_streak ?? 0, newStreak);

        await supabase.from("student_points").upsert(
          {
            student_id: studentId,
            points_balance: newBal,
            total_earned: (spRecord?.total_earned ?? 0) + 5,
            current_streak: newStreak,
            longest_streak: newLongest,
            last_login_date: todayWatStr,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id" }
        );

        await supabase.from("points_history").insert({
          student_id: studentId,
          amount: 5,
          reason: "daily_login",
          description: "🌟 Daily Login Bonus (+5 iGG Points)",
          balance_after: newBal,
        });

        setPointsBalance(newBal);
        celebratePointsGained({
          points: 5,
          title: "🌟 Daily Login Bonus!",
          description: "You earned +5 iGG Points for logging in today! Keep learning and building your streak!",
          eventType: "login",
          streakDays: newStreak,
          newBalance: newBal,
        });
      }
    } catch (e) {
      console.warn("Login award notice:", e);
    } finally {
      fetchPointsData();
    }
  }, [studentId, fetchPointsData]);

  useEffect(() => {
    if (studentId) {
      awardDailyLogin();
    }
  }, [studentId, awardDailyLogin]);

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

      // Try server API first
      try {
        const res = await fetch("/api/convert-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            points_to_convert: pointsToConvert,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            const nairaAdded = data.naira_credit_added;
            toaster.create({
              title: "🎉 Conversion Successful!",
              description: `Converted ${pointsToConvert} iGG Points into ₦${nairaAdded.toLocaleString()} subscription store credit!`,
              type: "success",
              duration: 6000,
            });
            await fetchPointsData();
            return true;
          }
        }
      } catch (e) {
        console.warn("API convert fallback to RPC:", e);
      }

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
          description: `Converted ${pointsToConvert} iGG Points into ₦${nairaAdded.toLocaleString()} subscription store credit!`,
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

      // Try server API first
      try {
        const res = await fetch("/api/apply-credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            invoice_amount: invoiceAmountNaira,
            invoice_id: invoiceId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            toaster.create({
              title: "Store Credit Applied!",
              description: `Applied ₦${data.credit_applied_naira.toLocaleString()} credit towards subscription. Remaining: ₦${data.remaining_invoice_amount.toLocaleString()}`,
              type: "success",
            });
            await fetchPointsData();
            return true;
          }
        }
      } catch (e) {
        console.warn("API apply-credit fallback to RPC:", e);
      }

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
