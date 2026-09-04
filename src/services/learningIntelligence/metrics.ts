// src/services/learningIntelligence/metrics.ts
// Mathematical models for performance, trends, and examination readiness

import type {
  ConfidenceLevel,
  ConsistencyRating,
  ReadinessBand,
  TopicMasteryStatus,
  TrendDirection,
  TrendMetrics,
} from "./types";

/**
 * Calculates percentage accuracy safely, clamped to [0, 100].
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round(Math.min(100, Math.max(0, (correct / total) * 100)));
}

/**
 * Categorizes a topic's mastery based on attempts and accuracy.
 */
export function categorizeTopicMastery(correct: number, total: number): TopicMasteryStatus {
  if (total < 3) return "not_started";
  const acc = (correct / total) * 100;
  if (acc >= 75) return "mastered";
  if (acc >= 50) return "developing";
  return "weak";
}

/**
 * Calculates trend direction and percentage delta between recent and baseline attempts.
 * Uses a rolling window of recent attempts (up to last 5) against previous baseline.
 */
export function calculateTrend(scores: number[]): TrendMetrics {
  if (!scores || scores.length < 2) {
    return {
      direction: "new",
      deltaPercentage: 0,
      recentAccuracy: scores?.[0] ?? 0,
      baselineAccuracy: scores?.[0] ?? 0,
      recentAttemptsCount: scores?.length ?? 0,
      historicalAttemptsCount: 0,
    };
  }

  // Split: most recent 40% (min 1, max 5) vs prior baseline
  const recentWindowSize = Math.max(1, Math.min(5, Math.ceil(scores.length * 0.4)));
  const recentScores = scores.slice(0, recentWindowSize);
  const baselineScores = scores.slice(recentWindowSize);

  const recentAvg = Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length);
  const baselineAvg = baselineScores.length > 0
    ? Math.round(baselineScores.reduce((a, b) => a + b, 0) / baselineScores.length)
    : recentAvg;

  const delta = recentAvg - baselineAvg;
  let direction: TrendDirection = "stable";

  if (delta >= 3.5) {
    direction = "improving";
  } else if (delta <= -3.5) {
    direction = "declining";
  } else {
    direction = "stable";
  }

  return {
    direction,
    deltaPercentage: delta,
    recentAccuracy: recentAvg,
    baselineAccuracy: baselineAvg,
    recentAttemptsCount: recentScores.length,
    historicalAttemptsCount: baselineScores.length,
  };
}

/**
 * Calculates examination readiness composite score (0 - 100).
 * Weights:
 * - 45% Overall accuracy
 * - 35% Syllabus topic coverage
 * - 20% Consistency / Mock readiness
 */
export function calculateReadinessScore(
  accuracy: number,
  topicCoveragePercent: number,
  consistencyBonus: number
): number {
  if (accuracy <= 0 && topicCoveragePercent <= 0) return 0;

  const score = (accuracy * 0.45) + (topicCoveragePercent * 0.35) + (consistencyBonus * 0.20);
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Determines readiness band based on score and confidence.
 */
export function determineReadinessBand(score: number, confidence: ConfidenceLevel): ReadinessBand {
  if (confidence === "Insufficient") return "Insufficient Data";
  if (score >= 80) return "Exam Ready";
  if (score >= 65) return "On Track";
  if (score >= 50) return "Developing";
  return "Needs Focus";
}

/**
 * Derives a human-readable study consistency rating.
 */
export function deriveConsistencyRating(
  streakDays: number,
  practiceSessionsCount: number,
  daysActiveLast30: number
): ConsistencyRating {
  if (streakDays >= 4 || (practiceSessionsCount >= 10 && daysActiveLast30 >= 8)) {
    return "Active & Consistent";
  }
  if (practiceSessionsCount >= 4 || daysActiveLast30 >= 4) {
    return "Steady Pacing";
  }
  if (practiceSessionsCount >= 1) {
    return "Needs Practice Boost";
  }
  return "Getting Started";
}
