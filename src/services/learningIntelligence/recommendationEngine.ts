// src/services/learningIntelligence/recommendationEngine.ts
// Generates prioritized, highly actionable study recommendations answering "What should I study next?"

import type {
  RepeatedMistake,
  StudyRecommendation,
  SubjectIntelligence,
  TopicIntelligence,
} from "./types";

export interface RecommendationInput {
  targetExam: string;
  studentName?: string;
  subjects: SubjectIntelligence[];
  allTopics: TopicIntelligence[];
  weakTopics: TopicIntelligence[];
  masteredTopics?: TopicIntelligence[];
  repeatedMistakes: RepeatedMistake[];
  practiceSessionsCount: number;
  mockSessionsCount?: number;
  currentStreakDays?: number;
  lastActiveDate?: string | null;
  readinessScore?: number;
  readinessBand?: string;
  syllabusCoveragePercentage?: number;
  overallAccuracy?: number;
  trends?: {
    direction: string;
    deltaPercentage: number;
  };
}

/**
 * Calculates priority score (0 - 100) based on multiple pedagogical factors:
 * - Repeated mistakes (up to 35 pts)
 * - Accuracy gap & sample size (up to 25 pts)
 * - Inactivity / recency decay (up to 20 pts)
 * - Exam relevance (up to 15 pts)
 * - Performance trend decline (up to 10 pts)
 */
function calculateTopicPriorityScore(
  topic: TopicIntelligence,
  repeatedCount: number,
  daysSinceActive: number,
  subjectTrendDelta: number,
  isExamCore: boolean
): number {
  let score = 0;

  // 1. Repeated Mistakes (up to 35 pts)
  if (repeatedCount >= 3) {
    score += 35;
  } else if (repeatedCount === 2) {
    score += 25;
  } else if (repeatedCount === 1) {
    score += 15;
  }

  // 2. Accuracy Gap with Anti-Blindness Sample Size weighting (up to 25 pts)
  // Require at least 3 questions before treating a topic as severely weak
  const attempts = topic.questionsAttempted || 0;
  if (attempts >= 3) {
    if (topic.accuracy < 40) {
      score += 25;
    } else if (topic.accuracy < 55) {
      score += 18;
    } else if (topic.accuracy < 70) {
      score += 10;
    }
  } else if (attempts > 0 && topic.accuracy < 50) {
    // Limited data: tentative weakness
    score += 8;
  }

  // 3. Recency / Inactivity decay (up to 20 pts)
  if (daysSinceActive >= 10) {
    score += 20;
  } else if (daysSinceActive >= 5) {
    score += 14;
  } else if (daysSinceActive >= 2) {
    score += 8;
  }

  // 4. Exam Relevance & Syllabus Core (up to 15 pts)
  if (isExamCore) {
    score += 15;
  } else {
    score += 8;
  }

  // 5. Negative trend velocity (up to 10 pts)
  if (subjectTrendDelta < -10) {
    score += 10;
  } else if (subjectTrendDelta < -3) {
    score += 5;
  }

  return Math.min(100, Math.max(10, score));
}

export function generateRecommendations(input: RecommendationInput): StudyRecommendation[] {
  const {
    targetExam,
    studentName,
    subjects,
    allTopics,
    weakTopics,
    repeatedMistakes,
    practiceSessionsCount,
    mockSessionsCount = 0,
    currentStreakDays = 0,
    readinessScore = 50,
    readinessBand: _readinessBand = "Developing",
    trends: _trends,
  } = input;

  const candidatePool: StudyRecommendation[] = [];
  const sName = studentName || "the student";

  // ── 1. REVIEW RECOMMENDATION: Repeated Mistakes (Highest immediate yield) ──
  if (repeatedMistakes.length > 0) {
    // Take the top repeated mistake
    const topMistake = repeatedMistakes[0];
    const mistakeTopic = topMistake.topicName;
    const mistakeSubject = topMistake.subjectName;

    const priorityScore = Math.min(98, 75 + topMistake.timesFailed * 8);

    candidatePool.push({
      id: `rec-review-${topMistake.questionId}`,
      type: "review",
      title: `Review ${mistakeTopic} & Resolve Repeated Mistakes`,
      description: `You've missed questions in ${mistakeTopic} ${topMistake.timesFailed} times. Spend 15 minutes reviewing the core concepts, then attempt 10 targeted questions to eliminate recurring errors.`,
      actionText: "Review with Spark",
      subjectName: mistakeSubject,
      topicName: mistakeTopic,
      priority: priorityScore >= 80 ? "high" : "medium",
      priorityScore,
      estimatedMinutes: 15,
      actionType: "diagnose_weakness",
      actionTarget: {
        page: "spark",
        subjectName: mistakeSubject,
        topicName: mistakeTopic,
      },
      reason: `Resolving repeated conceptual traps in ${mistakeTopic} yields the fastest measurable score improvement for ${targetExam}.`,
      parentSummary: `${mistakeSubject} is currently a priority area. Encourage ${sName} to complete the recommended 15-minute ${mistakeTopic} review session.`,
      sparkPromptHint: `The student has repeated misconceptions in ${mistakeTopic} (${mistakeSubject}) where they missed questions ${topMistake.timesFailed} times. Walk them through the fundamental rules step-by-step using Socratic questioning.`,
    });
  }

  // ── 2. TOPIC RECOMMENDATION: Weak topic in an active subject ──
  // Check if subject is strong but a specific topic is weak (e.g., Mathematics is strong, Trigonometry is weak)
  const sortedWeakTopics = [...weakTopics].sort((a, b) => {
    // Prioritize topics with more attempts (anti-blindness: sample size > 2)
    const weightA = (a.questionsAttempted >= 3 ? 20 : 0) + (100 - a.accuracy);
    const weightB = (b.questionsAttempted >= 3 ? 20 : 0) + (100 - b.accuracy);
    return weightB - weightA;
  });

  for (const topic of sortedWeakTopics.slice(0, 3)) {
    // Skip if already covered by review recommendation
    if (candidatePool.some((c) => c.topicName?.toLowerCase() === topic.topicName.toLowerCase())) {
      continue;
    }

    const parentSubject = subjects.find(
      (s) => s.subjectId === topic.subjectId || s.subjectName.toLowerCase() === topic.subjectName.toLowerCase()
    );
    const subjectIsStrong = parentSubject && parentSubject.accuracy >= 65;
    const isExamCore = /math|phys|chem|bio|eng/i.test(topic.subjectName);

    // Calculate dynamic priority score
    const pScore = calculateTopicPriorityScore(
      topic,
      topic.repeatedMistakesCount || 0,
      topic.lastPracticedAt ? Math.round((Date.now() - new Date(topic.lastPracticedAt).getTime()) / (1000 * 3600 * 24)) : 7,
      parentSubject?.trendDelta || 0,
      isExamCore
    );

    const isHighPriority = pScore >= 80;

    let desc = "";
    if (subjectIsStrong) {
      desc = `Your ${topic.subjectName} foundation is strong (${parentSubject.accuracy}%), but ${topic.topicName} is lagging at ${topic.accuracy}%. Spend 15 minutes reviewing ${topic.topicName}, then attempt 10 targeted questions.`;
    } else if (topic.questionsAttempted >= 3 && topic.accuracy < 45) {
      desc = `Spend 15 minutes reviewing ${topic.topicName}, then attempt 10 targeted questions to build confidence and accuracy.`;
    } else {
      desc = `Practice 10 questions in ${topic.topicName} to push your accuracy above 70% for ${targetExam}.`;
    }

    candidatePool.push({
      id: `rec-topic-${topic.topicId}`,
      type: "topic",
      title: `Practice ${topic.topicName} (${topic.subjectName})`,
      description: desc,
      actionText: "Practice 10 Questions",
      subjectId: topic.subjectId,
      subjectName: topic.subjectName,
      topicId: topic.topicId,
      topicName: topic.topicName,
      priority: isHighPriority ? "high" : pScore >= 50 ? "medium" : "low",
      priorityScore: pScore,
      estimatedMinutes: 15,
      actionType: "practice_quiz",
      actionTarget: {
        page: "quiz",
        subjectId: topic.subjectId,
        subjectName: topic.subjectName,
        topicId: topic.topicId,
        topicName: topic.topicName,
      },
      reason: subjectIsStrong
        ? `Targeted practice in ${topic.topicName} will eliminate the main bottleneck in your ${topic.subjectName} score.`
        : `Building mastery in ${topic.topicName} will directly lift your overall ${targetExam} readiness.`,
      parentSummary: `${topic.topicName} in ${topic.subjectName} needs focused practice. A 15-minute practice session will help ${sName} master this topic.`,
      sparkPromptHint: `The student is working on ${topic.topicName} in ${topic.subjectName}. Their current accuracy is ${topic.accuracy}%. Offer structured guidance and positive reinforcement.`,
    });
  }

  // ── 3. SUBJECT RECOMMENDATION: Inactive or dormant core subject ──
  // Check for core subjects that haven't been practiced recently (e.g. Physics not touched for days)
  const activeSubjects = subjects.filter((s) => s.totalTopicsCount > 0 || s.totalQuestions > 0);
  const dormantSubject = activeSubjects.find((s) => {
    const hasAttempts = s.totalQuestions > 0;
    const isFalling = s.trend === "declining" || s.trendDelta < -5;
    const lowCoverage = s.coveragePercentage < 50;
    return (hasAttempts && isFalling) || (s.totalQuestions === 0 && activeSubjects.length > 1) || lowCoverage;
  });

  if (dormantSubject && !candidatePool.some((c) => c.type === "subject" && c.subjectName === dormantSubject.subjectName)) {
    const isUntouched = dormantSubject.totalQuestions === 0;
    const pScore = isUntouched ? 70 : Math.min(85, 60 + Math.abs(dormantSubject.trendDelta));

    candidatePool.push({
      id: `rec-subject-${dormantSubject.subjectId}`,
      type: "subject",
      title: isUntouched
        ? `Start Practicing ${dormantSubject.subjectName}`
        : `Complete a Short ${dormantSubject.subjectName} Practice Session`,
      description: isUntouched
        ? `You haven't practiced ${dormantSubject.subjectName} yet. Complete a short 10-minute diagnostic session to set your benchmark.`
        : `You haven't practiced ${dormantSubject.subjectName} recently. Complete a short 10-minute session to maintain retention and exam speed.`,
      actionText: `Practice ${dormantSubject.subjectName}`,
      subjectId: dormantSubject.subjectId,
      subjectName: dormantSubject.subjectName,
      priority: pScore >= 80 ? "high" : "medium",
      priorityScore: pScore,
      estimatedMinutes: 10,
      actionType: "practice_quiz",
      actionTarget: {
        page: "quiz",
        subjectId: dormantSubject.subjectId,
        subjectName: dormantSubject.subjectName,
      },
      reason: `Consistent subject rotation prevents memory decay and ensures balanced readiness across all ${targetExam} subjects.`,
      parentSummary: `${dormantSubject.subjectName} needs recent attention. Encourage ${sName} to complete a short 10-minute practice session.`,
      sparkPromptHint: `The student is starting a practice session in ${dormantSubject.subjectName}. Help them test their recall on core concepts.`,
    });
  }

  // ── 4. PRACTICE RECOMMENDATION: Reinforce developing topics (50% - 70% accuracy) ──
  const developingTopic = allTopics.find(
    (t) =>
      t.masteryStatus === "developing" &&
      t.questionsAttempted >= 2 &&
      !candidatePool.some((c) => c.topicName?.toLowerCase() === t.topicName.toLowerCase())
  );

  if (developingTopic) {
    const pScore = 65;
    candidatePool.push({
      id: `rec-practice-${developingTopic.topicId}`,
      type: "practice",
      title: `Practice 10 Questions in ${developingTopic.topicName}`,
      description: `Current accuracy is ${developingTopic.accuracy}%. Complete 10 targeted practice questions to convert this developing topic into a mastered skill.`,
      actionText: "Practice 10 Questions",
      subjectId: developingTopic.subjectId,
      subjectName: developingTopic.subjectName,
      topicId: developingTopic.topicId,
      topicName: developingTopic.topicName,
      priority: "medium",
      priorityScore: pScore,
      estimatedMinutes: 12,
      actionType: "practice_quiz",
      actionTarget: {
        page: "quiz",
        subjectId: developingTopic.subjectId,
        subjectName: developingTopic.subjectName,
        topicId: developingTopic.topicId,
        topicName: developingTopic.topicName,
      },
      reason: `Pivoting developing topics into mastered topics is the most dependable way to secure an A1 / distinction in ${targetExam}.`,
      parentSummary: `${sName} is making good progress in ${developingTopic.topicName}. A quick 10-question practice set will lock in their understanding.`,
      sparkPromptHint: `The student is reinforcing ${developingTopic.topicName} (${developingTopic.accuracy}%). Provide positive reinforcement when they apply concepts correctly.`,
    });
  }

  // ── 5. GOAL RECOMMENDATION: Daily streak & habit consistency ──
  if (currentStreakDays > 0) {
    const pScore = currentStreakDays >= 3 ? 72 : 58;
    candidatePool.push({
      id: "rec-goal-streak",
      type: "goal",
      title: `Protect Your ${currentStreakDays}-Day Study Streak`,
      description: `Complete at least one practice quiz today to preserve your ${currentStreakDays}-day streak and reinforce daily habit retention.`,
      actionText: "Keep Streak Alive",
      priority: currentStreakDays >= 3 ? "high" : "medium",
      priorityScore: pScore,
      estimatedMinutes: 8,
      actionType: "daily_goal",
      actionTarget: {
        page: "quiz",
      },
      reason: `Daily spaced practice improves long-term memory retention by up to 200% compared to cramming.`,
      parentSummary: `${sName} is on a ${currentStreakDays}-day study streak! Completing a quick quiz today keeps their momentum going.`,
      sparkPromptHint: `Acknowledge that the student is maintaining a ${currentStreakDays}-day study streak! Keep their motivation and focus high.`,
    });
  }

  // ── 6. EXAM PREPARATION RECOMMENDATION: Timed mock exam simulation ──
  if (practiceSessionsCount >= 3 || readinessScore >= 60) {
    const pScore = mockSessionsCount === 0 ? 68 : readinessScore >= 75 ? 74 : 52;
    candidatePool.push({
      id: "rec-exam-prep-mock",
      type: "exam_prep",
      title: `Attempt a Timed ${targetExam} Mock Exam`,
      description: `Test your exam stamina, question pacing, and timing under authentic ${targetExam} countdown conditions.`,
      actionText: "Start Timed Mock",
      priority: pScore >= 70 ? "high" : "medium",
      priorityScore: pScore,
      estimatedMinutes: 30,
      actionType: "mock_exam",
      actionTarget: {
        page: "quiz",
      },
      reason: `Simulating authentic timed conditions trains time management and pinpoints pacing bottlenecks before exam day.`,
      parentSummary: `${sName} is in a good position to attempt a timed mock exam to test their pacing and confidence under exam conditions.`,
      sparkPromptHint: `The student is preparing for a timed ${targetExam} mock exam. Encourage calm pacing and careful question reading.`,
    });
  }

  // ── Fallback for new students or empty history ──
  if (candidatePool.length === 0) {
    const defaultSubject = subjects[0]?.subjectName || "Mathematics";
    candidatePool.push({
      id: "rec-starter-quiz",
      type: "subject",
      title: `Start Your ${targetExam} Diagnostic Quiz`,
      description: `Complete your first 10-question practice set in ${defaultSubject} to benchmark your baseline readiness.`,
      actionText: `Start ${defaultSubject} Quiz`,
      subjectName: defaultSubject,
      priority: "high",
      priorityScore: 90,
      estimatedMinutes: 10,
      actionType: "practice_quiz",
      actionTarget: {
        page: "quiz",
      },
      reason: `Completing your first practice set allows Spark and your learning dashboard to tailor your study plan.`,
      parentSummary: `Encourage ${sName} to complete their first diagnostic quiz to establish their baseline study plan for ${targetExam}.`,
      sparkPromptHint: `This is a diagnostic quiz session. Welcome the student warmly and encourage them to try their best.`,
    });
  }

  // Sort candidate pool strictly by priority score descending
  candidatePool.sort((a, b) => b.priorityScore - a.priorityScore);

  // Return top 4 distinct recommendations
  return candidatePool.slice(0, 4);
}
