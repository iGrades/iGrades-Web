import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface WeeklySubjectMetric {
  subjectId: string;
  subjectName: string;
  accuracy: number;
  previousAccuracy: number | null;
  trend: "up" | "down" | "stable" | "new";
  trendDiff: number;
  questionsAttempted: number;
  questionsCorrect: number;
  sessionsCount: number;
  grade: string;
  gradeLabel: string;
  status: "strong" | "good" | "fair" | "needs_attention" | "not_started";
}

export interface WeeklyTopicInsight {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracy: number;
  totalQuestions: number;
  correctQuestions: number;
  incorrectQuestions: number;
  category: "improving" | "needs_practice" | "repeated_mistakes";
  reason: string;
}

export interface WeeklyRecommendation {
  id: string;
  title: string;
  action: string;
  type: "celebrate" | "practice" | "support" | "routine";
  badgeText: string;
}

export interface WeeklyReportData {
  studentId: string;
  studentName: string;
  studentClass: string;
  weekOffset: number; // 0 = current week, 1 = 1 week ago, etc.
  weekLabel: string; // e.g. "This Week (Aug 27 - Sep 2, 2026)"
  startDateFormatted: string;
  endDateFormatted: string;
  
  // 1. Did my child study?
  hasStudied: boolean;
  studyStatusSummary: string;

  // 2. How much did they study?
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalSessions: number;
  totalVideosWatched: number;
  studyStreakDays: number;
  estimatedStudyTimeMinutes: number; // in minutes

  // 3. Did their performance improve? (Comparison vs prior week)
  overallAccuracy: number;
  previousOverallAccuracy: number | null;
  accuracyDelta: number | null; // e.g. +8, -5, or null
  hasPriorWeekData: boolean;
  performanceTrend: "improved" | "declined" | "steady" | "first_week" | "no_activity";
  performanceTrendSummary: string;

  // Prior week metrics for comparative displays
  priorWeekMetrics?: {
    totalQuestions: number;
    totalSessions: number;
    accuracy: number;
    estimatedStudyTimeMinutes: number;
  };

  // 4. Subject Performance
  subjects: WeeklySubjectMetric[];
  strongestSubject: WeeklySubjectMetric | null;
  mostImprovedSubject: WeeklySubjectMetric | null;
  needsAttentionSubject: WeeklySubjectMetric | null;

  // 5. Topic Insights
  improvedTopics: WeeklyTopicInsight[];
  topicsRequiringPractice: WeeklyTopicInsight[];
  topicsWithRepeatedMistakes: WeeklyTopicInsight[];

  // 6. Actionable Parent Recommendations
  recommendations: WeeklyRecommendation[];

  // Quick Executive Answers for Parents
  executiveAnswers: {
    didStudy: { answer: string; detail: string; isPositive: boolean };
    studyVolume: { answer: string; detail: string; isPositive: boolean };
    improvement: { answer: string; detail: string; isPositive: boolean };
    doingWell: { answer: string; detail: string; isPositive: boolean };
    struggling: { answer: string; detail: string; isPositive: boolean };
    nextFocus: { answer: string; detail: string; isPositive: boolean };
  };
}

const getGradeData = (percentage: number) => {
  if (percentage >= 80) return { grade: "A", label: "Excellent" };
  if (percentage >= 70) return { grade: "B", label: "Very Good" };
  if (percentage >= 55) return { grade: "C", label: "Good" };
  if (percentage >= 40) return { grade: "D", label: "Fair" };
  if (percentage >= 30) return { grade: "E", label: "Needs Practice" };
  return { grade: "F", label: "Needs Assistance" };
};

/**
 * Returns date bounds for a 7-day sliding or calendar week based on offset.
 * offset = 0: current trailing 7 days
 * offset = 1: 7-14 days ago, etc.
 */
export const getWeekDateRange = (offset = 0) => {
  const now = new Date();
  // Set to end of today
  const end = new Date(now.getTime() - offset * 7 * 24 * 60 * 60 * 1000);
  end.setHours(23, 59, 59, 999);

  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);

  // Prior week for comparison
  const priorEnd = new Date(start.getTime() - 1);
  const priorStart = new Date(priorEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
  priorStart.setHours(0, 0, 0, 0);

  const formatShort = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  let label = "This Week";
  if (offset === 1) label = "Last Week";
  else if (offset > 1) label = `${offset} Weeks Ago`;

  return {
    start,
    end,
    priorStart,
    priorEnd,
    startDateFormatted: formatShort(start),
    endDateFormatted: formatShort(end),
    weekLabel: `${label} (${formatShort(start)} – ${formatShort(end)})`,
  };
};

export const useWeeklyLearningReport = (student: any | null, weekOffset = 0) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<WeeklyReportData | null>(null);

  const weekRange = useMemo(() => getWeekDateRange(weekOffset), [weekOffset]);

  const fetchWeeklyData = useCallback(async () => {
    if (!student?.id) {
      setReport(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const studentId = student.id;
      const studentFirstName = student.firstname || "Your child";
      const studentFullName = `${student.firstname || ""} ${student.lastname || ""}`.trim() || "Student";
      const studentClass = student.class || "Student";

      // 1. Fetch subjects catalog
      const { data: allSubjects } = await supabase
        .from("subjects")
        .select("id, name")
        .order("name", { ascending: true });

      const subjectMap = new Map<string, string>();
      (allSubjects || []).forEach((s) => subjectMap.set(s.id, s.name));

      // 2. Fetch topics catalog
      const { data: allTopics } = await supabase
        .from("topics")
        .select("id, name, subject_id");

      const topicMap = new Map<string, { name: string; subjectId: string }>();
      (allTopics || []).forEach((t) => {
        topicMap.set(t.id, { name: t.name, subjectId: t.subject_id });
      });

      // 3. Fetch completed attempts for this student
      const { data: allAttemptsData } = await supabase
        .from("attempts")
        .select("id, subject_id, score, status, started_at, created_at, updated_at")
        .eq("student_id", studentId)
        .eq("status", "completed")
        .order("started_at", { ascending: false });

      const allAttempts = allAttemptsData || [];

      // 4. Fetch quiz scores
      const { data: quizScoresData } = await supabase
        .from("quiz_scores")
        .select("attempt_id, subject_id, score, completed_at")
        .eq("student_id", studentId)
        .order("completed_at", { ascending: false });

      const quizScores = quizScoresData || [];

      // Unified session list with timestamp
      const allSessions: Array<{
        id: string;
        subjectId: string;
        score: number;
        date: Date;
      }> = [];

      allAttempts.forEach((a) => {
        if (a.score !== null && a.score !== undefined) {
          const rawDate = a.started_at || a.created_at || a.updated_at;
          if (rawDate) {
            allSessions.push({
              id: a.id,
              subjectId: a.subject_id,
              score: Number(a.score),
              date: new Date(rawDate),
            });
          }
        }
      });

      if (allSessions.length === 0 && quizScores.length > 0) {
        quizScores.forEach((qs) => {
          if (qs.score !== null && qs.score !== undefined) {
            allSessions.push({
              id: qs.attempt_id || Math.random().toString(),
              subjectId: qs.subject_id,
              score: Number(qs.score),
              date: new Date(qs.completed_at || Date.now()),
            });
          }
        });
      }

      // 5. Fetch attempt answers with question topic details
      const { data: attemptAnswersData } = await supabase
        .from("attempt_answers")
        .select(`
          id,
          attempt_id,
          question_id,
          selected_option,
          subject_id,
          created_at,
          questions (
            id,
            question_text,
            topic_id,
            subtopic_id,
            correct_option
          )
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(300);

      const attemptAnswers = (attemptAnswersData || []).map((ans: any) => ({
        ...ans,
        date: new Date(ans.created_at || Date.now()),
      }));

      // 6. Fetch video progress
      const { data: videoProgressData } = await supabase
        .from("video_progress")
        .select("id, video_id, progress, completed, last_watched, updated_at")
        .eq("student_id", studentId);

      const videoProgress = (videoProgressData || []).map((vp) => ({
        ...vp,
        date: new Date(vp.updated_at || vp.last_watched || Date.now()),
      }));

      // Filter data into Current Week Window and Prior Week Window
      const currentWeekSessions = allSessions.filter(
        (s) => s.date >= weekRange.start && s.date <= weekRange.end
      );

      const priorWeekSessions = allSessions.filter(
        (s) => s.date >= weekRange.priorStart && s.date <= weekRange.priorEnd
      );

      const currentWeekAnswers = attemptAnswers.filter(
        (a) => a.date >= weekRange.start && a.date <= weekRange.end
      );

      const currentWeekVideos = videoProgress.filter(
        (v) => v.date >= weekRange.start && v.date <= weekRange.end
      );

      // --- CALCULATE CORE METRICS ---
      const hasStudied = currentWeekSessions.length > 0 || currentWeekAnswers.length > 0 || currentWeekVideos.length > 0;

      // Questions attempted & correct
      let totalQuestionsAttempted = currentWeekAnswers.length;
      let totalQuestionsCorrect = currentWeekAnswers.filter((a) => {
        const q = a.questions;
        return (
          a.selected_option &&
          q?.correct_option &&
          a.selected_option.trim().toLowerCase() === q.correct_option.trim().toLowerCase()
        );
      }).length;

      // If answer records are sparse but session scores exist, estimate reliably
      if (totalQuestionsAttempted === 0 && currentWeekSessions.length > 0) {
        totalQuestionsAttempted = currentWeekSessions.length * 10;
        const avgScore = currentWeekSessions.reduce((acc, s) => acc + s.score, 0) / currentWeekSessions.length;
        totalQuestionsCorrect = Math.round((avgScore / 100) * totalQuestionsAttempted);
      }

      // Accuracy calculation for current week
      let overallAccuracy = 0;
      if (currentWeekSessions.length > 0) {
        const sum = currentWeekSessions.reduce((acc, s) => acc + s.score, 0);
        overallAccuracy = Math.round(sum / currentWeekSessions.length);
      } else if (totalQuestionsAttempted > 0) {
        overallAccuracy = Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100);
      }

      // Prior week accuracy & metrics
      let previousOverallAccuracy: number | null = null;
      let hasPriorWeekData = false;
      let accuracyDelta: number | null = null;

      if (priorWeekSessions.length > 0) {
        hasPriorWeekData = true;
        const priorSum = priorWeekSessions.reduce((acc, s) => acc + s.score, 0);
        previousOverallAccuracy = Math.round(priorSum / priorWeekSessions.length);
        if (hasStudied) {
          accuracyDelta = overallAccuracy - previousOverallAccuracy;
        }
      }

      // Estimated study time: ~1.5 minutes per quiz question + ~12 minutes per video session
      const estimatedStudyTimeMinutes = Math.round(
        totalQuestionsAttempted * 1.5 + currentWeekVideos.length * 12
      );

      // Study streak (active days with sessions/answers in the 7-day window)
      const activeDaysSet = new Set<string>();
      currentWeekSessions.forEach((s) => activeDaysSet.add(s.date.toDateString()));
      currentWeekAnswers.forEach((a) => activeDaysSet.add(a.date.toDateString()));
      currentWeekVideos.forEach((v) => activeDaysSet.add(v.date.toDateString()));
      const studyStreakDays = activeDaysSet.size;

      // Determine Performance Trend
      let performanceTrend: WeeklyReportData["performanceTrend"] = "no_activity";
      let performanceTrendSummary = "No practice sessions recorded for this timeframe.";

      if (hasStudied) {
        if (!hasPriorWeekData) {
          performanceTrend = "first_week";
          performanceTrendSummary = "Great initial learning momentum! This baseline will help track weekly growth.";
        } else if (accuracyDelta !== null) {
          if (accuracyDelta >= 4) {
            performanceTrend = "improved";
            performanceTrendSummary = `Performance improved by +${accuracyDelta}% compared to last week. Excellent work!`;
          } else if (accuracyDelta <= -4) {
            performanceTrend = "declined";
            performanceTrendSummary = `Average score adjusted by ${accuracyDelta}% compared to last week. Targeted practice on weak topics will help.`;
          } else {
            performanceTrend = "steady";
            performanceTrendSummary = "Steady performance maintained consistent with last week's benchmark.";
          }
        }
      }

      // --- SUBJECT PERFORMANCE BREAKDOWN ---
      // Group current and prior week by subject
      const subjectCurrentMap = new Map<string, typeof currentWeekSessions>();
      currentWeekSessions.forEach((s) => {
        if (!s.subjectId) return;
        const list = subjectCurrentMap.get(s.subjectId) || [];
        list.push(s);
        subjectCurrentMap.set(s.subjectId, list);
      });

      const subjectPriorMap = new Map<string, typeof priorWeekSessions>();
      priorWeekSessions.forEach((s) => {
        if (!s.subjectId) return;
        const list = subjectPriorMap.get(s.subjectId) || [];
        list.push(s);
        subjectPriorMap.set(s.subjectId, list);
      });

      // Also gather all active subjects from answers if sessions are grouped
      currentWeekAnswers.forEach((a) => {
        if (a.subject_id && !subjectCurrentMap.has(a.subject_id)) {
          subjectCurrentMap.set(a.subject_id, []);
        }
      });

      const subjectsList: WeeklySubjectMetric[] = [];

      subjectCurrentMap.forEach((sessions, subId) => {
        const subName = subjectMap.get(subId) || "Subject";
        const priorSessions = subjectPriorMap.get(subId) || [];
        const relatedAnswers = currentWeekAnswers.filter((a) => a.subject_id === subId);

        let subAccuracy = 0;
        const qAttempted = relatedAnswers.length > 0 ? relatedAnswers.length : sessions.length * 10;
        let qCorrect = relatedAnswers.filter((a) => {
          const q = a.questions;
          return a.selected_option && q?.correct_option && a.selected_option.trim().toLowerCase() === q.correct_option.trim().toLowerCase();
        }).length;

        if (sessions.length > 0) {
          const sum = sessions.reduce((acc, s) => acc + s.score, 0);
          subAccuracy = Math.round(sum / sessions.length);
          if (qCorrect === 0 && qAttempted > 0) {
            qCorrect = Math.round((subAccuracy / 100) * qAttempted);
          }
        } else if (qAttempted > 0) {
          subAccuracy = Math.round((qCorrect / qAttempted) * 100);
        }

        let prevAccuracy: number | null = null;
        let trend: "up" | "down" | "stable" | "new" = "new";
        let trendDiff = 0;

        if (priorSessions.length > 0) {
          const priorSum = priorSessions.reduce((acc, s) => acc + s.score, 0);
          prevAccuracy = Math.round(priorSum / priorSessions.length);
          trendDiff = subAccuracy - prevAccuracy;
          if (trendDiff >= 3) trend = "up";
          else if (trendDiff <= -3) trend = "down";
          else trend = "stable";
        }

        let status: WeeklySubjectMetric["status"] = "not_started";
        if (sessions.length > 0 || qAttempted > 0) {
          if (subAccuracy >= 75) status = "strong";
          else if (subAccuracy >= 60) status = "good";
          else if (subAccuracy >= 45) status = "fair";
          else status = "needs_attention";
        }

        const gradeObj = getGradeData(subAccuracy);

        subjectsList.push({
          subjectId: subId,
          subjectName: subName,
          accuracy: subAccuracy,
          previousAccuracy: prevAccuracy,
          trend,
          trendDiff,
          questionsAttempted: qAttempted,
          questionsCorrect: qCorrect,
          sessionsCount: sessions.length,
          grade: gradeObj.grade,
          gradeLabel: gradeObj.label,
          status,
        });
      });

      // Sort by accuracy descending
      subjectsList.sort((a, b) => b.accuracy - a.accuracy);

      // Identify Strongest, Most Improved, and Needs Attention
      const strongestSubject = subjectsList.length > 0 ? subjectsList[0] : null;
      
      const improvedSubjects = subjectsList.filter((s) => s.trend === "up" && s.previousAccuracy !== null);
      improvedSubjects.sort((a, b) => b.trendDiff - a.trendDiff);
      const mostImprovedSubject = improvedSubjects.length > 0 ? improvedSubjects[0] : null;

      const attentionSubjects = [...subjectsList].filter((s) => s.accuracy < 60 || s.trend === "down");
      attentionSubjects.sort((a, b) => a.accuracy - b.accuracy);
      const needsAttentionSubject = attentionSubjects.length > 0 ? attentionSubjects[0] : (
        subjectsList.length > 0 && subjectsList[subjectsList.length - 1].accuracy < 70
          ? subjectsList[subjectsList.length - 1]
          : null
      );

      // --- TOPIC INSIGHTS ---
      // Analyze topics attempted this week and compare with prior
      const currentTopicMap = new Map<string, {
        topicId: string;
        total: number;
        correct: number;
        subjectId: string;
      }>();

      currentWeekAnswers.forEach((ans) => {
        const q = ans.questions;
        if (!q || !q.topic_id) return;
        const topicId = q.topic_id;
        const cur = currentTopicMap.get(topicId) || {
          topicId,
          total: 0,
          correct: 0,
          subjectId: ans.subject_id || q.subject_id || "",
        };
        cur.total += 1;
        if (ans.selected_option && q.correct_option && ans.selected_option.trim().toLowerCase() === q.correct_option.trim().toLowerCase()) {
          cur.correct += 1;
        }
        currentTopicMap.set(topicId, cur);
      });

      const improvedTopics: WeeklyTopicInsight[] = [];
      const topicsRequiringPractice: WeeklyTopicInsight[] = [];
      const topicsWithRepeatedMistakes: WeeklyTopicInsight[] = [];

      currentTopicMap.forEach((stats) => {
        const topicInfo = topicMap.get(stats.topicId);
        const topicName = topicInfo?.name || "Topic Area";
        const subjectName = subjectMap.get(stats.subjectId || topicInfo?.subjectId || "") || "General Subject";
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        const incorrect = stats.total - stats.correct;

        // Topics with repeated mistakes: 2 or more incorrect questions
        if (incorrect >= 2) {
          topicsWithRepeatedMistakes.push({
            topicId: stats.topicId,
            topicName,
            subjectName,
            accuracy,
            totalQuestions: stats.total,
            correctQuestions: stats.correct,
            incorrectQuestions: incorrect,
            category: "repeated_mistakes",
            reason: `${incorrect} questions answered incorrectly in this topic area. Reviewing the core formulas or rules will build accuracy.`,
          });
        }

        // Topics requiring practice: accuracy < 60% with at least 2 attempts
        if (accuracy < 60 && stats.total >= 2) {
          topicsRequiringPractice.push({
            topicId: stats.topicId,
            topicName,
            subjectName,
            accuracy,
            totalQuestions: stats.total,
            correctQuestions: stats.correct,
            incorrectQuestions: incorrect,
            category: "needs_practice",
            reason: `Current topic accuracy is ${accuracy}%. A quick 5-question practice quiz will help boost confidence.`,
          });
        }

        // Topics showing improvement: accuracy >= 75%
        if (accuracy >= 75 && stats.total >= 2) {
          improvedTopics.push({
            topicId: stats.topicId,
            topicName,
            subjectName,
            accuracy,
            totalQuestions: stats.total,
            correctQuestions: stats.correct,
            incorrectQuestions: incorrect,
            category: "improving",
            reason: `Strong mastery demonstrated with ${accuracy}% correct across ${stats.total} questions!`,
          });
        }
      });

      // Sort lists
      improvedTopics.sort((a, b) => b.accuracy - a.accuracy);
      topicsRequiringPractice.sort((a, b) => a.accuracy - b.accuracy);
      topicsWithRepeatedMistakes.sort((a, b) => b.incorrectQuestions - a.incorrectQuestions);

      // --- DERIVE ACTIONABLE RECOMMENDATIONS ---
      const recommendations: WeeklyRecommendation[] = [];

      if (strongestSubject && strongestSubject.accuracy >= 70) {
        recommendations.push({
          id: "rec-celebrate",
          title: `Celebrate Excellence in ${strongestSubject.subjectName}`,
          action: `Acknowledge ${studentFirstName}'s strong ${strongestSubject.accuracy}% accuracy in ${strongestSubject.subjectName}. Celebrating their effort reinforces confidence and positive study habits.`,
          type: "celebrate",
          badgeText: "Celebrate Success",
        });
      }

      if (needsAttentionSubject && needsAttentionSubject.accuracy < 65) {
        recommendations.push({
          id: "rec-practice-weak",
          title: `Focus on ${needsAttentionSubject.subjectName} Practice`,
          action: `Encourage a relaxed 10-15 minute practice quiz in ${needsAttentionSubject.subjectName} this coming week. Remind ${studentFirstName} that practice makes tricky concepts feel natural.`,
          type: "practice",
          badgeText: "Recommended Practice",
        });
      } else if (topicsRequiringPractice.length > 0) {
        const topTopic = topicsRequiringPractice[0];
        recommendations.push({
          id: "rec-topic-practice",
          title: `Review ${topTopic.topicName}`,
          action: `Encourage reviewing the study notes or watching a quick video lesson for ${topTopic.topicName} in ${topTopic.subjectName}.`,
          type: "practice",
          badgeText: "Topic Target",
        });
      }

      if (mostImprovedSubject) {
        recommendations.push({
          id: "rec-improved",
          title: `Recognize Growth in ${mostImprovedSubject.subjectName}`,
          action: `${studentFirstName}'s score in ${mostImprovedSubject.subjectName} rose by +${mostImprovedSubject.trendDiff}% this week. Commend their persistence!`,
          type: "support",
          badgeText: "Growth Highlight",
        });
      }

      if (!hasStudied) {
        recommendations.push({
          id: "rec-kickstart",
          title: "Set a Gentle 15-Minute Daily Routine",
          action: `Study activity was lower this week. Establishing a comfortable, consistent 15-minute evening session will help ${studentFirstName} build positive study momentum without stress.`,
          type: "routine",
          badgeText: "Study Routine",
        });
      } else {
        recommendations.push({
          id: "rec-maintain-routine",
          title: "Maintain Weekly Practice Consistency",
          action: `Having regular, short quizzes throughout the week yields far better exam retention than long cramming sessions. Keep up the steady cadence!`,
          type: "routine",
          badgeText: "Consistency Tip",
        });
      }

      // --- COMPOSE 6 EXECUTIVE ANSWERS FOR PARENTS ---
      const studyStatusSummary = hasStudied
        ? `${studentFirstName} completed ${currentWeekSessions.length || 1} study sessions across ${subjectsList.length} subject${subjectsList.length === 1 ? "" : "s"}.`
        : `No practice activity was logged during this 7-day period.`;

      const executiveAnswers: WeeklyReportData["executiveAnswers"] = {
        didStudy: {
          answer: hasStudied ? "Yes, study activity was logged" : "No study sessions logged this week",
          detail: hasStudied
            ? `Active on ${studyStreakDays} day${studyStreakDays === 1 ? "" : "s"} with ${totalQuestionsAttempted} questions attempted.`
            : "Encouraging a quick 10-minute quiz this week will help restart their study rhythm.",
          isPositive: hasStudied,
        },
        studyVolume: {
          answer: hasStudied
            ? `${totalQuestionsAttempted} questions • ~${estimatedStudyTimeMinutes} mins study time`
            : "0 questions attempted",
          detail: hasStudied
            ? `${totalQuestionsCorrect} answered correctly (${overallAccuracy}% overall accuracy).`
            : "Setting a designated 15-minute practice slot can build consistent engagement.",
          isPositive: totalQuestionsAttempted >= 15,
        },
        improvement: {
          answer: !hasStudied
            ? "Pending next practice session"
            : !hasPriorWeekData
            ? "Baseline established (First active week)"
            : accuracyDelta !== null && accuracyDelta >= 0
            ? `+${accuracyDelta}% improvement vs last week`
            : `${accuracyDelta}% adjustment vs last week`,
          detail: performanceTrendSummary,
          isPositive: accuracyDelta !== null ? accuracyDelta >= 0 : hasStudied,
        },
        doingWell: {
          answer: strongestSubject
            ? `${strongestSubject.subjectName} (${strongestSubject.accuracy}% accuracy)`
            : "Ready to identify strengths",
          detail: improvedTopics.length > 0
            ? `Demonstrating solid mastery in ${improvedTopics[0].topicName}.`
            : strongestSubject
            ? `High accuracy achieved in ${strongestSubject.subjectName}.`
            : "Complete a few practice quizzes to highlight top subjects.",
          isPositive: !!strongestSubject,
        },
        struggling: {
          answer: needsAttentionSubject && needsAttentionSubject.accuracy < 65
            ? `${needsAttentionSubject.subjectName} (${needsAttentionSubject.accuracy}% accuracy)`
            : topicsWithRepeatedMistakes.length > 0
            ? `${topicsWithRepeatedMistakes[0].topicName}`
            : "No severe weak areas identified",
          detail: topicsWithRepeatedMistakes.length > 0
            ? `${topicsWithRepeatedMistakes[0].incorrectQuestions} questions missed in ${topicsWithRepeatedMistakes[0].topicName} (${topicsWithRepeatedMistakes[0].subjectName}).`
            : needsAttentionSubject
            ? `Targeting additional practice in ${needsAttentionSubject.subjectName} will yield quick improvements.`
            : "All attempted subject areas are performing within solid passing ranges.",
          isPositive: !needsAttentionSubject || needsAttentionSubject.accuracy >= 60,
        },
        nextFocus: {
          answer: recommendations.length > 0
            ? recommendations[0].title
            : "Complete 1 practice quiz this week",
          detail: recommendations.length > 0
            ? recommendations[0].action
            : `Support ${studentFirstName} by encouraging a short practice test.`,
          isPositive: true,
        },
      };

      setReport({
        studentId,
        studentName: studentFullName,
        studentClass,
        weekOffset,
        weekLabel: weekRange.weekLabel,
        startDateFormatted: weekRange.startDateFormatted,
        endDateFormatted: weekRange.endDateFormatted,
        hasStudied,
        studyStatusSummary,
        totalQuestionsAttempted,
        totalQuestionsCorrect,
        totalSessions: currentWeekSessions.length,
        totalVideosWatched: currentWeekVideos.length,
        studyStreakDays,
        estimatedStudyTimeMinutes,
        overallAccuracy,
        previousOverallAccuracy,
        accuracyDelta,
        hasPriorWeekData,
        performanceTrend,
        performanceTrendSummary,
        priorWeekMetrics: hasPriorWeekData
          ? {
              totalQuestions: priorWeekSessions.length * 10,
              totalSessions: priorWeekSessions.length,
              accuracy: previousOverallAccuracy ?? 0,
              estimatedStudyTimeMinutes: priorWeekSessions.length * 15,
            }
          : undefined,
        subjects: subjectsList,
        strongestSubject,
        mostImprovedSubject,
        needsAttentionSubject,
        improvedTopics: improvedTopics.slice(0, 5),
        topicsRequiringPractice: topicsRequiringPractice.slice(0, 5),
        topicsWithRepeatedMistakes: topicsWithRepeatedMistakes.slice(0, 5),
        recommendations,
        executiveAnswers,
      });
    } catch (err) {
      console.error("Error generating weekly parent report:", err);
    } finally {
      setLoading(false);
    }
  }, [student, weekRange, weekOffset]);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  return {
    report,
    loading,
    refreshReport: fetchWeeklyData,
    weekRange,
  };
};
