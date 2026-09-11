// src/services/learningIntelligence/useLearningIntelligence.ts
// Reusable React hook for accessing authoritative learning intelligence across all portals

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { computeLearningIntelligence } from "./aggregator";
import type { LearningIntelligenceReport, RawLearningInput } from "./types";

interface CacheEntry {
  report: LearningIntelligenceReport;
  timestamp: number;
}

// In-memory cache keyed by studentId to prevent duplicate network requests across components
const intelligenceCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function useLearningIntelligence(studentId?: string, studentClass?: string) {
  const [intelligence, setIntelligence] = useState<LearningIntelligenceReport | null>(() => {
    if (studentId && intelligenceCache.has(studentId)) {
      const entry = intelligenceCache.get(studentId)!;
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
        return entry.report;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!intelligence && Boolean(studentId));
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchIntelligence = useCallback(
    async (forceRefresh = false) => {
      if (!studentId) {
        setIntelligence(null);
        setLoading(false);
        return;
      }

      // Check cache unless force refresh
      if (!forceRefresh && intelligenceCache.has(studentId)) {
        const cached = intelligenceCache.get(studentId)!;
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
          setIntelligence(cached.report);
          setLoading(false);
          return;
        }
      }

      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        // Parallel queries to fetch authoritative learning records in a single batch
        const [
          subjectsRes,
          topicsRes,
          attemptsRes,
          answersRes,
          videosRes,
          quizScoresRes,
          studentMetaRes,
        ] = await Promise.allSettled([
          supabase.from("subjects").select("id, name").order("name"),
          supabase.from("topics").select("id, name, subject_id"),
          supabase
            .from("attempts")
            .select("id, student_id, subject_id, quiz_id, score, total_questions, status, started_at, completed_at, mode")
            .eq("student_id", studentId),
          supabase
            .from("attempt_answers")
            .select("id, attempt_id, question_id, student_id, selected_option, created_at, questions(id, question_text, topic_id, subject_id, correct_option)")
            .eq("student_id", studentId)
            .limit(1000),
          supabase
            .from("video_progress")
            .select("id, video_id, student_id, completed, progress, updated_at")
            .eq("student_id", studentId),
          supabase
            .from("quiz_scores")
            .select("attempt_id, student_id, subject_id, score, completed_at")
            .eq("student_id", studentId),
          supabase
            .from("students")
            .select("id, firstname, lastname, class, registered_courses")
            .eq("id", studentId)
            .maybeSingle(),
        ]);

        const subjects = subjectsRes.status === "fulfilled" ? subjectsRes.value.data || [] : [];
        const topics = topicsRes.status === "fulfilled" ? topicsRes.value.data || [] : [];
        const rawAttempts = attemptsRes.status === "fulfilled" ? attemptsRes.value.data || [] : [];
        const rawAnswers = answersRes.status === "fulfilled" ? answersRes.value.data || [] : [];
        const videoProgress = videosRes.status === "fulfilled" ? videosRes.value.data || [] : [];
        const quizScores = quizScoresRes.status === "fulfilled" ? quizScoresRes.value.data || [] : [];
        const studentMeta = studentMetaRes.status === "fulfilled" ? studentMetaRes.value.data : null;

        // Correctly calculate answer correctness from question's correct_option
        const attemptAnswers = rawAnswers.map((ans: any) => {
          const isCorrect = (ans.is_correct !== undefined && ans.is_correct !== null)
            ? (ans.is_correct === true || ans.is_correct === "true" || ans.is_correct === 1)
            : (ans.selected_option && ans.questions?.correct_option
                ? ans.selected_option.trim().toUpperCase() === ans.questions.correct_option.trim().toUpperCase()
                : false);

          return {
            ...ans,
            is_correct: isCorrect,
          };
        });

        // Compute answer accuracy per attempt to heal any stale 0 scores in attempts table
        const answersByAttempt = new Map<string, { total: number; correct: number }>();
        attemptAnswers.forEach((ans) => {
          if (!ans.attempt_id) return;
          const curr = answersByAttempt.get(ans.attempt_id) || { total: 0, correct: 0 };
          curr.total += 1;
          if (ans.is_correct) curr.correct += 1;
          answersByAttempt.set(ans.attempt_id, curr);
        });

        const quizScoresByAttempt = new Map<string, number>();
        quizScores.forEach((qs) => {
          if (qs.attempt_id && qs.score !== null && qs.score !== undefined) {
            quizScoresByAttempt.set(qs.attempt_id, Number(qs.score));
          }
        });

        // Harmonize attempts data
        const attempts = rawAttempts.map((att: any) => {
          let score = Number(att.score) || 0;
          const qsScore = quizScoresByAttempt.get(att.id);
          const ansData = answersByAttempt.get(att.id);

          if (score <= 0 && qsScore !== undefined && qsScore > 0) {
            score = qsScore;
          } else if (score <= 0 && ansData && ansData.total > 0) {
            score = Math.round((ansData.correct / ansData.total) * 100);
          }

          // If attempt has completed_at or answers, ensure it is treated as completed
          const status = att.status === "completed" || att.completed_at || (ansData && ansData.total > 0)
            ? "completed"
            : att.status;

          return {
            ...att,
            score,
            status,
          };
        });

        const effectiveClass = studentClass || studentMeta?.class || "Secondary";
        const studentFullName = studentMeta?.firstname
          ? `${studentMeta.firstname} ${studentMeta.lastname || ""}`.trim()
          : undefined;

        const rawInput: RawLearningInput = {
          studentId,
          studentName: studentFullName,
          studentClass: effectiveClass,
          registeredCourses: studentMeta?.registered_courses,
          subjects,
          topics,
          attempts,
          attemptAnswers: attemptAnswers as any,
          videoProgress,
          currentStreakDays: 0,
          lastActiveDate: attempts.find((a: any) => a.completed_at || a.started_at)?.completed_at || null,
        };

        const report = computeLearningIntelligence(rawInput);

        // Update in-memory cache
        intelligenceCache.set(studentId, {
          report,
          timestamp: Date.now(),
        });

        setIntelligence(report);
      } catch (err: any) {
        console.error("Failed to load learning intelligence:", err);
        setError(err?.message || "Failed to derive learning intelligence");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [studentId, studentClass]
  );

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const refresh = useCallback(() => fetchIntelligence(true), [fetchIntelligence]);

  return {
    intelligence,
    loading,
    error,
    refresh,
  };
}
