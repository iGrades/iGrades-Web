// supabase/functions/award-points/index.ts
// Supabase Edge Function to safely process login & quiz completion point awards
// Enforces server-side first-attempt verification, 100 pts/day cap, streak calculations, and 12-month expiry.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

// Helper: Get WAT (West Africa Time - UTC+1) current calendar date YYYY-MM-DD
function getWatDateString(date = new Date()): string {
  const watTime = new Date(date.getTime() + 1 * 60 * 60 * 1000);
  return watTime.toISOString().split("T")[0];
}

// Helper: Get rolling 12-month end of month expiry timestamp
function getRolling12MonthExpiry(now = new Date()): string {
  const target = new Date(now.getTime() + 1 * 60 * 60 * 1000); // WAT perspective
  const year = target.getUTCFullYear() + 1;
  const month = target.getUTCMonth(); // 0-indexed
  // Get last day of the target month next year at 23:59:59.999
  const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  return lastDay.toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    let callerStudentId: string | null = null;

    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        callerStudentId = user.id;
      }
    }

    const body = await req.json();
    const { event, student_id, quiz_id, score_percentage } = body;

    const targetStudentId = callerStudentId || student_id;

    if (!targetStudentId) {
      return new Response(
        JSON.stringify({ error: "Missing valid student_id or authorization." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const todayWat = getWatDateString();
    const expiresAt = getRolling12MonthExpiry();

    // -------------------------------------------------------------------------
    // EVENT 1: DAILY LOGIN
    // -------------------------------------------------------------------------
    if (event === "login") {
      // Check if student already received a login award today (WAT)
      const { data: existingLogin, error: loginCheckError } = await supabaseAdmin
        .from("points_transactions")
        .select("id")
        .eq("student_id", targetStudentId)
        .eq("type", "login")
        .gte("created_at", `${todayWat}T00:00:00+01:00`)
        .lte("created_at", `${todayWat}T23:59:59+01:00`)
        .maybeSingle();

      if (loginCheckError) {
        throw loginCheckError;
      }

      let loginPointsAwarded = 0;
      let loginMsg = "Login points already claimed today.";

      if (!existingLogin) {
        // Query daily earned points so far from capped sources (login + quiz)
        const { data: dailyEarnedData } = await supabaseAdmin.rpc("get_daily_earned_points", {
          p_student_id: targetStudentId,
          p_date: todayWat,
        });

        const dailyEarnedSoFar = dailyEarnedData || 0;
        const availableCap = Math.max(0, 100 - dailyEarnedSoFar);
        const baseLoginPts = 5;
        loginPointsAwarded = Math.min(baseLoginPts, availableCap);

        if (loginPointsAwarded > 0) {
          await supabaseAdmin.from("points_transactions").insert({
            student_id: targetStudentId,
            type: "login",
            points: loginPointsAwarded,
            expires_at: expiresAt,
            metadata: {
              wat_date: todayWat,
              base_points: baseLoginPts,
              cap_applied: loginPointsAwarded < baseLoginPts,
            },
          });
          loginMsg = `Awarded ${loginPointsAwarded} points for daily login.`;
        } else {
          loginMsg = "Daily 100 points earning cap reached. 0 login points added.";
        }
      }

      // Handle Streak Calculation & Bonuses
      const streakResult = await updateStudentStreak(supabaseAdmin, targetStudentId, todayWat, expiresAt);

      const { data: activeBalance } = await supabaseAdmin.rpc("get_points_balance", {
        p_student_id: targetStudentId,
      });

      return new Response(
        JSON.stringify({
          success: true,
          event: "login",
          login_points_awarded: loginPointsAwarded,
          message: loginMsg,
          streak: streakResult,
          active_points_balance: activeBalance || 0,
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------------------
    // EVENT 2: QUIZ COMPLETED (First attempt only)
    // -------------------------------------------------------------------------
    if (event === "quiz_completion") {
      if (!quiz_id || typeof score_percentage !== "number") {
        return new Response(
          JSON.stringify({ error: "quiz_id and score_percentage are required." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // SERVER-SIDE FIRST ATTEMPT VERIFICATION: Check if points transaction exists for this (student_id, quiz_id)
      const { data: existingQuizAttempt, error: quizCheckErr } = await supabaseAdmin
        .from("points_transactions")
        .select("id, points, created_at")
        .eq("student_id", targetStudentId)
        .eq("type", "quiz_first_attempt")
        .eq("related_quiz_id", quiz_id)
        .maybeSingle();

      if (quizCheckErr) {
        throw quizCheckErr;
      }

      if (existingQuizAttempt) {
        // RETAKE DETECTED: 0 points awarded
        const { data: activeBalance } = await supabaseAdmin.rpc("get_points_balance", {
          p_student_id: targetStudentId,
        });

        return new Response(
          JSON.stringify({
            success: true,
            event: "quiz_completion",
            first_attempt: false,
            points_awarded: 0,
            message: "Retakes of the same quiz earn 0 points.",
            active_points_balance: activeBalance || 0,
          }),
          { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // FIRST ATTEMPT: Calculate score band points
      let baseQuizPts = 10;
      if (score_percentage >= 80) {
        baseQuizPts = 30;
      } else if (score_percentage >= 50) {
        baseQuizPts = 20;
      }

      // Enforce 100 points/day earning cap
      const { data: dailyEarnedData } = await supabaseAdmin.rpc("get_daily_earned_points", {
        p_student_id: targetStudentId,
        p_date: todayWat,
      });

      const dailyEarnedSoFar = dailyEarnedData || 0;
      const availableCap = Math.max(0, 100 - dailyEarnedSoFar);
      const actualQuizPts = Math.min(baseQuizPts, availableCap);

      if (actualQuizPts > 0) {
        await supabaseAdmin.from("points_transactions").insert({
          student_id: targetStudentId,
          type: "quiz_first_attempt",
          points: actualQuizPts,
          related_quiz_id: quiz_id,
          expires_at: expiresAt,
          metadata: {
            quiz_id,
            score_percentage,
            base_points: baseQuizPts,
            cap_applied: actualQuizPts < baseQuizPts,
            wat_date: todayWat,
          },
        });
      }

      const { data: activeBalance } = await supabaseAdmin.rpc("get_points_balance", {
        p_student_id: targetStudentId,
      });

      return new Response(
        JSON.stringify({
          success: true,
          event: "quiz_completion",
          first_attempt: true,
          score_percentage,
          base_points: baseQuizPts,
          points_awarded: actualQuizPts,
          daily_cap_reached: dailyEarnedSoFar + actualQuizPts >= 100,
          active_points_balance: activeBalance || 0,
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid event type. Supported events: 'login', 'quiz_completion'" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("award-points error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to maintain streak state and award 7-day (50 pts) & 30-day (250 pts) streak bonuses
async function updateStudentStreak(
  supabaseAdmin: any,
  studentId: string,
  todayWatStr: string,
  expiresAt: string
) {
  const todayWat = new Date(todayWatStr);

  const { data: streakRecord } = await supabaseAdmin
    .from("student_streaks")
    .select("*")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!streakRecord) {
    // Initial streak record creation
    const newStreak = {
      student_id: studentId,
      current_streak_days: 1,
      last_active_date: todayWatStr,
      grace_used_in_window: false,
      window_start_date: todayWatStr,
      last_7_streak_awarded_at: null,
      last_30_streak_awarded_at: null,
      updated_at: new Date().toISOString(),
    };

    await supabaseAdmin.from("student_streaks").insert(newStreak);
    return { current_streak_days: 1, bonus_awarded: 0, grace_used: false };
  }

  const lastActive = new Date(streakRecord.last_active_date);
  const diffDays = Math.round((todayWat.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 0) {
    // Already logged in today
    return {
      current_streak_days: streakRecord.current_streak_days,
      bonus_awarded: 0,
      grace_used: streakRecord.grace_used_in_window,
    };
  }

  let newStreakDays = streakRecord.current_streak_days;
  let graceUsed = streakRecord.grace_used_in_window;
  let windowStart = new Date(streakRecord.window_start_date);

  // Check rolling 7-day window for grace reset
  const daysInWindow = Math.round((todayWat.getTime() - windowStart.getTime()) / (1000 * 3600 * 24));
  if (daysInWindow >= 7) {
    graceUsed = false;
    windowStart = todayWat;
  }

  if (diffDays === 1) {
    // Consecutive day
    newStreakDays += 1;
  } else if (diffDays === 2 && !graceUsed) {
    // 1 missed day absorbed by Grace Period! Streak continues, grace used
    newStreakDays += 1;
    graceUsed = true;
  } else {
    // Missed >1 day or grace already used in window -> Reset streak
    newStreakDays = 1;
    graceUsed = false;
    windowStart = todayWat;
  }

  let bonusAwarded = 0;
  let last7Awarded = streakRecord.last_7_streak_awarded_at;
  let last30Awarded = streakRecord.last_30_streak_awarded_at;

  // Streak bonuses are EXEMPT from daily 100 pts cap as per business rules
  if (newStreakDays >= 30 && last30Awarded !== todayWatStr && newStreakDays % 30 === 0) {
    bonusAwarded += 250;
    last30Awarded = todayWatStr;
    await supabaseAdmin.from("points_transactions").insert({
      student_id: studentId,
      type: "streak_bonus_30",
      points: 250,
      expires_at: expiresAt,
      metadata: { streak_days: newStreakDays, wat_date: todayWatStr },
    });
  } else if (newStreakDays >= 7 && last7Awarded !== todayWatStr && newStreakDays % 7 === 0) {
    bonusAwarded += 50;
    last7Awarded = todayWatStr;
    await supabaseAdmin.from("points_transactions").insert({
      student_id: studentId,
      type: "streak_bonus_7",
      points: 50,
      expires_at: expiresAt,
      metadata: { streak_days: newStreakDays, wat_date: todayWatStr },
    });
  }

  await supabaseAdmin
    .from("student_streaks")
    .update({
      current_streak_days: newStreakDays,
      last_active_date: todayWatStr,
      grace_used_in_window: graceUsed,
      window_start_date: windowStart.toISOString().split("T")[0],
      last_7_streak_awarded_at: last7Awarded,
      last_30_streak_awarded_at: last30Awarded,
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", studentId);

  return { current_streak_days: newStreakDays, bonus_awarded: bonusAwarded, grace_used: graceUsed };
}
