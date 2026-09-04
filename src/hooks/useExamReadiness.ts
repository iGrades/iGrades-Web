// src/hooks/useExamReadiness.ts
// Adapter that forwards to the unified Learning Intelligence Engine

import { useMemo } from "react";
import { useLearningIntelligence } from "@/services/learningIntelligence";

export interface SubjectReadiness {
  subjectId: string;
  subjectName: string;
  readinessScore: number | null; // 0-100 or null if insufficient data
  status: "exam_ready" | "on_track" | "developing" | "needs_focus" | "insufficient_data";
  accuracy: number;
  recentAccuracy: number;
  historicalAccuracy: number;
  topicCoveragePercent: number;
  masteredTopicsCount: number;
  totalTopicsCount: number;
  questionsSolved: number;
  sessionsCount: number;
  mockSessionsCount: number;
  trend: "improving" | "declining" | "stable" | "new";
  trendDiff: number;
  confidence: "high" | "moderate" | "preliminary" | "insufficient";
  priorityTopics: { topicId: string; topicName: string; accuracy: number }[];
}

export interface ExamReadinessData {
  studentId: string;
  studentClass: string;
  targetExam: "WAEC" | "NECO" | "JAMB" | "A-Level" | "BECE / Junior WAEC" | "School Exam";
  overallReadiness: number | null;
  readinessBand: "Exam Ready" | "On Track" | "Developing" | "Needs Focus" | "Not Enough Data";
  hasSufficientData: boolean;
  minDataReason?: string;
  confidenceLevel: "High" | "Moderate" | "Preliminary" | "Insufficient";
  totalQuestionsAnswered: number;
  totalTestsCompleted: number;
  totalMocksCompleted: number;
  subjectsEvaluatedCount: number;
  subjectBreakdown: SubjectReadiness[];
  strongestSubjects: SubjectReadiness[];
  weakestSubjects: SubjectReadiness[];
  improvingSubjects: SubjectReadiness[];
  decliningSubjects: SubjectReadiness[];
  priorityTopics: {
    topicId: string;
    topicName: string;
    subjectName: string;
    subjectId: string;
    accuracy: number;
    recommendedAction: string;
  }[];
  recommendedNextAction: {
    title: string;
    description: string;
    subjectId?: string;
    subjectName?: string;
    actionType: "practice_quiz" | "mock_exam" | "watch_video" | "revise_topics";
    ctaText: string;
    targetRoute: string;
  };
  lastCalculatedAt: string;
}

export const useExamReadiness = (studentId?: string, studentClass?: string) => {
  const { intelligence, loading, error, refresh } = useLearningIntelligence(studentId, studentClass);

  const readiness = useMemo<ExamReadinessData | null>(() => {
    if (!intelligence) return null;

    const { dataQuality, activity, readiness, subjects, weakTopics, recommendations } = intelligence;

    // Convert subjects into SubjectReadiness
    const subjectBreakdown: SubjectReadiness[] = subjects.map((sub) => {
      let status: SubjectReadiness["status"] = "insufficient_data";
      if (sub.readinessScore >= 80) status = "exam_ready";
      else if (sub.readinessScore >= 65) status = "on_track";
      else if (sub.readinessScore >= 50) status = "developing";
      else if (sub.totalQuestions > 0 || sub.attemptsCount > 0) status = "needs_focus";

      let confidence: SubjectReadiness["confidence"] = "insufficient";
      if (sub.totalQuestions >= 40) confidence = "high";
      else if (sub.totalQuestions >= 15) confidence = "moderate";
      else if (sub.totalQuestions >= 5) confidence = "preliminary";

      return {
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        readinessScore: sub.totalQuestions > 0 || sub.attemptsCount > 0 ? sub.readinessScore : null,
        status,
        accuracy: sub.accuracy,
        recentAccuracy: sub.accuracy,
        historicalAccuracy: Math.max(0, sub.accuracy - sub.trendDelta),
        topicCoveragePercent: sub.coveragePercentage,
        masteredTopicsCount: sub.masteredTopics.length,
        totalTopicsCount: sub.totalTopicsCount,
        questionsSolved: sub.totalQuestions,
        sessionsCount: sub.attemptsCount,
        mockSessionsCount: 0,
        trend: sub.trend,
        trendDiff: sub.trendDelta,
        confidence,
        priorityTopics: sub.weakTopics.map((w) => ({
          topicId: w.topicId,
          topicName: w.topicName,
          accuracy: w.accuracy,
        })),
      };
    });

    const activeSubjects = subjectBreakdown.filter((s) => s.questionsSolved > 0 || s.sessionsCount > 0);
    const strongestSubjects = [...activeSubjects].sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0)).slice(0, 3);
    const weakestSubjects = [...activeSubjects].sort((a, b) => (a.readinessScore || 0) - (b.readinessScore || 0)).slice(0, 3);
    const improvingSubjects = activeSubjects.filter((s) => s.trend === "improving");
    const decliningSubjects = activeSubjects.filter((s) => s.trend === "declining");

    const priorityTopics = weakTopics.slice(0, 5).map((w) => ({
      topicId: w.topicId,
      topicName: w.topicName,
      subjectName: w.subjectName,
      subjectId: w.subjectId,
      accuracy: w.accuracy,
      recommendedAction: `Practice 5 questions in ${w.topicName} with Spark to eliminate misconceptions.`,
    }));

    // Next action recommendation
    const topRec = recommendations[0];
    const recommendedNextAction = {
      title: topRec?.title || "Take a Practice Quiz",
      description: topRec?.description || "Complete 10 questions to continue building your readiness benchmark.",
      subjectId: topRec?.subjectId,
      subjectName: topRec?.subjectName,
      actionType: (topRec?.actionType === "mock_exam" ? "mock_exam" : "practice_quiz") as any,
      ctaText: topRec?.actionType === "mock_exam" ? "Start Mock Exam" : "Start Practice",
      targetRoute: "/student/quiz",
    };

    let targetExamMapped: ExamReadinessData["targetExam"] = "WAEC";
    if (readiness.targetExam.includes("BECE")) targetExamMapped = "BECE / Junior WAEC";
    else if (readiness.targetExam.includes("JAMB")) targetExamMapped = "JAMB";

    return {
      studentId: intelligence.studentId,
      studentClass: intelligence.studentClass,
      targetExam: targetExamMapped,
      overallReadiness: dataQuality.hasSufficientData ? readiness.readinessScore : null,
      readinessBand: readiness.readinessBand === "Insufficient Data" ? "Not Enough Data" : readiness.readinessBand,
      hasSufficientData: dataQuality.hasSufficientData,
      minDataReason: !dataQuality.hasSufficientData ? dataQuality.qualityNotes[0] : undefined,
      confidenceLevel: dataQuality.confidenceLevel,
      totalQuestionsAnswered: activity.totalQuestionsAttempted,
      totalTestsCompleted: activity.practiceSessionsCount,
      totalMocksCompleted: activity.mockSessionsCount,
      subjectsEvaluatedCount: activeSubjects.length,
      subjectBreakdown,
      strongestSubjects,
      weakestSubjects,
      improvingSubjects,
      decliningSubjects,
      priorityTopics,
      recommendedNextAction,
      lastCalculatedAt: intelligence.generatedAt,
    };
  }, [intelligence]);

  return {
    readiness,
    intelligence,
    primaryRecommendation: intelligence?.primaryRecommendation,
    recommendations: intelligence?.recommendations || [],
    loading,
    error,
    refreshReadiness: refresh,
  };
};
