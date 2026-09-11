// src/services/learningIntelligence/types.ts
// Canonical types for the unified iGrades Learning Intelligence Engine

export type TrendDirection = "improving" | "stable" | "declining" | "new";
export type ConfidenceLevel = "High" | "Moderate" | "Preliminary" | "Insufficient";
export type TopicMasteryStatus = "mastered" | "developing" | "weak" | "not_started";
export type ReadinessBand = "Exam Ready" | "On Track" | "Developing" | "Needs Focus" | "Insufficient Data";
export type ConsistencyRating = "Active & Consistent" | "Steady Pacing" | "Needs Practice Boost" | "Getting Started";

export interface DataQualityReport {
  hasSufficientData: boolean;
  isNewStudent: boolean;
  minAttemptsMet: boolean;
  totalAttempts: number;
  totalQuestions: number;
  confidenceLevel: ConfidenceLevel;
  qualityNotes: string[];
}

export interface TopicIntelligence {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  questionsAttempted: number;
  correctCount: number;
  accuracy: number; // 0 - 100
  masteryStatus: TopicMasteryStatus;
  repeatedMistakesCount: number;
  lastPracticedAt: string | null;
}

export interface SubjectIntelligence {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number; // 0 - 100
  attemptsCount: number;
  topicsAttemptedCount: number;
  totalTopicsCount: number;
  coveragePercentage: number;
  trend: TrendDirection;
  trendDelta: number;
  readinessScore: number;
  masteredTopics: TopicIntelligence[];
  weakTopics: TopicIntelligence[];
  developingTopics: TopicIntelligence[];
}

export interface TrendMetrics {
  direction: TrendDirection;
  deltaPercentage: number;
  recentAccuracy: number;
  baselineAccuracy: number;
  recentAttemptsCount: number;
  historicalAttemptsCount: number;
}

export interface ReadinessMetrics {
  targetExam: string; // e.g., "WAEC", "JAMB UTME", "BECE", "NECO"
  readinessScore: number; // 0 - 100
  readinessBand: ReadinessBand;
  confidenceLevel: ConfidenceLevel;
  syllabusCoveragePercentage: number;
  estimatedScoreRange: {
    minScore: number;
    maxScore: number;
    targetBenchmark: number;
  };
  keyFocusSubject: string | null;
  readinessSummary: string;
}

export interface ActivityMetrics {
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  overallAccuracy: number;
  practiceSessionsCount: number;
  mockSessionsCount: number;
  videosWatchedCount: number;
  currentStreakDays: number;
  estimatedStudyMinutes: number;
  consistencyRating: ConsistencyRating;
  lastActiveDate: string | null;
  daysActiveLast30Days: number;
}

export interface RepeatedMistake {
  questionId: string;
  questionText?: string;
  topicName: string;
  subjectName: string;
  timesFailed: number;
  lastFailedAt: string;
}

export type RecommendationType = "topic" | "subject" | "practice" | "review" | "goal" | "exam_prep";

export interface StudyRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  actionText: string;
  subjectId?: string;
  subjectName?: string;
  topicId?: string;
  topicName?: string;
  priority: "high" | "medium" | "low";
  priorityScore: number; // 0 - 100
  estimatedMinutes: number;
  actionType: "practice_quiz" | "mock_exam" | "watch_video" | "revise_topics" | "diagnose_weakness" | "daily_goal";
  actionTarget?: {
    page: "home" | "quiz" | "learn" | "rewards" | "spark";
    subjectId?: string;
    subjectName?: string;
    topicId?: string;
    topicName?: string;
  };
  reason: string;
  parentSummary: string; // Simplified, jargon-free summary for parent
  sparkPromptHint?: string; // Pre-configured Socratic context for Spark
}

export interface LearningIntelligenceReport {
  studentId: string;
  studentName?: string;
  studentClass: string;
  registeredCourses?: string[];
  generatedAt: string;
  dataQuality: DataQualityReport;
  activity: ActivityMetrics;
  trends: TrendMetrics;
  readiness: ReadinessMetrics;
  subjects: SubjectIntelligence[];
  strongestSubjects: SubjectIntelligence[];
  weakestSubjects: SubjectIntelligence[];
  allTopics: TopicIntelligence[];
  masteredTopics: TopicIntelligence[];
  weakTopics: TopicIntelligence[];
  repeatedMistakes: RepeatedMistake[];
  recommendations: StudyRecommendation[];
  primaryRecommendation?: StudyRecommendation;
  attemptTimeline?: ChronologicalScorePoint[];
}

export interface ChronologicalScorePoint {
  attemptId: string;
  subjectId: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  dateLabel: string;
  timeLabel: string;
  displayLabel: string;
  isRegistered?: boolean;
}

export interface RawAttemptRow {
  id: string;
  student_id: string;
  subject_id?: string;
  quiz_id?: string;
  score: string | number;
  total_questions?: number;
  status?: string;
  started_at?: string;
  completed_at?: string;
  is_mock?: boolean;
}

export interface RawAttemptAnswerRow {
  id: string;
  attempt_id: string;
  question_id?: string;
  student_id: string;
  selected_option?: string;
  is_correct: boolean | string | number;
  time_spent_seconds?: number;
  created_at?: string;
  // Joins
  questions?: {
    id: string;
    question_text?: string;
    topic_id?: string;
    subject_id?: string;
  };
}

export interface RawVideoProgressRow {
  id?: string;
  resource_id?: string;
  student_id?: string;
  completed?: boolean;
  progress?: number;
  updated_at?: string;
}

export interface RawSubjectRow {
  id: string;
  name: string;
  class_id?: string;
}

export interface RawTopicRow {
  id: string;
  name: string;
  subject_id?: string;
}

export interface RawLearningInput {
  studentId: string;
  studentName?: string;
  studentClass?: string;
  registeredCourses?: string[] | string | null;
  subjects: RawSubjectRow[];
  topics: RawTopicRow[];
  attempts: RawAttemptRow[];
  attemptAnswers: RawAttemptAnswerRow[];
  videoProgress: RawVideoProgressRow[];
  currentStreakDays?: number;
  lastActiveDate?: string | null;
}
