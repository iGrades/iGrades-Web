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
          streakRes,
          studentMetaRes,
        ] = await Promise.allSettled([
          supabase.from("subjects").select("id, name, class_id").order("name"),
          supabase.from("topics").select("id, name, subject_id"),
          supabase
            .from("attempts")
            .select("id, student_id, subject_id, quiz_id, score, total_questions, status, started_at, completed_at, is_mock")
            .eq("student_id", studentId),
          supabase
            .from("attempt_answers")
            .select("id, attempt_id, question_id, student_id, selected_option, is_correct, time_spent_seconds, created_at, questions(id, question_text, topic_id, subject_id)")
            .eq("student_id", studentId)
            .limit(1000),
          supabase
            .from("video_progress")
            .select("id, resource_id, student_id, completed, progress, updated_at")
            .eq("student_id", studentId),
          supabase
            .from("student_streaks")
            .select("current_streak_days, last_active_date")
            .eq("student_id", studentId)
            .maybeSingle(),
          supabase
            .from("students")
            .select("id, firstname, lastname, class, grade_level")
            .eq("id", studentId)
            .maybeSingle(),
        ]);

        const subjects = subjectsRes.status === "fulfilled" ? subjectsRes.value.data || [] : [];
        const topics = topicsRes.status === "fulfilled" ? topicsRes.value.data || [] : [];
        const attempts = attemptsRes.status === "fulfilled" ? attemptsRes.value.data || [] : [];
        const attemptAnswers = answersRes.status === "fulfilled" ? answersRes.value.data || [] : [];
        const videoProgress = videosRes.status === "fulfilled" ? videosRes.value.data || [] : [];
        const streakData = streakRes.status === "fulfilled" ? streakRes.value.data : null;
        const studentMeta = studentMetaRes.status === "fulfilled" ? studentMetaRes.value.data : null;

        const effectiveClass = studentClass || studentMeta?.class || studentMeta?.grade_level || "Secondary";
        const studentFullName = studentMeta?.firstname
          ? `${studentMeta.firstname} ${studentMeta.lastname || ""}`.trim()
          : undefined;

        const rawInput: RawLearningInput = {
          studentId,
          studentName: studentFullName,
          studentClass: effectiveClass,
          subjects,
          topics,
          attempts,
          attemptAnswers: attemptAnswers as any,
          videoProgress,
          currentStreakDays: streakData?.current_streak_days || 0,
          lastActiveDate: streakData?.last_active_date || null,
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
