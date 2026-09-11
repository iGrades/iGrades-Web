// src/services/learningIntelligence/aggregator.ts
// Pure functional engine that transforms raw database rows into derived educational intelligence

import { evaluateDataQuality, inferTargetExam } from "./dataQuality";
import {
  calculateAccuracy,
  calculateReadinessScore,
  calculateTrend,
  categorizeTopicMastery,
  deriveConsistencyRating,
  determineReadinessBand,
} from "./metrics";
import { generateRecommendations } from "./recommendationEngine";
import { parseRegisteredCourses, isSubjectRegistered, getSubjectDisplayName } from "@/utils/subjectMatching";
import type {
  ActivityMetrics,
  ChronologicalScorePoint,
  LearningIntelligenceReport,
  RawLearningInput,
  RepeatedMistake,
  SubjectIntelligence,
  TopicIntelligence,
} from "./types";

export function computeLearningIntelligence(input: RawLearningInput): LearningIntelligenceReport {
  const {
    studentId,
    studentName,
    studentClass = "Secondary",
    registeredCourses,
    subjects: rawSubjects = [],
    topics: rawTopics = [],
    attempts: rawAttempts = [],
    attemptAnswers: rawAnswers = [],
    videoProgress: rawVideos = [],
    currentStreakDays = 0,
    lastActiveDate: rawLastActive = null,
  } = input;

  // 1. Topic & Subject Lookups
  const subjectMap = new Map<string, string>(); // id -> name
  rawSubjects.forEach((s) => subjectMap.set(s.id, s.name));

  const topicMap = new Map<string, { name: string; subjectId: string }>();
  rawTopics.forEach((t) => {
    topicMap.set(t.id, {
      name: t.name,
      subjectId: t.subject_id || "",
    });
  });

  // 2. Filter & Sort Valid Attempts
  const completedAttempts = rawAttempts
    .filter((a) => {
      if (a.status && a.status.toLowerCase() !== "completed") return false;
      const numScore = parseFloat(String(a.score));
      return !isNaN(numScore);
    })
    .sort((a, b) => {
      const dateA = a.completed_at || a.started_at || "";
      const dateB = b.completed_at || b.started_at || "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const attemptScores = completedAttempts.map((a) => Math.round(parseFloat(String(a.score))));

  // Track distinct days active
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeDatesSet = new Set<string>();
  let latestActivityIso: string | null = rawLastActive;

  completedAttempts.forEach((a) => {
    const dStr = a.completed_at || a.started_at;
    if (dStr) {
      const d = new Date(dStr);
      if (!latestActivityIso || d > new Date(latestActivityIso)) {
        latestActivityIso = dStr;
      }
      if (d >= thirtyDaysAgo) {
        activeDatesSet.add(d.toISOString().slice(0, 10));
      }
    }
  });

  const practiceSessionsCount = completedAttempts.filter((a) => !a.is_mock).length;
  const mockSessionsCount = completedAttempts.filter((a) => a.is_mock).length;
  const videosWatchedCount = rawVideos.filter((v) => v.completed || (v.progress && v.progress >= 90)).length;

  // 3. Question & Topic Level Aggregations
  // Topic statistics: topicId -> { total, correct, subjectId, lastDate }
  const topicStatsMap = new Map<
    string,
    { total: number; correct: number; subjectId: string; lastDate: string | null }
  >();

  // Track repeated question errors: questionId -> { failedCount, lastFailed, questionText, topicId, subjectId }
  const questionFailures = new Map<
    string,
    {
      failedCount: number;
      lastFailed: string;
      questionText?: string;
      topicId: string;
      subjectId: string;
    }
  >();

  let totalQuestionsAnswered = 0;
  let totalQuestionsCorrect = 0;

  // Aggregate item-level answers
  rawAnswers.forEach((ans) => {
    totalQuestionsAnswered += 1;
    const isCorrect =
      ans.is_correct === true ||
      ans.is_correct === "true" ||
      ans.is_correct === 1 ||
      ans.is_correct === "1";

    if (isCorrect) {
      totalQuestionsCorrect += 1;
    }

    const questionObj = ans.questions;
    const topicId = questionObj?.topic_id || "unassigned";
    const subjectId = questionObj?.subject_id || (topicId !== "unassigned" ? topicMap.get(topicId)?.subjectId : "") || "";

    // Topic aggregator
    if (topicId !== "unassigned") {
      const current = topicStatsMap.get(topicId) || {
        total: 0,
        correct: 0,
        subjectId,
        lastDate: null,
      };
      current.total += 1;
      if (isCorrect) current.correct += 1;
      const ansDate = ans.created_at || null;
      if (ansDate && (!current.lastDate || new Date(ansDate) > new Date(current.lastDate))) {
        current.lastDate = ansDate;
      }
      topicStatsMap.set(topicId, current);
    }

    // Repeated mistake tracker
    if (!isCorrect && ans.question_id) {
      const existingFail = questionFailures.get(ans.question_id) || {
        failedCount: 0,
        lastFailed: ans.created_at || new Date().toISOString(),
        questionText: questionObj?.question_text,
        topicId,
        subjectId,
      };
      existingFail.failedCount += 1;
      if (ans.created_at && new Date(ans.created_at) > new Date(existingFail.lastFailed)) {
        existingFail.lastFailed = ans.created_at;
      }
      questionFailures.set(ans.question_id, existingFail);
    }
  });

  // Fallback: If attempt_answers table was empty, synthesize totals from attempt rows
  if (totalQuestionsAnswered === 0 && completedAttempts.length > 0) {
    completedAttempts.forEach((a) => {
      const qCount = a.total_questions || 10;
      totalQuestionsAnswered += qCount;
      const scorePct = parseFloat(String(a.score)) || 0;
      totalQuestionsCorrect += Math.round((scorePct / 100) * qCount);
    });
  }

  // 4. Transform Topic Statistics into TopicIntelligence
  const allTopicsIntelligence: TopicIntelligence[] = [];
  topicStatsMap.forEach((stat, tId) => {
    const topicMeta = topicMap.get(tId);
    const topicName = topicMeta?.name || "Academic Concept";
    const subName = subjectMap.get(stat.subjectId) || "General Subject";

    const accuracy = calculateAccuracy(stat.correct, stat.total);
    const masteryStatus = categorizeTopicMastery(stat.correct, stat.total);

    // Repeated mistakes in this topic
    let repeatedMistakesCount = 0;
    questionFailures.forEach((f) => {
      if (f.topicId === tId && f.failedCount >= 2) {
        repeatedMistakesCount += 1;
      }
    });

    allTopicsIntelligence.push({
      topicId: tId,
      topicName,
      subjectId: stat.subjectId,
      subjectName: subName,
      questionsAttempted: stat.total,
      correctCount: stat.correct,
      accuracy,
      masteryStatus,
      repeatedMistakesCount,
      lastPracticedAt: stat.lastDate,
    });
  });

  const masteredTopics = allTopicsIntelligence.filter((t) => t.masteryStatus === "mastered");
  const weakTopics = allTopicsIntelligence.filter((t) => t.masteryStatus === "weak");

  // 5. Repeated Mistakes List (sorted by highest failure count)
  const repeatedMistakes: RepeatedMistake[] = [];
  questionFailures.forEach((fail, qId) => {
    if (fail.failedCount >= 2) {
      const topicMeta = topicMap.get(fail.topicId);
      const subName = subjectMap.get(fail.subjectId) || "Academic Subject";
      repeatedMistakes.push({
        questionId: qId,
        questionText: fail.questionText,
        topicName: topicMeta?.name || "Curriculum Topic",
        subjectName: subName,
        timesFailed: fail.failedCount,
        lastFailedAt: fail.lastFailed,
      });
    }
  });
  repeatedMistakes.sort((a, b) => b.timesFailed - a.timesFailed);

  // 6. Data Quality Assessment
  const distinctTopicsAttempted = topicStatsMap.size;
  const distinctSubjectsAttempted = new Set(
    Array.from(topicStatsMap.values()).map((v) => v.subjectId).filter(Boolean)
  ).size;

  const dataQuality = evaluateDataQuality({
    totalAttempts: completedAttempts.length,
    totalQuestions: totalQuestionsAnswered,
    totalDistinctTopicsAttempted: distinctTopicsAttempted,
    totalSubjectsAttempted: distinctSubjectsAttempted,
  });

  // 7. Overall Performance & Activity Metrics
  const overallAccuracy = calculateAccuracy(totalQuestionsCorrect, totalQuestionsAnswered);
  const estimatedStudyMinutes = (totalQuestionsAnswered * 1.5) + (videosWatchedCount * 10);
  const consistencyRating = deriveConsistencyRating(
    currentStreakDays,
    completedAttempts.length,
    activeDatesSet.size
  );

  const activity: ActivityMetrics = {
    totalQuestionsAttempted: totalQuestionsAnswered,
    totalQuestionsCorrect: totalQuestionsCorrect,
    overallAccuracy,
    practiceSessionsCount,
    mockSessionsCount,
    videosWatchedCount,
    currentStreakDays,
    estimatedStudyMinutes: Math.round(estimatedStudyMinutes),
    consistencyRating,
    lastActiveDate: latestActivityIso,
    daysActiveLast30Days: activeDatesSet.size,
  };

  // 8. Trends
  const trends = calculateTrend(attemptScores);

  // 9. Subject-Level Intelligence (Restricted strictly to courses the student is registered for)
  const registeredList = parseRegisteredCourses(registeredCourses);

  let evaluatedSubjects = rawSubjects;
  if (registeredList.length > 0) {
    evaluatedSubjects = rawSubjects.filter((sub) => isSubjectRegistered(sub, registeredList));

    // Ensure every registered course has a corresponding subject entry
    registeredList.forEach((rc) => {
      const exists = evaluatedSubjects.some((sub) => isSubjectRegistered(sub, [rc]));
      if (!exists) {
        evaluatedSubjects.push({
          id: `reg-${rc}`,
          name: rc,
        });
      }
    });
  }

  const subjectsIntelligence: SubjectIntelligence[] = evaluatedSubjects.map((sub) => {
    const subTopics = rawTopics.filter((t) => t.subject_id === sub.id);
    const subTopicIds = new Set(subTopics.map((t) => t.id));

    // Filter topic intelligence for this subject
    const subjectTopicIntel = allTopicsIntelligence.filter(
      (t) => t.subjectId === sub.id || subTopicIds.has(t.topicId)
    );

    const attemptedTopicsInSub = subjectTopicIntel.filter((t) => t.questionsAttempted > 0);
    const coveragePercentage = subTopics.length > 0
      ? Math.round((attemptedTopicsInSub.length / subTopics.length) * 100)
      : (attemptedTopicsInSub.length > 0 ? 100 : 0);

    const subQuestionsTotal = subjectTopicIntel.reduce((acc, t) => acc + t.questionsAttempted, 0);
    const subQuestionsCorrect = subjectTopicIntel.reduce((acc, t) => acc + t.correctCount, 0);

    // Subject attempt scores for trend calculation
    const subAttempts = completedAttempts.filter((a) => a.subject_id === sub.id);
    const subScores = subAttempts.map((a) => Math.round(parseFloat(String(a.score))));
    const subTrend = calculateTrend(subScores);

    // If item answers had no records for this subject, fallback to attempts average
    const subAccuracy = subQuestionsTotal > 0
      ? calculateAccuracy(subQuestionsCorrect, subQuestionsTotal)
      : (subScores.length > 0 ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length) : 0);

    const subReadinessScore = calculateReadinessScore(
      subAccuracy,
      coveragePercentage,
      Math.min(100, subAttempts.length * 15)
    );

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      totalQuestions: subQuestionsTotal,
      correctQuestions: subQuestionsCorrect,
      accuracy: subAccuracy,
      attemptsCount: subAttempts.length,
      topicsAttemptedCount: attemptedTopicsInSub.length,
      totalTopicsCount: subTopics.length,
      coveragePercentage,
      trend: subTrend.direction,
      trendDelta: subTrend.deltaPercentage,
      readinessScore: subReadinessScore,
      masteredTopics: subjectTopicIntel.filter((t) => t.masteryStatus === "mastered"),
      weakTopics: subjectTopicIntel.filter((t) => t.masteryStatus === "weak"),
      developingTopics: subjectTopicIntel.filter((t) => t.masteryStatus === "developing"),
    };
  });

  // Sort subjects by accuracy / attempts
  const subjectsWithActivity = subjectsIntelligence.filter((s) => s.totalQuestions > 0 || s.attemptsCount > 0);
  const strongestSubjects = [...subjectsWithActivity].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
  const weakestSubjects = [...subjectsWithActivity].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  // 10. Examination Readiness
  const targetExam = inferTargetExam(studentClass);
  const totalSyllabusTopics = rawTopics.length || 1;
  const overallCoverage = Math.round((distinctTopicsAttempted / totalSyllabusTopics) * 100);

  const readinessScore = calculateReadinessScore(
    overallAccuracy,
    Math.min(100, overallCoverage * 1.5), // weighted coverage boost
    Math.min(100, (currentStreakDays * 15) + (mockSessionsCount * 25))
  );

  const readinessBand = determineReadinessBand(readinessScore, dataQuality.confidenceLevel);

  // Estimated examination score range
  const baselineEstimate = dataQuality.confidenceLevel === "Insufficient" ? 50 : Math.max(30, overallAccuracy);
  const spread = dataQuality.confidenceLevel === "High" ? 5 : (dataQuality.confidenceLevel === "Moderate" ? 8 : 12);
  const minScore = Math.max(20, baselineEstimate - spread);
  const maxScore = Math.min(98, baselineEstimate + spread);

  const keyFocus = weakestSubjects[0]?.subjectName || null;

  let readinessSummary = "";
  if (dataQuality.confidenceLevel === "Insufficient") {
    readinessSummary = `Readiness benchmarking is warming up. Complete at least 2 practice quizzes in your target subjects to unlock predictive readiness insights for ${targetExam}.`;
  } else if (readinessBand === "Exam Ready") {
    readinessSummary = `Outstanding trajectory for ${targetExam}. High accuracy across core topics with steady practice cadence. Focus on timed mocks to maintain momentum.`;
  } else if (readinessBand === "On Track") {
    readinessSummary = `Solid progress toward ${targetExam}. Demonstrates firm grasp of fundamentals with targeted revision needed in ${keyFocus || "developing topics"}.`;
  } else if (readinessBand === "Developing") {
    readinessSummary = `Foundation is developing for ${targetExam}. Recommend increasing practice frequency and targeting weak topics to lift readiness above 65%.`;
  } else {
    readinessSummary = `Priority focus recommended for ${targetExam}. Systematic topic reviews and step-by-step guidance with Spark will help build consistency.`;
  }

  // 11. Recommendations
  const recommendations = generateRecommendations({
    targetExam,
    studentName,
    subjects: subjectsIntelligence,
    allTopics: allTopicsIntelligence,
    weakTopics,
    masteredTopics,
    repeatedMistakes,
    practiceSessionsCount: completedAttempts.length,
    mockSessionsCount,
    currentStreakDays,
    lastActiveDate: activity.lastActiveDate,
    readinessScore,
    readinessBand,
    syllabusCoveragePercentage: Math.min(100, overallCoverage),
    overallAccuracy,
    trends: {
      direction: trends.direction,
      deltaPercentage: trends.deltaPercentage,
    },
  });

  const primaryRecommendation = recommendations[0] || undefined;

  // 9. Chronological Attempt Timeline for Real Line Graphs
  const chronologicalAttempts = [...completedAttempts].sort((a, b) => {
    const dateA = new Date(a.completed_at || a.started_at || 0).getTime();
    const dateB = new Date(b.completed_at || b.started_at || 0).getTime();
    return dateA - dateB;
  });

  const dayCounts = new Map<string, number>();
  const attemptTimeline: ChronologicalScorePoint[] = chronologicalAttempts.map((att, idx) => {
    const dStr = att.completed_at || att.started_at || new Date().toISOString();
    const d = new Date(dStr);
    const dateLabel = isNaN(d.getTime())
      ? `Quiz ${idx + 1}`
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeLabel = isNaN(d.getTime())
      ? ""
      : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    dayCounts.set(dateLabel, (dayCounts.get(dateLabel) || 0) + 1);

    const subName = att.subject_id ? (subjectMap.get(att.subject_id) || "Subject") : "General";
    const displayName = getSubjectDisplayName(subName);

    return {
      attemptId: att.id,
      subjectId: att.subject_id || "",
      subjectName: displayName,
      score: Math.round(parseFloat(String(att.score))),
      totalQuestions: Number(att.total_questions) || 0,
      completedAt: dStr,
      dateLabel,
      timeLabel,
      displayLabel: dateLabel,
      isRegistered: isSubjectRegistered({ subjectId: att.subject_id, subjectName: displayName }, registeredList),
    };
  });

  // Disambiguate same-day attempts for clear X-axis display
  const daySeen = new Map<string, number>();
  attemptTimeline.forEach((pt) => {
    const totalOnDay = dayCounts.get(pt.dateLabel) || 0;
    if (totalOnDay > 1) {
      const count = (daySeen.get(pt.dateLabel) || 0) + 1;
      daySeen.set(pt.dateLabel, count);
      pt.displayLabel = pt.timeLabel ? `${pt.dateLabel} (${pt.timeLabel})` : `${pt.dateLabel} #${count}`;
    }
  });

  return {
    studentId,
    studentName,
    studentClass,
    registeredCourses: registeredList,
    generatedAt: new Date().toISOString(),
    dataQuality,
    activity,
    trends,
    readiness: {
      targetExam,
      readinessScore,
      readinessBand,
      confidenceLevel: dataQuality.confidenceLevel,
      syllabusCoveragePercentage: Math.min(100, overallCoverage),
      estimatedScoreRange: {
        minScore,
        maxScore,
        targetBenchmark: 70,
      },
      keyFocusSubject: keyFocus,
      readinessSummary,
    },
    subjects: subjectsIntelligence,
    strongestSubjects,
    weakestSubjects,
    allTopics: allTopicsIntelligence,
    masteredTopics,
    weakTopics,
    repeatedMistakes,
    recommendations,
    primaryRecommendation,
    attemptTimeline,
  };
}
