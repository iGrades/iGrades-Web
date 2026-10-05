import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import {
  normalizePlan,
  checkSubjectAccess,
  checkPastQuestionYearAccess,
  checkVideoAccess,
  checkPdfAccess,
  checkExamModeAccess,
  checkTutorAccess,
  checkPointsAccess,
  BASIC_MONTHLY_EXAM_ATTEMPTS,
  STANDARD_MONTHLY_EXAM_ATTEMPTS,
  PLAN_CONFIGS,
  type PlanTier,
  type EntitlementCheckResult,
} from "@/services/subscriptionEntitlements";

export interface UpgradeModalState {
  isOpen: boolean;
  featureName: string;
  requiredPlan: PlanTier;
  reason?: string;
}

export function useSubscriptionEntitlement() {
  const { authdStudent, loading: isStudentLoading, fetchError: studentFetchError } = useAuthdStudentData();

  const { plan, effectivePlan, isActive, isExpired } = useMemo(() => {
    return normalizePlan(authdStudent?.subscription, authdStudent?.subscription_status);
  }, [authdStudent?.subscription, authdStudent?.subscription_status]);

  const isBasic = effectivePlan === "basic";
  const isStandard = effectivePlan === "standard";
  const isPremium = effectivePlan === "premium";
  const isMissing = !authdStudent?.subscription;

  const planDetails = useMemo(() => {
    return PLAN_CONFIGS[effectivePlan];
  }, [effectivePlan]);

  // Modal prompt state
  const [modalState, setModalState] = useState<UpgradeModalState>({
    isOpen: false,
    featureName: "",
    requiredPlan: "standard",
    reason: undefined,
  });

  const promptUpgrade = useCallback(
    (featureName: string, requiredPlan: PlanTier = "standard", reason?: string) => {
      setModalState({
        isOpen: true,
        featureName,
        requiredPlan,
        reason,
      });
    },
    []
  );

  const closeUpgradeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // ── Authoritative Monthly Exam Attempt State ─────────────────────────────
  const [monthlyExamAttempts, setMonthlyExamAttempts] = useState<number>(0);
  const [isExamUsageLoading, setIsExamUsageLoading] = useState<boolean>(false);

  const maxMonthlyExamAttempts = useMemo(() => {
    if (effectivePlan === "premium") return Infinity;
    if (effectivePlan === "standard") return STANDARD_MONTHLY_EXAM_ATTEMPTS;
    return BASIC_MONTHLY_EXAM_ATTEMPTS;
  }, [effectivePlan]);

  const examAttemptStatusText = useMemo(() => {
    if (effectivePlan === "premium") return "Unlimited exam access";
    if (effectivePlan === "standard") return `${monthlyExamAttempts} of 20 exam attempts used`;
    return `${monthlyExamAttempts} of 1 exam attempts used`;
  }, [effectivePlan, monthlyExamAttempts]);

  const canTakeExamMode = useMemo(() => {
    if (effectivePlan === "premium") return true;
    if (effectivePlan === "standard") return monthlyExamAttempts < STANDARD_MONTHLY_EXAM_ATTEMPTS;
    return monthlyExamAttempts < BASIC_MONTHLY_EXAM_ATTEMPTS;
  }, [effectivePlan, monthlyExamAttempts]);

  // Fetch authoritative monthly exam usage from server / database
  const refreshExamUsage = useCallback(async () => {
    if (!authdStudent?.id) return;
    try {
      setIsExamUsageLoading(true);
      const res = await fetch(`/api/subscription/exam-usage/${authdStudent.id}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.monthlyAttemptsUsed === "number") {
          setMonthlyExamAttempts(data.monthlyAttemptsUsed);
        }
      }
    } catch (e) {
      console.warn("Could not fetch authoritative exam usage, maintaining local count:", e);
    } finally {
      setIsExamUsageLoading(false);
    }
  }, [authdStudent?.id]);

  useEffect(() => {
    refreshExamUsage();
  }, [refreshExamUsage]);

  // ── Feature Verifications ──────────────────────────────────────────────────

  /**
   * Exam Mode Take verification:
   * Only called when student starts an exam attempt.
   */
  const verifyExamModeTake = useCallback((): EntitlementCheckResult => {
    return checkExamModeAccess(effectivePlan, monthlyExamAttempts);
  }, [effectivePlan, monthlyExamAttempts]);

  /**
   * Mode verification during quiz setup.
   * Quick test is always allowed for all.
   * Examination mode evaluates monthly attempts.
   */
  const verifyQuizMode = useCallback(
    (mode: string, _selectedSubjectCount: number = 1): EntitlementCheckResult => {
      const normMode = (mode || "").trim().toLowerCase();
      if (normMode !== "examination") {
        return { allowed: true, requiredPlan: "basic", isLocked: false };
      }
      return checkExamModeAccess(effectivePlan, monthlyExamAttempts);
    },
    [effectivePlan, monthlyExamAttempts]
  );

  /**
   * Past Question Year verification (protected recent 5 years).
   */
  const verifyPQYear = useCallback(
    (year: string, availableYears?: string[]): EntitlementCheckResult => {
      return checkPastQuestionYearAccess(effectivePlan, year, availableYears);
    },
    [effectivePlan]
  );

  /**
   * Learning with a Tutor verification (Premium only).
   */
  const verifyTutorAccess = useCallback((): EntitlementCheckResult => {
    return checkTutorAccess(effectivePlan);
  }, [effectivePlan]);

  /**
   * Subjects, Video lessons, and PDFs are NEVER paywalled (Core Learning).
   */
  const verifySubject = useCallback(
    (subjectIndex: number, subjectName?: string): EntitlementCheckResult => {
      return checkSubjectAccess(effectivePlan, subjectIndex, subjectName);
    },
    [effectivePlan]
  );

  const verifyVideo = useCallback(
    (videoIndex: number, videoTitle?: string): EntitlementCheckResult => {
      return checkVideoAccess(effectivePlan, videoIndex, videoTitle);
    },
    [effectivePlan]
  );

  const verifyPdf = useCallback(
    (pdfIndex: number, pdfTitle?: string): EntitlementCheckResult => {
      return checkPdfAccess(effectivePlan, pdfIndex, pdfTitle);
    },
    [effectivePlan]
  );

  const verifyPoints = useCallback(
    (feature: "earning" | "viewing" | "streaks" | "history" | "conversion" = "viewing") => {
      return checkPointsAccess(effectivePlan, feature);
    },
    [effectivePlan]
  );

  // Backward compatibility stubs for legacy components
  const verifyTimedQuiz = useCallback((): EntitlementCheckResult => {
    return { allowed: true, requiredPlan: "basic", isLocked: false };
  }, []);

  const verifyExamSimulation = useCallback((): EntitlementCheckResult => {
    return checkExamModeAccess(effectivePlan, monthlyExamAttempts);
  }, [effectivePlan, monthlyExamAttempts]);

  const verifyJambSimulation = useCallback((): EntitlementCheckResult => {
    return checkExamModeAccess(effectivePlan, monthlyExamAttempts);
  }, [effectivePlan, monthlyExamAttempts]);

  const verifyAnalytics = useCallback((): EntitlementCheckResult => {
    return { allowed: true, requiredPlan: "basic", isLocked: false };
  }, []);

  const verifyRecommendations = useCallback((): EntitlementCheckResult => {
    return { allowed: true, requiredPlan: "basic", isLocked: false };
  }, []);

  const verifyAIProctoring = useCallback((): EntitlementCheckResult => {
    return { allowed: true, requiredPlan: "basic", isLocked: false };
  }, []);

  const verifyProctoredMock = useCallback((): EntitlementCheckResult => {
    return checkExamModeAccess(effectivePlan, monthlyExamAttempts);
  }, [effectivePlan, monthlyExamAttempts]);

  return {
    rawPlan: plan,
    effectivePlan,
    isActive,
    isExpired,
    isBasic,
    isStandard,
    isPremium,
    isMissing,
    loading: isStudentLoading,
    fetchError: studentFetchError,
    planDetails,
    maxAllowedSubjects: 100,

    // Monthly Exam Mode state & verification
    monthlyExamAttempts,
    maxMonthlyExamAttempts,
    canTakeExamMode,
    examAttemptStatusText,
    isExamUsageLoading,
    refreshExamUsage,
    verifyExamModeTake,
    verifyQuizMode,

    // Past Questions verification
    verifyPQYear,

    // Tutor verification
    verifyTutorAccess,

    // Core Learning (always allowed)
    verifySubject,
    verifyVideo,
    verifyPdf,
    verifyPoints,

    // Compatibility stubs
    verifyTimedQuiz,
    verifyExamSimulation,
    verifyJambSimulation,
    verifyAnalytics,
    verifyRecommendations,
    verifyAIProctoring,
    verifyProctoredMock,
    todayTimedQuizCount: 0,
    recordTimedQuizAttempt: () => 0,
    maxDailyTimedQuizzes: 999,
    todaySparkCount: 0,
    recordSparkInteraction: () => 0,
    maxDailySpark: 999,
    proctoredMocksCount: monthlyExamAttempts,
    recordProctoredMockAttempt: () => 0,
    maxProctoredMocks: maxMonthlyExamAttempts,

    // Modal helpers
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  };
}
