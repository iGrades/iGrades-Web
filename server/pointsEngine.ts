import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export interface PointsTransaction {
  id: string;
  student_id: string;
  type:
    | "login"
    | "quiz_first_attempt"
    | "streak_milestone_7"
    | "streak_milestone_30"
    | "conversion_debit";
  points: number;
  related_quiz_id?: string | null;
  score_percentage?: number | null;
  description: string;
  created_at: string;
  wat_date: string;
  expires_at: string | null;
  exempt_from_cap: boolean;
}

export interface CreditTransaction {
  id: string;
  student_id: string;
  type: "conversion_credit" | "subscription_debit";
  amount_naira: number;
  related_points_transaction_id?: string | null;
  related_invoice_id?: string | null;
  description: string;
  created_at: string;
}

export interface StudentStreak {
  student_id: string;
  current_streak_days: number;
  longest_streak: number;
  last_active_date: string; // WAT YYYY-MM-DD
  grace_used_in_window: boolean;
  window_start_date: string; // WAT YYYY-MM-DD
  milestone_7_awarded: boolean;
  milestone_30_awarded: boolean;
  updated_at: string;
}

interface PointsStoreData {
  points_transactions: PointsTransaction[];
  credit_transactions: CreditTransaction[];
  student_streaks: Record<string, StudentStreak>;
}

// WAT is UTC+1 (Fixed, Nigeria does not observe DST)
export function getWatDate(now = new Date()) {
  const watMillis = now.getTime() + 1 * 60 * 60 * 1000;
  const watDate = new Date(watMillis);
  const watDateStr = watDate.toISOString().slice(0, 10);
  const watYear = watDate.getUTCFullYear();
  const watMonth = watDate.getUTCMonth(); // 0 - 11
  const watDay = watDate.getUTCDate();
  const watHours = watDate.getUTCHours();
  return { watDateStr, watYear, watMonth, watDay, watHours };
}

export function getWatDateDiffDays(olderWatDateStr: string, newerWatDateStr: string): number {
  const d1 = new Date(olderWatDateStr + "T00:00:00Z");
  const d2 = new Date(newerWatDateStr + "T00:00:00Z");
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

// 12-Month Rolling Expiry: expires at the end of the 12th month after the month earned
export function calculatePointsExpiry(now = new Date()): string {
  const { watYear, watMonth } = getWatDate(now);
  // Month 0 in JS is January. Month (watMonth + 1) of year (watYear + 1) at day 0 is the last day of month watMonth in year watYear + 1
  const expiryDate = new Date(Date.UTC(watYear + 1, watMonth + 1, 0, 23, 59, 59, 999));
  return expiryDate.toISOString();
}

function generateId(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 11)
  );
}

class PointsEngine {
  private filePath: string;
  private data: PointsStoreData;
  private studentLocks: Map<string, Promise<void>> = new Map();
  private supabaseClient: ReturnType<typeof createClient> | null = null;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "points_ledger.json");
    this.data = this.loadData();

    // Supabase client for reading attempts if available
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
    const sbKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
    if (sbUrl && sbKey) {
      try {
        this.supabaseClient = createClient(sbUrl, sbKey);
      } catch (e) {
        console.warn("Could not init supabase client in PointsEngine:", e);
      }
    }
  }

  private loadData(): PointsStoreData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          points_transactions: Array.isArray(parsed.points_transactions) ? parsed.points_transactions : [],
          credit_transactions: Array.isArray(parsed.credit_transactions) ? parsed.credit_transactions : [],
          student_streaks: parsed.student_streaks || {},
        };
      }
    } catch (err) {
      console.error("Error reading points store file, starting empty:", err);
    }
    return {
      points_transactions: [],
      credit_transactions: [],
      student_streaks: {},
    };
  }

  private saveData(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = this.filePath + ".tmp";
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tmpPath, this.filePath);
    } catch (err) {
      console.error("Error saving points store file:", err);
    }
  }

  // Mutex per student to guarantee atomic race-free operations
  private async acquireLock(studentId: string): Promise<() => void> {
    while (this.studentLocks.has(studentId)) {
      await this.studentLocks.get(studentId);
    }
    let resolveLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    this.studentLocks.set(studentId, lockPromise);

    return () => {
      this.studentLocks.delete(studentId);
      resolveLock();
    };
  }

  // Active unexpired points balance
  public getPointsBalance(studentId: string): number {
    const now = new Date();
    const txs = this.data.points_transactions.filter((tx) => tx.student_id === studentId);
    const balance = txs.reduce((sum, tx) => {
      if (tx.points < 0) {
        // Debits always count against balance
        return sum + tx.points;
      }
      // Credits only count if not expired
      if (!tx.expires_at || new Date(tx.expires_at) > now) {
        return sum + tx.points;
      }
      return sum;
    }, 0);
    return Math.max(0, balance);
  }

  // Active unexpired points balance directly from Supabase
  public async getPointsBalanceAsync(studentId: string): Promise<number> {
    if (this.supabaseClient && studentId) {
      try {
        const { data, error } = await this.supabaseClient
          .from("student_points")
          .select("points_balance")
          .eq("student_id", studentId)
          .maybeSingle();

        if (!error && data && typeof data.points_balance === "number") {
          return data.points_balance;
        }
      } catch (err) {
        console.warn("Notice querying Supabase student_points in getPointsBalanceAsync:", err);
      }
    }
    return this.getPointsBalance(studentId);
  }

  // Active Naira store credit balance
  public getCreditBalance(studentId: string): number {
    const txs = this.data.credit_transactions.filter((tx) => tx.student_id === studentId);
    const balance = txs.reduce((sum, tx) => sum + (tx.amount_naira || 0), 0);
    return Math.max(0, balance);
  }

  // Daily earned points today in WAT (only capped earnings: login + quiz_first_attempt)
  public getDailyEarnedPoints(studentId: string, watDateStr?: string): number {
    const targetDate = watDateStr || getWatDate().watDateStr;
    const txs = this.data.points_transactions.filter(
      (tx) =>
        tx.student_id === studentId &&
        tx.wat_date === targetDate &&
        !tx.exempt_from_cap &&
        tx.points > 0
    );
    return txs.reduce((sum, tx) => sum + tx.points, 0);
  }

  // Streak information
  public getStudentStreak(studentId: string): StudentStreak {
    const existing = this.data.student_streaks[studentId];
    if (existing) return existing;
    return {
      student_id: studentId,
      current_streak_days: 0,
      longest_streak: 0,
      last_active_date: "",
      grace_used_in_window: false,
      window_start_date: "",
      milestone_7_awarded: false,
      milestone_30_awarded: false,
      updated_at: new Date().toISOString(),
    };
  }

  // Complete data bundle for client with Supabase sync
  public async getStudentPointsData(studentId: string) {
    let dbRecord: any = null;
    let dbHistory: any[] = [];

    if (this.supabaseClient && studentId) {
      try {
        const { data: sp, error: spErr } = await this.supabaseClient
          .from("student_points")
          .select("*")
          .eq("student_id", studentId)
          .maybeSingle();

        if (!spErr && sp) {
          dbRecord = sp;
        }

        const { data: hist, error: hErr } = await this.supabaseClient
          .from("points_history")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false })
          .limit(30);

        if (!hErr && hist) {
          dbHistory = hist;
        }
      } catch (err) {
        console.warn("Notice querying student_points from Supabase:", err);
      }
    }

    if (dbRecord) {
      this.data.student_streaks[studentId] = {
        student_id: studentId,
        current_streak_days: dbRecord.current_streak || 0,
        longest_streak: dbRecord.longest_streak || 0,
        last_active_date: dbRecord.last_login_date || "",
        grace_used_in_window: false,
        window_start_date: dbRecord.last_login_date || "",
        milestone_7_awarded: (dbRecord.longest_streak || 0) >= 7,
        milestone_30_awarded: (dbRecord.longest_streak || 0) >= 30,
        updated_at: dbRecord.updated_at || new Date().toISOString(),
      };
    }

    const pointsBalance = dbRecord ? dbRecord.points_balance : this.getPointsBalance(studentId);
    const creditBalance = this.getCreditBalance(studentId);
    const dailyEarned = this.getDailyEarnedPoints(studentId);
    const streakInfo = this.getStudentStreak(studentId);

    const pointsHistory = dbHistory.length > 0
      ? dbHistory.map((h) => ({
          id: h.id,
          student_id: h.student_id,
          type: h.reason,
          points: h.amount,
          description: h.description,
          created_at: h.created_at,
          wat_date: h.created_at ? h.created_at.slice(0, 10) : "",
          expires_at: null,
          exempt_from_cap: true,
        }))
      : this.data.points_transactions
          .filter((tx) => tx.student_id === studentId)
          .slice(-30)
          .reverse();

    const creditHistory = this.data.credit_transactions
      .filter((tx) => tx.student_id === studentId)
      .slice(-30)
      .reverse();

    return {
      pointsBalance,
      creditBalance,
      dailyEarned,
      streakInfo,
      pointsHistory,
      creditHistory,
    };
  }

  // Internal helper to update student streak and award milestone bonuses
  private updateStreakAndMilestones(
    studentId: string,
    watDateStr: string
  ): { streak: StudentStreak; milestoneAwarded: number } {
    let streak = this.data.student_streaks[studentId];
    if (!streak) {
      streak = {
        student_id: studentId,
        current_streak_days: 1,
        longest_streak: 1,
        last_active_date: watDateStr,
        grace_used_in_window: false,
        window_start_date: watDateStr,
        milestone_7_awarded: false,
        milestone_30_awarded: false,
        updated_at: new Date().toISOString(),
      };
      this.data.student_streaks[studentId] = streak;
    } else {
      if (streak.last_active_date === watDateStr) {
        // Already active today, streak unchanged
        return { streak, milestoneAwarded: 0 };
      }

      if (streak.last_active_date) {
        const diffDays = getWatDateDiffDays(streak.last_active_date, watDateStr);
        const windowDays = streak.window_start_date
          ? getWatDateDiffDays(streak.window_start_date, watDateStr)
          : 999;

        // Check if 7-day rolling window for grace protection has expired
        if (windowDays >= 7) {
          streak.grace_used_in_window = false;
          streak.window_start_date = watDateStr;
        }

        if (diffDays === 1) {
          // Consecutive active day
          streak.current_streak_days += 1;
        } else if (diffDays === 2) {
          // Exactly 1 missed day
          if (!streak.grace_used_in_window) {
            // Protected by grace
            streak.current_streak_days += 1;
            streak.grace_used_in_window = true;
          } else {
            // Grace already spent in this window -> reset
            streak.current_streak_days = 1;
            streak.grace_used_in_window = false;
            streak.window_start_date = watDateStr;
          }
        } else {
          // More than 1 day missed -> reset
          streak.current_streak_days = 1;
          streak.grace_used_in_window = false;
          streak.window_start_date = watDateStr;
        }
      } else {
        streak.current_streak_days = 1;
        streak.grace_used_in_window = false;
        streak.window_start_date = watDateStr;
      }

      streak.last_active_date = watDateStr;
      streak.longest_streak = Math.max(streak.longest_streak, streak.current_streak_days);
      streak.updated_at = new Date().toISOString();
    }

    let milestoneAwarded = 0;
    const nowIso = new Date().toISOString();
    const expiryIso = calculatePointsExpiry();

    // Check 7-Day Milestone (+50 iGG)
    if (streak.current_streak_days >= 7 && !streak.milestone_7_awarded) {
      milestoneAwarded += 50;
      streak.milestone_7_awarded = true;
      this.data.points_transactions.push({
        id: generateId(),
        student_id: studentId,
        type: "streak_milestone_7",
        points: 50,
        description: "🔥 7-Day Streak Milestone Bonus",
        created_at: nowIso,
        wat_date: watDateStr,
        expires_at: expiryIso,
        exempt_from_cap: true, // Milestone bonuses are exempt from the 100 pt cap
      });
    }

    // Check 30-Day Milestone (+250 iGG)
    if (streak.current_streak_days >= 30 && !streak.milestone_30_awarded) {
      milestoneAwarded += 250;
      streak.milestone_30_awarded = true;
      this.data.points_transactions.push({
        id: generateId(),
        student_id: studentId,
        type: "streak_milestone_30",
        points: 250,
        description: "🏆 30-Day Streak Milestone Bonus",
        created_at: nowIso,
        wat_date: watDateStr,
        expires_at: expiryIso,
        exempt_from_cap: true,
      });
    }

    return { streak, milestoneAwarded };
  }

  // 1. Process Daily Login (+5 iGG, subject to 100 pt cap)
  public async awardLogin(studentId: string) {
    const release = await this.acquireLock(studentId);
    try {
      const { watDateStr } = getWatDate();
      const nowIso = new Date().toISOString();
      const expiryIso = calculatePointsExpiry();

      // Fetch existing student_points record from Supabase
      let dbRecord: any = null;
      if (this.supabaseClient && studentId) {
        try {
          const { data, error } = await this.supabaseClient
            .from("student_points")
            .select("*")
            .eq("student_id", studentId)
            .maybeSingle();

          if (!error && data) {
            dbRecord = data;
          }
        } catch (e) {
          console.warn("Notice: could not query remote student_points table:", e);
        }
      }

      // Check if already claimed today in DB or in-memory ledger
      const alreadyClaimedInDb = dbRecord && dbRecord.last_login_date === watDateStr;
      const alreadyClaimedInMemory = this.data.points_transactions.some(
        (tx) =>
          tx.student_id === studentId &&
          tx.wat_date === watDateStr &&
          tx.type === "login"
      );

      const currentBalance = dbRecord ? dbRecord.points_balance : this.getPointsBalance(studentId);
      const currentStreak = dbRecord ? (dbRecord.current_streak || 0) : (this.data.student_streaks[studentId]?.current_streak_days || 0);
      const longestStreak = dbRecord ? (dbRecord.longest_streak || 0) : (this.data.student_streaks[studentId]?.longest_streak || 0);

      // Always process streak update on login activity
      const { streak, milestoneAwarded } = this.updateStreakAndMilestones(studentId, watDateStr);

      if (alreadyClaimedInDb || alreadyClaimedInMemory) {
        this.saveData();
        return {
          success: true,
          login_points_awarded: 0,
          milestone_points_awarded: milestoneAwarded,
          message: "Daily login bonus already claimed for today (WAT).",
          streak: {
            current_streak_days: currentStreak || streak.current_streak_days,
            longest_streak: longestStreak || streak.longest_streak,
            grace_used_in_window: streak.grace_used_in_window,
          },
          points_balance: currentBalance,
        };
      }

      // Check daily cap
      const todayEarned = this.getDailyEarnedPoints(studentId, watDateStr);
      let pointsToAward = 0;
      if (todayEarned < 100) {
        pointsToAward = Math.min(5, 100 - todayEarned);
      }

      const totalNewPoints = pointsToAward + milestoneAwarded;
      const newBalance = currentBalance + totalNewPoints;
      const newTotalEarned = (dbRecord?.total_earned || 0) + totalNewPoints;
      const finalStreakDays = Math.max(streak.current_streak_days, currentStreak + 1);
      const finalLongest = Math.max(longestStreak, finalStreakDays);

      // Persist to Supabase student_points and points_history
      if (this.supabaseClient && studentId) {
        try {
          const { error: upsertErr } = await this.supabaseClient
            .from("student_points")
            .upsert({
              student_id: studentId,
              points_balance: newBalance,
              total_earned: newTotalEarned,
              current_streak: finalStreakDays,
              longest_streak: finalLongest,
              last_login_date: watDateStr,
              updated_at: nowIso,
            }, { onConflict: "student_id" });

          if (upsertErr) {
            console.warn("Supabase student_points upsert error in awardLogin:", upsertErr);
          }

          const historyInserts: any[] = [];
          if (pointsToAward > 0) {
            historyInserts.push({
              student_id: studentId,
              amount: pointsToAward,
              reason: "daily_login",
              description: "🌟 Daily Login Bonus (+5 iGG Points)",
              balance_after: currentBalance + pointsToAward,
              created_at: nowIso,
            });
          }
          if (milestoneAwarded > 0) {
            historyInserts.push({
              student_id: studentId,
              amount: milestoneAwarded,
              reason: finalStreakDays >= 30 ? "streak_milestone_30" : "streak_milestone_7",
              description: finalStreakDays >= 30 ? "🏆 30-Day Streak Milestone Bonus" : "🔥 7-Day Streak Milestone Bonus",
              balance_after: newBalance,
              created_at: nowIso,
            });
          }

          if (historyInserts.length > 0) {
            const { error: histErr } = await this.supabaseClient
              .from("points_history")
              .insert(historyInserts);

            if (histErr) {
              console.warn("Supabase points_history insert error in awardLogin:", histErr);
            }
          }
        } catch (sbErr) {
          console.warn("Supabase write failed in awardLogin:", sbErr);
        }
      }

      if (pointsToAward > 0) {
        this.data.points_transactions.push({
          id: generateId(),
          student_id: studentId,
          type: "login",
          points: pointsToAward,
          description: "Daily Login Bonus",
          created_at: nowIso,
          wat_date: watDateStr,
          expires_at: expiryIso,
          exempt_from_cap: false,
        });
      }

      this.saveData();

      return {
        success: true,
        login_points_awarded: pointsToAward,
        milestone_points_awarded: milestoneAwarded,
        streak: {
          current_streak_days: finalStreakDays,
          longest_streak: finalLongest,
          grace_used_in_window: streak.grace_used_in_window,
        },
        points_balance: newBalance,
        daily_earned: this.getDailyEarnedPoints(studentId, watDateStr),
      };
    } finally {
      release();
    }
  }

  // 2. Process Quiz Completion Points (First Attempt Only)
  public async awardQuizCompletion(
    studentId: string,
    quizId: string,
    scorePercentage: number
  ) {
    const release = await this.acquireLock(studentId);
    try {
      const { watDateStr } = getWatDate();
      const nowIso = new Date().toISOString();
      const expiryIso = calculatePointsExpiry();

      let alreadyAwarded = false;
      let dbRecord: any = null;

      // Check in Supabase first
      if (this.supabaseClient && studentId) {
        try {
          const { data: sp } = await this.supabaseClient
            .from("student_points")
            .select("*")
            .eq("student_id", studentId)
            .maybeSingle();

          if (sp) dbRecord = sp;

          const { data: existingHistory } = await this.supabaseClient
            .from("points_history")
            .select("id")
            .eq("student_id", studentId)
            .eq("reason", "quiz_first_attempt")
            .ilike("description", `%${quizId}%`)
            .limit(1);

          if (existingHistory && existingHistory.length > 0) {
            alreadyAwarded = true;
          }
        } catch (dbErr) {
          console.warn("Notice: could not query remote points_history in awardQuizCompletion:", dbErr);
        }
      }

      // Check if points were already awarded for this quiz to this student in memory
      if (!alreadyAwarded) {
        alreadyAwarded = this.data.points_transactions.some(
          (tx) =>
            tx.student_id === studentId &&
            tx.type === "quiz_first_attempt" &&
            tx.related_quiz_id === quizId
        );
      }

      const currentBalance = dbRecord ? dbRecord.points_balance : this.getPointsBalance(studentId);

      if (alreadyAwarded) {
        return {
          success: true,
          points_awarded: 0,
          is_first_attempt: false,
          message: "Quiz retake: points are only awarded on your first attempt.",
          points_balance: currentBalance,
        };
      }

      // Check attempts in Supabase database if available
      if (this.supabaseClient && studentId) {
        try {
          const { data: previousAttempts } = await this.supabaseClient
            .from("attempts")
            .select("id, started_at, completed_at, status")
            .eq("student_id", studentId)
            .eq("quiz_id", quizId)
            .eq("status", "completed");

          // If there is more than 1 completed attempt in DB, this was a retake
          if (previousAttempts && previousAttempts.length > 1) {
            return {
              success: true,
              points_awarded: 0,
              is_first_attempt: false,
              message: "Quiz retake: points are only awarded on your first attempt.",
              points_balance: currentBalance,
            };
          }
        } catch (dbErr) {
          console.warn("Notice: could not query remote attempts table:", dbErr);
        }
      }

      // Base reward based on score:
      // 80-100% -> 30
      // 50-79% -> 20
      // < 50% -> 10
      let basePoints = 10;
      if (scorePercentage >= 80) {
        basePoints = 30;
      } else if (scorePercentage >= 50) {
        basePoints = 20;
      }

      // Daily 100 pt cap enforcement
      const todayEarned = this.getDailyEarnedPoints(studentId, watDateStr);
      let pointsToAward = 0;
      if (todayEarned < 100) {
        pointsToAward = Math.min(basePoints, 100 - todayEarned);
      }

      const newBalance = currentBalance + pointsToAward;
      const newTotalEarned = (dbRecord?.total_earned || 0) + pointsToAward;

      // Persist to Supabase
      if (this.supabaseClient && studentId && pointsToAward > 0) {
        try {
          await this.supabaseClient
            .from("student_points")
            .upsert({
              student_id: studentId,
              points_balance: newBalance,
              total_earned: newTotalEarned,
              updated_at: nowIso,
            }, { onConflict: "student_id" });

          await this.supabaseClient
            .from("points_history")
            .insert({
              student_id: studentId,
              amount: pointsToAward,
              reason: "quiz_first_attempt",
              description: `🎯 Quiz Completion (${scorePercentage}% Score) [${quizId}]`,
              balance_after: newBalance,
              created_at: nowIso,
            });
        } catch (e) {
          console.warn("Supabase write in awardQuizCompletion failed:", e);
        }
      }

      if (pointsToAward > 0) {
        this.data.points_transactions.push({
          id: generateId(),
          student_id: studentId,
          type: "quiz_first_attempt",
          points: pointsToAward,
          related_quiz_id: quizId,
          score_percentage: scorePercentage,
          description: `Quiz First Attempt (${scorePercentage}% Score)`,
          created_at: nowIso,
          wat_date: watDateStr,
          expires_at: expiryIso,
          exempt_from_cap: false,
        });
      }

      // Activity also updates streak
      const { streak, milestoneAwarded } = this.updateStreakAndMilestones(studentId, watDateStr);

      this.saveData();

      return {
        success: true,
        points_awarded: pointsToAward,
        milestone_points_awarded: milestoneAwarded,
        is_first_attempt: true,
        cap_reached: todayEarned + pointsToAward >= 100,
        streak: {
          current_streak_days: streak.current_streak_days,
          longest_streak: streak.longest_streak,
        },
        points_balance: newBalance,
        daily_earned: this.getDailyEarnedPoints(studentId, watDateStr),
      };
    } finally {
      release();
    }
  }

  // 3. Convert Points to Naira Store Credit (Atomic, 100 pts = ₦1,000)
  public async convertPoints(studentId: string, pointsToConvert: number) {
    const release = await this.acquireLock(studentId);
    try {
      const nowIso = new Date().toISOString();
      let currentBalance = this.getPointsBalance(studentId);

      // Check remote Supabase balance first
      if (this.supabaseClient && studentId) {
        try {
          const { data } = await this.supabaseClient
            .from("student_points")
            .select("*")
            .eq("student_id", studentId)
            .maybeSingle();
          if (data && typeof data.points_balance === "number") {
            currentBalance = data.points_balance;
          }
        } catch (e) {
          console.warn("Supabase fetch balance in convertPoints:", e);
        }
      }

      if (pointsToConvert < 100) {
        throw new Error("Minimum 100 iGG points required to convert.");
      }
      if (pointsToConvert % 100 !== 0) {
        throw new Error("Points must be converted in increments of 100.");
      }
      if (currentBalance < pointsToConvert) {
        throw new Error(`Insufficient points balance. Available: ${currentBalance}`);
      }

      // 100 points = ₦1,000 (i.e. 1 point = ₦10)
      const nairaCredit = (pointsToConvert / 100) * 1000;
      const newBalance = currentBalance - pointsToConvert;
      const pointsTxId = generateId();
      const creditTxId = generateId();

      // Persist to Supabase
      if (this.supabaseClient && studentId) {
        try {
          await this.supabaseClient
            .from("student_points")
            .upsert({
              student_id: studentId,
              points_balance: newBalance,
              updated_at: nowIso,
            }, { onConflict: "student_id" });

          await this.supabaseClient
            .from("points_history")
            .insert({
              student_id: studentId,
              amount: -pointsToConvert,
              reason: "conversion_debit",
              description: `Converted ${pointsToConvert} iGG Points to ₦${nairaCredit.toLocaleString()} Store Credit`,
              balance_after: newBalance,
              created_at: nowIso,
            });
        } catch (e) {
          console.warn("Supabase write in convertPoints:", e);
        }
      }

      // Atomic Ledger Operations in memory:
      // 1. Debit points
      this.data.points_transactions.push({
        id: pointsTxId,
        student_id: studentId,
        type: "conversion_debit",
        points: -pointsToConvert,
        description: `Converted ${pointsToConvert} iGG Points to ₦${nairaCredit.toLocaleString()} Store Credit`,
        created_at: nowIso,
        wat_date: getWatDate().watDateStr,
        expires_at: null,
        exempt_from_cap: true,
      });

      // 2. Credit store credit
      this.data.credit_transactions.push({
        id: creditTxId,
        student_id: studentId,
        type: "conversion_credit",
        amount_naira: nairaCredit,
        related_points_transaction_id: pointsTxId,
        description: `Credit from converting ${pointsToConvert} iGG Points`,
        created_at: nowIso,
      });

      this.saveData();

      return {
        success: true,
        points_converted: pointsToConvert,
        naira_credit_added: nairaCredit,
        new_points_balance: newBalance,
        new_credit_balance: this.getCreditBalance(studentId),
      };
    } finally {
      release();
    }
  }

  // 4. Apply Store Credit to Invoice / Subscription
  public async applyCredit(
    studentId: string,
    invoiceAmountNaira: number,
    invoiceId?: string
  ) {
    const release = await this.acquireLock(studentId);
    try {
      const nowIso = new Date().toISOString();
      const currentCredit = this.getCreditBalance(studentId);

      if (currentCredit <= 0) {
        return {
          success: true,
          credit_applied_naira: 0,
          remaining_invoice_amount: invoiceAmountNaira,
          message: "No store credit available.",
        };
      }

      const creditToApply = Math.min(currentCredit, invoiceAmountNaira);
      const remainingInvoice = Math.max(0, invoiceAmountNaira - creditToApply);

      if (creditToApply > 0) {
        this.data.credit_transactions.push({
          id: generateId(),
          student_id: studentId,
          type: "subscription_debit",
          amount_naira: -creditToApply,
          related_invoice_id: invoiceId || `inv-${Date.now()}`,
          description: `Applied ₦${creditToApply.toLocaleString()} store credit to subscription`,
          created_at: nowIso,
        });

        this.saveData();
      }

      return {
        success: true,
        credit_applied_naira: creditToApply,
        remaining_invoice_amount: remainingInvoice,
        new_credit_balance: this.getCreditBalance(studentId),
      };
    } finally {
      release();
    }
  }
}

export const pointsEngine = new PointsEngine();
