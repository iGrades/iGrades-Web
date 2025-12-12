import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { QuizAttemptProps, QuizResults, SubjectResult } from "./types";

export const useQuizAttempt = (quizData: QuizAttemptProps["quizData"]) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [subjectTimeLeft, setSubjectTimeLeft] = useState<
    Record<number, number>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSubjects, setCompletedSubjects] = useState<Set<number>>(
    new Set()
  );
  const [attemptIds, setAttemptIds] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  const { authdStudent } = useAuthdStudentData();

  // Initialize timers for each subject
  useEffect(() => {
    const initialTimers: Record<number, number> = {};
    quizData.subjects.forEach((_, index) => {
      initialTimers[index] = quizData.timePerSubject * 60;
    });
    setSubjectTimeLeft(initialTimers);
  }, [quizData.subjects, quizData.timePerSubject]);

  const currentSubject = quizData.subjects[currentSubjectIndex];
  const currentSubjectQuestions = quizData.questions.filter(
    (q) => q.subject_id === currentSubject?.id
  );
  const isLastQuestionInSubject =
    currentQuestionIndex === currentSubjectQuestions.length - 1;
  const isSubjectCompleted = completedSubjects.has(currentSubjectIndex);

  const hasQuizzesForCurrentSubject = quizData.quizzes.some(
    (quiz) => quiz.subject_id === currentSubject?.id
  );
  
  const saveAnswersForCurrentSubject = useCallback(async () => {
    try {
      const attemptId = attemptIds[currentSubject.id];
      if (!attemptId) {
        console.error("No attempt ID found for subject:", currentSubject.id);
        return;
      }

      const currentSubjectAnswers = Object.entries(answers)
        .filter(([questionId]) => {
          const question = quizData.questions.find((q) => q.id === questionId);
          return question && question.subject_id === currentSubject.id;
        })
        .map(([questionId, selected_option]) => ({
          attempt_id: attemptId,
          question_id: questionId,
          selected_option,
          student_id: authdStudent?.id,
          subject_id: currentSubject.id,
          created_at: new Date().toISOString(),
        }));

      if (currentSubjectAnswers.length > 0) {
        const { error: saveError } = await supabase
          .from("attempt_answers")
          .insert(currentSubjectAnswers);

        if (saveError) {
          console.error("Error saving answers:", saveError);
        }
      }
    } catch (error) {
      console.error("Error in saveAnswersForCurrentSubject:", error);
    }
  }, [answers, authdStudent, currentSubject, attemptIds, quizData.questions]);
  
  const handleAutoSubmitSubject = useCallback(async () => {
      if (isSubjectCompleted) return;
      setCompletedSubjects((prev) => new Set(prev).add(currentSubjectIndex));
      await saveAnswersForCurrentSubject();
    }, [currentSubjectIndex, saveAnswersForCurrentSubject, isSubjectCompleted]);

  // Timer for current subject only
  useEffect(() => {
    if (
      isSubjectCompleted ||
      !subjectTimeLeft[currentSubjectIndex] ||
      !hasQuizzesForCurrentSubject
    )
      return;

    const timer = setInterval(() => {
      setSubjectTimeLeft((prev) => ({
        ...prev,
        [currentSubjectIndex]: Math.max(0, prev[currentSubjectIndex] - 1),
      }));

      if (subjectTimeLeft[currentSubjectIndex] <= 1) {
        handleAutoSubmitSubject();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentSubjectIndex,
    subjectTimeLeft,
    isSubjectCompleted,
    hasQuizzesForCurrentSubject,
    handleAutoSubmitSubject,
  ]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const validAnswers = ["A", "B", "C", "D"];
    if (validAnswers.includes(answer.toUpperCase())) {
      setAnswers((prev) => ({ ...prev, [questionId]: answer.toUpperCase() }));
    } else {
      console.error("Invalid answer selected:", answer);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSubjectQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCompletedSubjects((prev) => new Set(prev).add(currentSubjectIndex));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubjectChange = (subjectIndex: number) => {
    if (
      !completedSubjects.has(currentSubjectIndex) &&
      currentSubjectIndex !== subjectIndex
    ) {
      setError(
        "Please complete all questions in the current subject before switching."
      );
      return;
    }
    setError(null);
    setCurrentSubjectIndex(subjectIndex);
    setCurrentQuestionIndex(0);
  };
  
  const updateAttemptStatus = async (
    attemptId: string,
    status: string,
    score?: number
  ) => {
    try {
      const updateData: { status: string; completed_at?: string | null; score?: number } = {
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      };

      if (score !== undefined) {
        updateData.score = score;
      }

      const { error } = await supabase
        .from("attempts")
        .update(updateData)
        .eq("id", attemptId);

      if (error) {
        console.error("Error updating attempt status:", error);
      }
    } catch (error) {
      console.error("Error in updateAttemptStatus:", error);
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      // Save all answers first
      const allAnswers = Object.entries(answers)
        .map(([questionId, selected_option]) => {
          const question = quizData.questions.find((q) => q.id === questionId);
          return {
            attempt_id: attemptIds[question?.subject_id || ""],
            question_id: questionId,
            selected_option,
            student_id: authdStudent?.id,
            subject_id: question?.subject_id,
            created_at: new Date().toISOString(),
          };
        })
        .filter((answer) => answer.attempt_id);

      if (allAnswers.length > 0) {
        const { error: saveError } = await supabase
          .from("attempt_answers")
          .insert(allAnswers);

        if (saveError) {
          console.error("Error saving all answers:", saveError);
        }
      }

      // Calculate and save results
      const results = await calculateResults();
      setQuizResults(results);

      // Update all attempt statuses to completed with scores
      for (const [subjectId, result] of Object.entries(
        results.subjectResults
      )) {
        const attemptId = attemptIds[subjectId];
        if (attemptId) {
          await updateAttemptStatus(attemptId, "completed", result.percentage);

          // Also save to quiz_scores table for better tracking
          await saveQuizScore(attemptId, subjectId, result.percentage);
        }
      }

      setShowResults(true);
    } catch (error) {
      console.error("Error in handleSubmitAll:", error);
      setIsSubmitting(false);
    }
  };

// save quiz scores
  const saveQuizScore = async (
    attemptId: string,
    subjectId: string,
    score: number
  ) => {
    try {
      const { error } = await supabase.from("quiz_scores").insert({
        attempt_id: attemptId,
        student_id: authdStudent?.id,
        subject_id: subjectId,
        score: score,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving quiz score:", error);
      }
    } catch (error) {
      console.error("Error in saveQuizScore:", error);
    }
  };

  const calculateResults = async (): Promise<QuizResults> => {
    const subjectResults: Record<string, SubjectResult> = {};

    quizData.subjects.forEach((subject) => {
      const subjectQuestions = quizData.questions.filter(
        (q) => q.subject_id === subject.id
      );
      const subjectAnswers = Object.entries(answers).filter(([questionId]) =>
        subjectQuestions.some((q) => q.id === questionId)
      );

      let correctAnswers = 0;
      subjectAnswers.forEach(([questionId, userAnswer]) => {
        const question = subjectQuestions.find((q) => q.id === questionId);
        if (question && userAnswer === question.correct_option) {
          correctAnswers++;
        }
      });

      const totalQuestions = subjectQuestions.length;
      const percentage =
        totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const passed = percentage >= 55;

      subjectResults[subject.id] = {
        correct: correctAnswers,
        total: totalQuestions,
        percentage: Math.round(percentage),
        passed,
      };
    });

    const overallPassed = Object.values(subjectResults).every(
      (result) => result.passed
    );

    return {
      subjectResults,
      overallPassed,
      timestamp: new Date().toISOString(),
      attemptIds,
    };
  };

  // Return all the necessary functions and state
  return {
    // State
    currentSubjectIndex,
    currentQuestionIndex,
    answers,
    subjectTimeLeft,
    isSubmitting,
    error,
    completedSubjects,
    attemptIds,
    isLoading,
    showResults,
    quizResults,

    // State setters
    setCurrentSubjectIndex,
    setCurrentQuestionIndex,
    setAnswers,
    setError,
    setIsLoading,
    setAttemptIds,

    // Functions
    handleAnswerSelect,
    handleSubjectChange,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmitAll,
    handleAutoSubmitSubject,
    saveAnswersForCurrentSubject,

    // Derived values
    currentSubject,
    currentSubjectQuestions,
    isLastQuestionInSubject,
    isSubjectCompleted,
    hasQuizzesForCurrentSubject,
  };
};
