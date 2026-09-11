// src/parent-app/hooks/useParentIntelligence.ts
// Reusable hook for Parent Intelligence, backed by the unified Learning Intelligence Engine

import { useMemo } from "react";
import { useLearningIntelligence } from "@/services/learningIntelligence";
import { parseRegisteredCourses, isSubjectRegistered, getSubjectDisplayName } from "@/utils/subjectMatching";

export interface SubjectIntelligence {
  subjectId: string;
  subjectName: string;
  accuracy: number; // percentage (0-100)
  previousAccuracy: number | null;
  trend: "up" | "down" | "stable" | "new";
  trendDiff: number; // e.g. +8 or -4
  questionsAttempted: number;
  sessionsCount: number;
  status: "strong" | "good" | "needs_attention" | "fair" | "not_started";
  lastActivity: string | null;
  grade: string;
  gradeLabel: string;
}

export interface TopicWeakness {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracy: number;
  totalQuestions: number;
  incorrectQuestions: number;
}

export interface TopicStrength {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracy: number;
  totalQuestions: number;
}

export interface ActivityItem {
  id: string;
  type: "quiz" | "video" | "practice";
  title: string;
  subtitle: string;
  score?: number;
  timestamp: string;
  formattedDate: string;
  passed?: boolean;
}

export interface ProgressTrendPoint {
  id?: string;
  period: string;
  dateLabel?: string;
  timeLabel?: string;
  fullDate?: string;
  averageScore: number;
  score?: number;
  attemptsCount: number;
  subjectId?: string;
  subjectName?: string;
  totalQuestions?: number;
  scoreDelta?: number;
  grade?: string;
  gradeLabel?: string;
  completedAt?: string;
  isRegistered?: boolean;
}

export interface StudentIntelligence {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  className: string;
  schoolName: string;
  examTarget: string;
  overallAccuracy: number;
  previousOverallAccuracy: number | null;
  overallTrend: "up" | "down" | "stable" | "new";
  overallTrendDiff: number;
  overallGrade: string;
  overallGradeLabel: string;
  learningStatus: "Active Learner" | "Consistent Pacing" | "Needs Practice Boost" | "Getting Started";
  totalQuestionsAnswered: number;
  totalPracticeSessions: number;
  totalVideosWatched: number;
  studyStreakDays: number;
  lastActiveDate: string | null;

  // Sections
  subjects: SubjectIntelligence[];
  strengths: {
    highlight: string;
    description: string;
    topSubjects: SubjectIntelligence[];
    topTopics: TopicStrength[];
  };
  areasForAttention: {
    highlight: string;
    description: string;
    strugglingSubjects: SubjectIntelligence[];
    strugglingTopics: TopicWeakness[];
  };
  needsAttentionAlerts: Array<{
    id: string;
    title: string;
    message: string;
    severity: "warning" | "info" | "positive";
  }>;
  parentRecommendations: Array<{
    id: string;
    title: string;
    action: string;
    category: "support" | "celebrate" | "practice" | "routine";
  }>;
  recentActivities: ActivityItem[];
  trendHistory: ProgressTrendPoint[];
  hasData: boolean;
}

const getGradeData = (percentage: number) => {
  if (percentage >= 80) return { grade: "A", label: "Excellent" };
  if (percentage >= 70) return { grade: "B", label: "Very Good" };
  if (percentage >= 55) return { grade: "C", label: "Good" };
  if (percentage >= 40) return { grade: "D", label: "Fair" };
  if (percentage >= 30) return { grade: "E", label: "Poor" };
  return { grade: "F", label: "Needs Help" };
};

const formatTimeAgo = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
};

export const useParentIntelligence = (student: any | null) => {
  const studentId = student?.id;
  const studentClass = student?.class;

  const { intelligence: core, loading, refresh } = useLearningIntelligence(studentId, studentClass);

  const intelligence = useMemo<StudentIntelligence | null>(() => {
    if (!student || !core) return null;

    const overallGradeObj = getGradeData(core.activity.overallAccuracy);

    // Map trends
    let mappedTrend: StudentIntelligence["overallTrend"] = "stable";
    if (core.trends.direction === "improving") mappedTrend = "up";
    else if (core.trends.direction === "declining") mappedTrend = "down";
    else if (core.trends.direction === "new") mappedTrend = "new";

    // Map learning status
    let learningStatus: StudentIntelligence["learningStatus"] = "Getting Started";
    if (core.activity.consistencyRating === "Active & Consistent") {
      learningStatus = "Active Learner";
    } else if (core.activity.consistencyRating === "Steady Pacing") {
      learningStatus = "Consistent Pacing";
    } else if (core.activity.totalQuestionsAttempted > 0 && core.activity.overallAccuracy < 55) {
      learningStatus = "Needs Practice Boost";
    }

    // Map subjects
    const subjectsList: SubjectIntelligence[] = core.subjects.map((sub) => {
      const gradeObj = getGradeData(sub.accuracy);
      let trendMapped: SubjectIntelligence["trend"] = "stable";
      if (sub.trend === "improving") trendMapped = "up";
      else if (sub.trend === "declining") trendMapped = "down";
      else if (sub.trend === "new") trendMapped = "new";

      let status: SubjectIntelligence["status"] = "not_started";
      if (sub.totalQuestions === 0 && sub.attemptsCount === 0) {
        status = "not_started";
      } else if (sub.accuracy >= 75) {
        status = "strong";
      } else if (sub.accuracy >= 60) {
        status = "good";
      } else if (sub.accuracy >= 45) {
        status = "fair";
      } else {
        status = "needs_attention";
      }

      return {
        subjectId: sub.subjectId,
        subjectName: getSubjectDisplayName(sub.subjectName),
        accuracy: sub.accuracy,
        previousAccuracy: Math.max(0, sub.accuracy - sub.trendDelta),
        trend: trendMapped,
        trendDiff: sub.trendDelta,
        questionsAttempted: sub.totalQuestions,
        sessionsCount: sub.attemptsCount,
        status,
        lastActivity: sub.attemptsCount > 0 ? "Recently" : null,
        grade: gradeObj.grade,
        gradeLabel: gradeObj.label,
      };
    });

    // Ensure ONLY subjects the student has registered are displayed in the parent portal
    const registeredRaw = student?.registered_courses ?? core.registeredCourses;
    const registeredList = parseRegisteredCourses(registeredRaw);
    const displayedSubjects = registeredList.length > 0
      ? subjectsList.filter((sub) => isSubjectRegistered(sub, registeredList))
      : subjectsList;

    const activeSubjects = displayedSubjects.filter((s) => s.questionsAttempted > 0 || s.sessionsCount > 0);
    const topSubjects = [...activeSubjects].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
    const strugglingSubjects = [...activeSubjects].filter((s) => s.status === "needs_attention").slice(0, 3);

    const topTopics: TopicStrength[] = core.masteredTopics.slice(0, 4).map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      subjectName: t.subjectName,
      accuracy: t.accuracy,
      totalQuestions: t.questionsAttempted,
    }));

    const strugglingTopics: TopicWeakness[] = core.weakTopics.slice(0, 4).map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      subjectName: t.subjectName,
      accuracy: t.accuracy,
      totalQuestions: t.questionsAttempted,
      incorrectQuestions: Math.max(1, t.questionsAttempted - t.correctCount),
    }));

    // Strengths text
    const strengthsHighlight = topSubjects.length > 0
      ? `Excelling in ${topSubjects[0].subjectName}`
      : "Building Foundational Knowledge";
    const strengthsDescription = topSubjects.length > 0
      ? `${student.firstname || "Your child"} is demonstrating solid mastery with ${topSubjects[0].accuracy}% accuracy in ${topSubjects[0].subjectName}.`
      : "Complete more practice quizzes to discover academic strengths.";

    // Attention text
    const attentionHighlight = strugglingTopics.length > 0
      ? `Needs Focus on ${strugglingTopics[0].topicName}`
      : "No Critical Weaknesses Identified";
    const attentionDescription = strugglingTopics.length > 0
      ? `Scored ${strugglingTopics[0].accuracy}% in ${strugglingTopics[0].topicName} (${strugglingTopics[0].subjectName}). Reviewing this concept will directly raise overall scores.`
      : "Performance is steady across all tested subjects.";

    // Alerts
    const alerts: StudentIntelligence["needsAttentionAlerts"] = [];
    if (strugglingTopics.length > 0) {
      alerts.push({
        id: "alert-topic",
        title: `Topic Attention: ${strugglingTopics[0].topicName}`,
        message: `${student.firstname || "Your child"} encountered difficulty in ${strugglingTopics[0].topicName}. Recommend having them review with Spark or take a short practice quiz.`,
        severity: "warning",
      });
    }
    if (core.activity.currentStreakDays >= 3) {
      alerts.push({
        id: "alert-streak",
        title: `Impressive ${core.activity.currentStreakDays}-Day Study Streak`,
        message: `${student.firstname || "Your child"} has maintained continuous study habits. Acknowledging this dedication reinforces learning momentum.`,
        severity: "positive",
      });
    }

    // Parent Recommendations: Use simplified, parent-oriented plain language without technical clutter
    const recommendations: StudentIntelligence["parentRecommendations"] = core.recommendations.map((r) => ({
      id: r.id,
      title: r.type === "review" ? `Priority Review: ${r.topicName || r.subjectName}` : r.title,
      action: r.parentSummary || r.description,
      category: r.actionType === "diagnose_weakness" ? "support" : r.type === "goal" ? "celebrate" : "practice",
    }));

    // Build real chronological attempt trend points
    const timeline = core.attemptTimeline || [];
    const registeredTimeline = registeredList.length > 0
      ? timeline.filter((pt) => isSubjectRegistered({ subjectId: pt.subjectId, subjectName: pt.subjectName }, registeredList))
      : timeline;

    let trendHistory: ProgressTrendPoint[] = [];

    if (registeredTimeline.length > 0) {
      trendHistory = registeredTimeline.map((pt, idx) => {
        const prevScore = idx > 0 ? registeredTimeline[idx - 1].score : null;
        const scoreDelta = prevScore !== null ? pt.score - prevScore : 0;
        const gradeInfo = getGradeData(pt.score);

        return {
          id: pt.attemptId,
          period: pt.displayLabel,
          dateLabel: pt.dateLabel,
          timeLabel: pt.timeLabel,
          fullDate: pt.completedAt ? new Date(pt.completedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : pt.displayLabel,
          averageScore: pt.score,
          score: pt.score,
          attemptsCount: 1,
          subjectId: pt.subjectId,
          subjectName: pt.subjectName,
          totalQuestions: pt.totalQuestions,
          scoreDelta,
          grade: gradeInfo.grade,
          gradeLabel: gradeInfo.label,
          completedAt: pt.completedAt,
          isRegistered: pt.isRegistered,
        };
      });
    } else if (core.trends.recentAttemptsCount > 0 || core.trends.historicalAttemptsCount > 0) {
      // Fallback only if no detailed timeline rows exist but trend counts exist
      trendHistory = [
        {
          period: "Baseline",
          averageScore: core.trends.baselineAccuracy,
          score: core.trends.baselineAccuracy,
          attemptsCount: core.trends.historicalAttemptsCount || 1,
        },
        {
          period: "Recent",
          averageScore: core.trends.recentAccuracy,
          score: core.trends.recentAccuracy,
          attemptsCount: core.trends.recentAttemptsCount || 1,
        },
      ];
    }

    // Real recent activities from attempts
    let recentActivities: ActivityItem[] = [];
    if (registeredTimeline.length > 0) {
      const recentAttempts = [...registeredTimeline].reverse().slice(0, 5);
      recentActivities = recentAttempts.map((att) => ({
        id: `act-${att.attemptId}`,
        type: "quiz",
        title: `${att.subjectName} Practice Quiz`,
        subtitle: `Scored ${att.score}%${att.totalQuestions ? ` across ${att.totalQuestions} questions` : ""}`,
        score: att.score,
        timestamp: att.completedAt || new Date().toISOString(),
        formattedDate: att.completedAt ? formatTimeAgo(att.completedAt) : "Recently",
        passed: att.score >= 50,
      }));
    } else {
      recentActivities = [
        {
          id: "act-latest-quiz",
          type: "quiz",
          title: core.readiness.keyFocusSubject ? `${core.readiness.keyFocusSubject} Quiz` : "Practice Session",
          subtitle: `Overall accuracy ${core.activity.overallAccuracy}% across ${core.activity.totalQuestionsAttempted} questions`,
          score: core.activity.overallAccuracy,
          timestamp: core.activity.lastActiveDate || new Date().toISOString(),
          formattedDate: core.activity.lastActiveDate ? formatTimeAgo(core.activity.lastActiveDate) : "Recent",
          passed: core.activity.overallAccuracy >= 50,
        },
      ];
    }

    return {
      studentId: core.studentId,
      studentName: `${student.firstname || ""} ${student.lastname || ""}`.trim() || "Student",
      avatarUrl: student.profile_image,
      className: student.class || "Student",
      schoolName: student.school || "School",
      examTarget: core.readiness.targetExam,
      overallAccuracy: core.activity.overallAccuracy,
      previousOverallAccuracy: Math.max(0, core.activity.overallAccuracy - core.trends.deltaPercentage),
      overallTrend: mappedTrend,
      overallTrendDiff: core.trends.deltaPercentage,
      overallGrade: overallGradeObj.grade,
      overallGradeLabel: overallGradeObj.label,
      learningStatus,
      totalQuestionsAnswered: core.activity.totalQuestionsAttempted,
      totalPracticeSessions: core.activity.practiceSessionsCount,
      totalVideosWatched: core.activity.videosWatchedCount,
      studyStreakDays: core.activity.currentStreakDays,
      lastActiveDate: core.activity.lastActiveDate ? formatTimeAgo(core.activity.lastActiveDate) : null,
      subjects: displayedSubjects,
      strengths: {
        highlight: strengthsHighlight,
        description: strengthsDescription,
        topSubjects,
        topTopics,
      },
      areasForAttention: {
        highlight: attentionHighlight,
        description: attentionDescription,
        strugglingSubjects,
        strugglingTopics,
      },
      needsAttentionAlerts: alerts,
      parentRecommendations: recommendations,
      recentActivities,
      trendHistory,
      hasData: core.dataQuality.hasSufficientData || core.activity.totalQuestionsAttempted > 0,
    };
  }, [student, core]);

  return {
    intelligence,
    loading,
    refreshIntelligence: refresh,
  };
};
