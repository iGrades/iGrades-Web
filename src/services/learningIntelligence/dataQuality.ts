// src/services/learningIntelligence/dataQuality.ts
// Handles cold-start, missing attempts, and confidence level evaluation

import type { ConfidenceLevel, DataQualityReport } from "./types";

export interface DataQualityInput {
  totalAttempts: number;
  totalQuestions: number;
  totalDistinctTopicsAttempted: number;
  totalSubjectsAttempted: number;
}

/**
 * Assesses data reliability based on empirical thresholds.
 * Avoids manufacturing confidence when data is too sparse.
 */
export function evaluateDataQuality(input: DataQualityInput): DataQualityReport {
  const { totalAttempts, totalQuestions, totalDistinctTopicsAttempted } = input;
  const qualityNotes: string[] = [];

  const isNewStudent = totalAttempts === 0 && totalQuestions === 0;
  const minAttemptsMet = totalAttempts >= 3;
  const hasSufficientData = totalQuestions >= 15 && totalAttempts >= 2;

  let confidenceLevel: ConfidenceLevel = "Insufficient";

  if (isNewStudent) {
    qualityNotes.push("New learner profile: No quiz attempts or practice sessions recorded yet.");
    confidenceLevel = "Insufficient";
  } else if (totalQuestions < 10) {
    qualityNotes.push("Low sample size: Fewer than 10 questions attempted; insights are preliminary.");
    confidenceLevel = "Insufficient";
  } else if (totalQuestions < 25 || totalDistinctTopicsAttempted < 2) {
    qualityNotes.push("Early learning phase: Initial trends available, but more practice is recommended.");
    confidenceLevel = "Preliminary";
  } else if (totalQuestions < 60 || totalDistinctTopicsAttempted < 4) {
    confidenceLevel = "Moderate";
  } else {
    confidenceLevel = "High";
  }

  return {
    hasSufficientData,
    isNewStudent,
    minAttemptsMet,
    totalAttempts,
    totalQuestions,
    confidenceLevel,
    qualityNotes,
  };
}

/**
 * Derives target examination from student class/grade in Nigerian secondary curriculum.
 */
export function inferTargetExam(studentClass?: string): string {
  if (!studentClass) return "WAEC / SSCE";
  const upper = studentClass.toUpperCase().trim();

  if (upper.includes("JSS") || upper.includes("JS") || upper.includes("BASIC 7") || upper.includes("BASIC 8") || upper.includes("BASIC 9")) {
    return "BECE / Junior WAEC";
  }
  if (upper.includes("SS 3") || upper.includes("SS3") || upper.includes("GRADE 12")) {
    return "WAEC & JAMB UTME";
  }
  if (upper.includes("SS 2") || upper.includes("SS2") || upper.includes("GRADE 11")) {
    return "WAEC SSCE Prep";
  }
  if (upper.includes("SS 1") || upper.includes("SS1") || upper.includes("GRADE 10")) {
    return "Senior Secondary Foundations";
  }
  return "WAEC / JAMB UTME";
}
