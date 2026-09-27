import { useState, useMemo, useCallback } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import {
  normalizePlan,
  checkSubjectAccess,
  checkPastQuestionYearAccess,
  checkVideoAccess,
  checkPdfAccess,
  checkQuizModeAccess,
  checkTimedQuizAccess,
  checkExamSimulationAccess,
  checkJambSimulationAccess,
  checkAnalyticsAccess,
  checkRecommendationsAccess,
  checkSparkDailyUsageAccess,
  checkSparkSocraticAccess,
  checkSparkPersonalizedSupportAccess,
  checkAIProctoringAccess,
  checkProctoredMockAccess,
  getMaxAllowedSubjects,
  getTodayTimedQuizCount,
  incrementTodayTimedQuizCount,
  getTodaySparkCount,
  incrementTodaySparkCount,
  getSparkDailyLimit,
  getProctoredMocksCount,
  incrementProctoredMocksCount,
  STANDARD_MAX_PROCTORED_MOCKS,
  PREMIUM_FAIR_USE_PROCTORED_MOCKS,
  PLAN_CONFIGS,
  BASIC_MAX_DAILY_TIMED_QUIZZES,
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

  const maxAllowedSubjects = useMemo(() => {
    return getMaxAllowedSubjects(effectivePlan);
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

  const verifySubject = useCallback(
    (subjectIndex: number, subjectName?: string): EntitlementCheckResult => {
      return checkSubjectAccess(effectivePlan, subjectIndex, subjectName);
    },
    [effectivePlan]
  );

  const verifyPQYear = useCallback(
    (year: string): EntitlementCheckResult => {
      return checkPastQuestionYearAccess(effectivePlan, year);
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

  const verifyQuizMode = useCallback(
    (mode: string, selectedSubjectCount: number = 1): EntitlementCheckResult => {
      return checkQuizModeAccess(effectivePlan, mode, selectedSubjectCount);
    },
    [effectivePlan]
  );

  const verifyTimedQuiz = useCallback(
    (customTodayCount?: number): EntitlementCheckResult => {
      const todayCount = customTodayCount !== undefined
        ? customTodayCount
        : getTodayTimedQuizCount(authdStudent?.id);
      return checkTimedQuizAccess(effectivePlan, todayCount);
    },
    [effectivePlan, authdStudent?.id]
  );

  const verifyExamSimulation = useCallback((): EntitlementCheckResult => {
    return checkExamSimulationAccess(effectivePlan);
  }, [effectivePlan]);

  const verifyJambSimulation = useCallback(
    (subjectCount: number = 4): EntitlementCheckResult => {
      return checkJambSimulationAccess(effectivePlan, subjectCount);
    },
    [effectivePlan]
  );

  const verifyAnalytics = useCallback(
    (
      viewType: "basic" | "detailed_breakdown" | "deep_analytics" = "detailed_breakdown"
    ): EntitlementCheckResult => {
      return checkAnalyticsAccess(effectivePlan, viewType);
    },
    [effectivePlan]
  );

  const verifyRecommendations = useCallback(
    (
      type: "basic_guidance" | "personalized_paths" | "advanced_intelligence" = "personalized_paths"
    ): EntitlementCheckResult => {
      return checkRecommendationsAccess(effectivePlan, type);
    },
    [effectivePlan]
  );

  const verifySparkDailyUsage = useCallback(
    (customTodayCount?: number): EntitlementCheckResult => {
      const todayCount = customTodayCount !== undefined
        ? customTodayCount
        : getTodaySparkCount(authdStudent?.id);
      return checkSparkDailyUsageAccess(effectivePlan, todayCount);
    },
    [effectivePlan, authdStudent?.id]
  );

  const verifySparkSocratic = useCallback(() => {
    return checkSparkSocraticAccess(effectivePlan);
  }, [effectivePlan]);

  const verifySparkPersonalized = useCallback(() => {
    return checkSparkPersonalizedSupportAccess(effectivePlan);
  }, [effectivePlan]);

  const verifyAIProctoring = useCallback((): EntitlementCheckResult => {
    return checkAIProctoringAccess(effectivePlan);
  }, [effectivePlan]);

  const verifyProctoredMock = useCallback(
    (customPeriodCount?: number): EntitlementCheckResult => {
      const periodCount = customPeriodCount !== undefined
        ? customPeriodCount
        : getProctoredMocksCount(authdStudent?.id);
      return checkProctoredMockAccess(effectivePlan, periodCount);
    },
    [effectivePlan, authdStudent?.id]
  );

  const maxDailySpark = useMemo(() => {
    return getSparkDailyLimit(effectivePlan);
  }, [effectivePlan]);

  const maxProctoredMocks = useMemo(() => {
    return effectivePlan === "premium" ? PREMIUM_FAIR_USE_PROCTORED_MOCKS : STANDARD_MAX_PROCTORED_MOCKS;
  }, [effectivePlan]);

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
    maxAllowedSubjects,
    // Batch 1 Verifications
    verifySubject,
    verifyPQYear,
    verifyVideo,
    verifyPdf,
    verifyQuizMode,
    // Batch 2 Verifications
    verifyTimedQuiz,
    verifyExamSimulation,
    verifyJambSimulation,
    verifyAnalytics,
    verifyRecommendations,
    // Batch 3 Verifications
    verifySparkDailyUsage,
    verifySparkSocratic,
    verifySparkPersonalized,
    verifyAIProctoring,
    verifyProctoredMock,
    // Tracking helpers
    todayTimedQuizCount: getTodayTimedQuizCount(authdStudent?.id),
    recordTimedQuizAttempt: () => incrementTodayTimedQuizCount(authdStudent?.id),
    maxDailyTimedQuizzes: BASIC_MAX_DAILY_TIMED_QUIZZES,
    todaySparkCount: getTodaySparkCount(authdStudent?.id),
    recordSparkInteraction: () => incrementTodaySparkCount(authdStudent?.id),
    maxDailySpark,
    proctoredMocksCount: getProctoredMocksCount(authdStudent?.id),
    recordProctoredMockAttempt: () => incrementProctoredMocksCount(authdStudent?.id),
    maxProctoredMocks,
    // Modal
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  };
}
