/**
 * Centralized Entitlement Engine for iGrades Subscription System
 * 
 * CURRENT PLANS:
 * - Basic: ₦0 (Starter access)
 * - Standard: ₦15,000 (Expanded/full access)
 * - Premium: ₦25,000 (Complete premium access)
 */

export type PlanTier = "basic" | "standard" | "premium";
export type SubscriptionStatus = "active" | "expired" | "canceled" | "past_due" | "none";

export interface PlanDetails {
  id: PlanTier;
  name: string;
  priceFormatted: string;
  amount: number;
  description: string;
  features: string[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanDetails> = {
  basic: {
    id: "basic",
    name: "Basic",
    priceFormatted: "₦0",
    amount: 0,
    description: "Foundational access for secondary students",
    features: [
      "Up to 4 starter subjects & curriculum topics",
      "Recent 2 years of Past Questions (2023–2024)",
      "2 starter video lessons per topic",
      "Starter PDF curriculum notes & guides",
      "5 Spark AI interactions per day",
      "Limited Socratic guidance & starter hints",
      "Foundational curriculum & exam readiness guidance",
      "Limited timed practice (up to 3 timed quizzes/day, 1 subject)",
      "Basic score history, overall accuracy & progress",
      "AI Proctoring & Proctored Mock Exams not included",
      "Parent Portal: 1 connected child",
      "Parent Progress Dashboard: Basic quiz history, average scores & activity",
      "Parent Reports: Basic progress information",
      "Parent Intelligence: Basic progress visibility",
    ],
  },
  standard: {
    id: "standard",
    name: "Standard",
    priceFormatted: "₦15,000",
    amount: 15000,
    description: "Comprehensive learning access with full examination tools",
    features: [
      "Expanded access to all secondary subjects",
      "10-year Past Questions archive (all exam boards)",
      "Full video lesson catalog without limits",
      "Complete PDF revision guides & formula sheets",
      "30 Spark AI interactions per day",
      "Included/generous multi-level Socratic tutoring & worked guidance",
      "Personalized guidance & misconception support",
      "Limited AI Proctoring access for mock examinations",
      "Limited number of proctored mock exams (up to 3 mocks)",
      "Full-length Examination Mode & JAMB 4-subject simulation",
      "Detailed performance breakdown & topic strengths/weaknesses",
      "Personalized study recommendations & study paths",
      "Parent Portal: Up to 3 connected children",
      "Parent Progress Dashboard: Subject performance and progress trends",
      "Parent Reports: Weekly progress reporting & digests",
      "Parent Intelligence: Useful progress insights & actionable guidance",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceFormatted: "₦25,000",
    amount: 25000,
    description: "Complete academic mastery with advanced tutoring & analytics",
    features: [
      "Everything in Standard Plan",
      "Highest/generous Spark AI usage subject to fair-use policy",
      "Advanced cognitive Socratic tutoring & step-by-step derivations",
      "Advanced personalized tutoring & longitudinal misconception support",
      "Full unrestricted AI Proctoring with live vision & audio monitoring",
      "Generous/fair-use access to proctored mock exams",
      "Generous/full timed practice & priority exam simulations",
      "Deep & advanced learning analytics with AI diagnostics",
      "Priority access to study materials & mock examinations",
      "Early access to newly released curriculum resources",
      "Parent Portal: Up to 5 connected children",
      "Parent Progress Dashboard: Advanced learning intelligence & longitudinal trends",
      "Parent Reports: Advanced & detailed reporting with comprehensive digests",
      "Parent Intelligence: Advanced learning intelligence & deeper actionable insights",
    ],
  },
};

/**
 * Normalizes subscription plan and handles expired / inactive states
 */
export function normalizePlan(
  rawPlan?: string | null,
  rawStatus?: string | null
): { plan: PlanTier; effectivePlan: PlanTier; isActive: boolean; isExpired: boolean } {
  const statusLower = (rawStatus || "").trim().toLowerCase();
  const isExpired = statusLower === "expired" || statusLower === "canceled" || statusLower === "past_due";

  let detectedPlan: PlanTier = "basic";
  if (rawPlan) {
    const p = rawPlan.trim().toLowerCase();
    if (p.includes("premium")) {
      detectedPlan = "premium";
    } else if (p.includes("standard")) {
      detectedPlan = "standard";
    } else {
      detectedPlan = "basic";
    }
  }

  // If status is expired/inactive and the user held a paid tier, effective access reverts to basic
  const isActive = !isExpired && (statusLower === "active" || detectedPlan === "basic" || !statusLower);
  const effectivePlan: PlanTier = isActive ? detectedPlan : "basic";

  return {
    plan: detectedPlan,
    effectivePlan,
    isActive,
    isExpired,
  };
}

export interface EntitlementCheckResult {
  allowed: boolean;
  requiredPlan: PlanTier;
  reason?: string;
  isLocked?: boolean;
}

// 1. SUBJECT & CONTENT ACCESS
export function checkSubjectAccess(
  effectivePlan: PlanTier,
  subjectIndex: number,
  _subjectName?: string
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  // Basic plan provides starter/selected subjects (up to 4 subjects)
  const maxBasicSubjects = 4;
  if (subjectIndex < maxBasicSubjects) {
    return { allowed: true, requiredPlan: "basic" };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: `Basic plan includes your first ${maxBasicSubjects} starter subjects. Upgrade to Standard to unlock all registered subjects and curriculum topics.`,
  };
}

export function getMaxAllowedSubjects(effectivePlan: PlanTier): number {
  switch (effectivePlan) {
    case "premium":
      return 16;
    case "standard":
      return 8;
    case "basic":
    default:
      return 4;
  }
}

// 2. PAST QUESTIONS (PQs)
export const STARTER_PQ_YEARS = ["2024", "2023"];

export function checkPastQuestionYearAccess(
  effectivePlan: PlanTier,
  year: string
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  // Basic tier allows starter years (2024 and 2023)
  if (STARTER_PQ_YEARS.includes(year)) {
    return { allowed: true, requiredPlan: "basic" };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: `Past Questions from ${year} are part of the full 10-year examination archives. Upgrade to Standard to access all past questions from 2015 to 2024.`,
  };
}

// 3. VIDEO LESSONS
export const BASIC_MAX_VIDEOS_PER_TOPIC = 2;

export function checkVideoAccess(
  effectivePlan: PlanTier,
  videoIndex: number,
  _videoTitle?: string
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (videoIndex < BASIC_MAX_VIDEOS_PER_TOPIC) {
    return { allowed: true, requiredPlan: "basic" };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: `The Basic plan provides ${BASIC_MAX_VIDEOS_PER_TOPIC} starter video lessons per topic. Upgrade to Standard to unlock the complete video library.`,
  };
}

// 4. PDF LEARNING MATERIALS
export const BASIC_MAX_PDFS_PER_TOPIC = 2;

export function checkPdfAccess(
  effectivePlan: PlanTier,
  pdfIndex: number,
  _pdfTitle?: string
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (pdfIndex < BASIC_MAX_PDFS_PER_TOPIC) {
    return { allowed: true, requiredPlan: "basic" };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: `Basic plan includes starter curriculum summary notes. Upgrade to Standard for full access to all comprehensive revision packs and formula guides.`,
  };
}

// 5. QUIZZES & PRACTICE
export function checkQuizModeAccess(
  effectivePlan: PlanTier,
  mode: "quick test" | "examination" | string,
  selectedSubjectCount: number = 1
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  // Basic restrictions:
  // 1. Examination mode is locked (Standard or Premium only)
  const normalizedMode = mode.toLowerCase().trim();
  if (normalizedMode === "examination") {
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Full-length Examination mode (60 questions in 60 mins simulating real WAEC, JAMB, and NECO exams) requires a Standard or Premium subscription.",
    };
  }

  // 2. Multi-subject testing requires Standard or Premium
  if (selectedSubjectCount > 1) {
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Combined multi-subject quiz practice is available on Standard and Premium plans. On the Basic plan, you can take Quick Tests on 1 subject at a time.",
    };
  }

  return { allowed: true, requiredPlan: "basic" };
}

// ── BATCH 2 SUBSCRIPTION & PAYWALL FEATURE AREAS ─────────────────────────

// 1. TIMED QUIZZES
export const BASIC_MAX_DAILY_TIMED_QUIZZES = 3;

export function checkTimedQuizAccess(
  effectivePlan: PlanTier,
  todayCount: number = 0
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  // Basic tier allows limited timed practice (up to 3 timed quizzes/day)
  if (todayCount < BASIC_MAX_DAILY_TIMED_QUIZZES) {
    return { allowed: true, requiredPlan: "basic" };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: `You have completed all ${BASIC_MAX_DAILY_TIMED_QUIZZES} daily timed practice quizzes included in the Basic plan. Upgrade to Standard (₦15,000) for generous timed practice without daily restrictions.`,
  };
}

// 2. FULL EXAM SIMULATIONS
export function checkExamSimulationAccess(
  effectivePlan: PlanTier
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: "Full Examination simulation mode (60 questions in 60 mins under real WAEC, NECO, and BECE conditions) is not available on Basic. Upgrade to Standard (₦15,000) to unlock full exam simulations.",
  };
}

// 3. JAMB 4-SUBJECT SIMULATION
export function checkJambSimulationAccess(
  effectivePlan: PlanTier,
  _subjectCount: number = 4
): EntitlementCheckResult {
  if (effectivePlan === "premium" || effectivePlan === "standard") {
    return { allowed: true, requiredPlan: "basic" };
  }

  return {
    allowed: false,
    requiredPlan: "standard",
    isLocked: true,
    reason: "JAMB UTME 4-Subject Mock Simulation is an examination-grade simulation available on Standard and Premium plans. On the Basic plan, you can practice 1 subject at a time.",
  };
}

// 4. DETAILED PERFORMANCE ANALYTICS
export function checkAnalyticsAccess(
  effectivePlan: PlanTier,
  viewType: "basic" | "detailed_breakdown" | "deep_analytics" = "detailed_breakdown"
): EntitlementCheckResult {
  if (viewType === "basic") {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (viewType === "detailed_breakdown") {
    if (effectivePlan === "premium" || effectivePlan === "standard") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Detailed performance breakdown and subject/topic strengths & weaknesses require a Standard or Premium subscription. Upgrade to Standard (₦15,000) to see full diagnostic analytics.",
    };
  }

  if (viewType === "deep_analytics") {
    if (effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: "Deep longitudinal performance analytics and advanced exam-readiness insights require a Premium (₦25,000) subscription.",
    };
  }

  return { allowed: true, requiredPlan: "basic" };
}

// 5. PERSONALIZED RECOMMENDATIONS
export function checkRecommendationsAccess(
  effectivePlan: PlanTier,
  type: "basic_guidance" | "personalized_paths" | "advanced_intelligence" = "personalized_paths"
): EntitlementCheckResult {
  if (type === "basic_guidance") {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (type === "personalized_paths") {
    if (effectivePlan === "premium" || effectivePlan === "standard") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Personalized study recommendations and tailored revision paths require a Standard or Premium subscription. Upgrade to Standard (₦15,000) to get customized topic recommendations.",
    };
  }

  if (type === "advanced_intelligence") {
    if (effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: "Advanced personalized learning intelligence with Spark AI tutoring integration requires a Premium (₦25,000) subscription.",
    };
  }

  return { allowed: true, requiredPlan: "basic" };
}

// ── BATCH 3 SUBSCRIPTION & PAYWALL FEATURE AREAS ─────────────────────────

// 1. SPARK DAILY USAGE
export const BASIC_MAX_DAILY_SPARK = 5;
export const STANDARD_MAX_DAILY_SPARK = 30;
export const PREMIUM_FAIR_USE_DAILY_SPARK = 150;

export function getSparkDailyLimit(effectivePlan: PlanTier): number {
  switch (effectivePlan) {
    case "premium":
      return PREMIUM_FAIR_USE_DAILY_SPARK;
    case "standard":
      return STANDARD_MAX_DAILY_SPARK;
    case "basic":
    default:
      return BASIC_MAX_DAILY_SPARK;
  }
}

export function checkSparkDailyUsageAccess(
  effectivePlan: PlanTier,
  todayCount: number = 0
): EntitlementCheckResult {
  if (effectivePlan === "basic") {
    if (todayCount < BASIC_MAX_DAILY_SPARK) {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: `You have completed all ${BASIC_MAX_DAILY_SPARK} daily Spark AI interactions included in the Basic plan. Upgrade to Standard (₦15,000) for 30 daily questions, or Premium for generous fair-use access.`,
    };
  }

  if (effectivePlan === "standard") {
    if (todayCount < STANDARD_MAX_DAILY_SPARK) {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: `You have reached your limit of ${STANDARD_MAX_DAILY_SPARK} daily Spark interactions on the Standard plan. Upgrade to Premium (₦25,000) for highest/generous daily usage subject to fair-use limits.`,
    };
  }

  // Premium: generous usage subject to fair-use policy
  if (todayCount < PREMIUM_FAIR_USE_DAILY_SPARK) {
    return { allowed: true, requiredPlan: "basic" };
  }
  return {
    allowed: false,
    requiredPlan: "premium",
    isLocked: true,
    reason: `You have reached today's generous fair-use threshold (${PREMIUM_FAIR_USE_DAILY_SPARK} interactions) for Spark AI tutoring. Your daily usage resets at midnight.`,
  };
}

// 2. SPARK SOCRATIC GUIDANCE
export function checkSparkSocraticAccess(
  effectivePlan: PlanTier
): { tier: "limited" | "generous" | "advanced"; maxLevel: number; description: string } {
  switch (effectivePlan) {
    case "premium":
      return {
        tier: "advanced",
        maxLevel: 6,
        description: "Advanced cognitive scaffolding, deep step-by-step derivations, and full Socratic resolution.",
      };
    case "standard":
      return {
        tier: "generous",
        maxLevel: 6,
        description: "Included/generous multi-level adaptive Socratic tutoring, concept breakdowns, and worked guidance.",
      };
    case "basic":
    default:
      return {
        tier: "limited",
        maxLevel: 2,
        description: "Limited Socratic guidance with introductory guiding questions and starter hints.",
      };
  }
}

// 3. SPARK PERSONALIZED LEARNING SUPPORT
export function checkSparkPersonalizedSupportAccess(
  effectivePlan: PlanTier
): { tier: "limited" | "personalized" | "advanced"; description: string } {
  switch (effectivePlan) {
    case "premium":
      return {
        tier: "advanced",
        description: "Advanced personalized tutoring, longitudinal diagnostic feedback, and targeted misconception remediation.",
      };
    case "standard":
      return {
        tier: "personalized",
        description: "Personalized guidance, weak-topic focus, and misconception diagnosis.",
      };
    case "basic":
    default:
      return {
        tier: "limited",
        description: "Basic curriculum guidance and general study tips.",
      };
  }
}

// 4. AI PROCTORING
export function checkAIProctoringAccess(
  effectivePlan: PlanTier
): EntitlementCheckResult {
  if (effectivePlan === "basic") {
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "AI Proctoring (automated webcam vision, microphone, and screen integrity monitoring) is not available on the Basic plan. Upgrade to Standard or Premium to take proctored examinations.",
    };
  }

  if (effectivePlan === "standard") {
    return {
      allowed: true,
      requiredPlan: "standard",
      reason: "Standard plan provides limited AI Proctoring access for your scheduled mock examinations.",
    };
  }

  return {
    allowed: true,
    requiredPlan: "premium",
    reason: "Premium plan provides full, unrestricted AI Proctoring access for all examination simulations.",
  };
}

// 5. PROCTORED MOCK EXAMS
export const STANDARD_MAX_PROCTORED_MOCKS = 3;
export const PREMIUM_FAIR_USE_PROCTORED_MOCKS = 25;

export function checkProctoredMockAccess(
  effectivePlan: PlanTier,
  periodCount: number = 0
): EntitlementCheckResult {
  if (effectivePlan === "basic") {
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Proctored Mock Exams are not available on the Basic plan. Upgrade to Standard (₦15,000) for proctored mock examinations, or Premium for generous fair-use access.",
    };
  }

  if (effectivePlan === "standard") {
    if (periodCount < STANDARD_MAX_PROCTORED_MOCKS) {
      return { allowed: true, requiredPlan: "standard" };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: `You have completed all ${STANDARD_MAX_PROCTORED_MOCKS} proctored mock exams included in your Standard plan for this billing cycle. Upgrade to Premium (₦25,000) for generous/fair-use proctored mock exam access.`,
    };
  }

  // Premium: generous fair-use limit
  if (periodCount < PREMIUM_FAIR_USE_PROCTORED_MOCKS) {
    return { allowed: true, requiredPlan: "premium" };
  }
  return {
    allowed: false,
    requiredPlan: "premium",
    isLocked: true,
    reason: `You have reached this billing cycle's generous fair-use limit of ${PREMIUM_FAIR_USE_PROCTORED_MOCKS} proctored mock exams on Premium.`,
  };
}

// Helper utilities for tracking daily timed quizzes
export function getTodayTimedQuizCount(studentId?: string): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const today = new Date().toISOString().split("T")[0];
  const key = `igrade_timed_quizzes_${studentId || "guest"}_${today}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementTodayTimedQuizCount(studentId?: string): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const today = new Date().toISOString().split("T")[0];
  const key = `igrade_timed_quizzes_${studentId || "guest"}_${today}`;
  try {
    const current = getTodayTimedQuizCount(studentId);
    const updated = current + 1;
    localStorage.setItem(key, updated.toString());
    return updated;
  } catch {
    return 0;
  }
}

// Helper utilities for tracking daily Spark AI interactions
export function getTodaySparkCount(studentId?: string): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const today = new Date().toISOString().split("T")[0];
  const key = `igrade_spark_usage_${studentId || "guest"}_${today}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementTodaySparkCount(studentId?: string): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const today = new Date().toISOString().split("T")[0];
  const key = `igrade_spark_usage_${studentId || "guest"}_${today}`;
  try {
    const current = getTodaySparkCount(studentId);
    const updated = current + 1;
    localStorage.setItem(key, updated.toString());
    return updated;
  } catch {
    return 0;
  }
}

export function setTodaySparkCount(count: number, studentId?: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const today = new Date().toISOString().split("T")[0];
  const key = `igrade_spark_usage_${studentId || "guest"}_${today}`;
  try {
    localStorage.setItem(key, count.toString());
  } catch {
    // ignore
  }
}

// Helper utilities for tracking proctored mock exams
export function getProctoredMocksCount(studentId?: string): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const key = `igrade_proctored_mocks_${studentId || "guest"}_${currentMonth}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementProctoredMocksCount(studentId?: string): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const key = `igrade_proctored_mocks_${studentId || "guest"}_${currentMonth}`;
  try {
    const current = getProctoredMocksCount(studentId);
    const updated = current + 1;
    localStorage.setItem(key, updated.toString());
    return updated;
  } catch {
    return 0;
  }
}

// ── BATCH 4 PARENT PORTAL SUBSCRIPTION & PAYWALL FEATURE AREAS ─────────

// 1. MULTIPLE CHILDREN LIMITS
export const PARENT_CHILD_LIMITS: Record<PlanTier, number> = {
  basic: 1,
  standard: 3,
  premium: 5,
};

export function getMaxChildrenAllowed(effectivePlan: PlanTier): number {
  return PARENT_CHILD_LIMITS[effectivePlan] || 1;
}

export function checkAddChildAccess(
  effectivePlan: PlanTier,
  currentChildCount: number
): EntitlementCheckResult {
  const maxAllowed = getMaxChildrenAllowed(effectivePlan);
  if (currentChildCount < maxAllowed) {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (effectivePlan === "basic") {
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: `Your Basic parent account includes connection for 1 child. Upgrade to Standard to connect up to 3 children, or Premium for up to 5 children.`,
    };
  }

  if (effectivePlan === "standard") {
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: `You have reached the maximum of ${PARENT_CHILD_LIMITS.standard} children on your Standard plan. Upgrade to Premium to connect up to 5 children.`,
    };
  }

  return {
    allowed: false,
    requiredPlan: "premium",
    isLocked: true,
    reason: `You have reached the maximum family limit of ${PARENT_CHILD_LIMITS.premium} connected children on the Premium plan. Contact support for customized institutional plans.`,
  };
}

// 2. PARENT PROGRESS DASHBOARD
// Basic: Basic quiz history, average scores, and activity
// Standard: Subject performance and progress trends
// Premium: Advanced learning intelligence
export function checkParentDashboardSectionAccess(
  effectivePlan: PlanTier,
  section: "basic_metrics" | "recent_activity" | "subject_performance" | "progress_trends" | "advanced_intelligence"
): EntitlementCheckResult {
  if (section === "basic_metrics" || section === "recent_activity") {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (section === "subject_performance" || section === "progress_trends") {
    if (effectivePlan === "standard" || effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Subject performance analysis and longitudinal progress trends require a Standard or Premium parent subscription.",
    };
  }

  // Advanced learning intelligence (exam readiness, attention radar, deep diagnostic breakdowns)
  if (section === "advanced_intelligence") {
    if (effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: "Advanced learning intelligence, exam readiness predictions, and deep cognitive diagnostics require a Premium parent subscription.",
    };
  }

  return { allowed: true, requiredPlan: "basic" };
}

// 3. PARENT REPORTS
// Basic: Basic progress information
// Standard: Weekly progress reporting
// Premium: Advanced/detailed reporting
export function checkParentReportAccess(
  effectivePlan: PlanTier,
  reportType: "basic_summary" | "weekly_report" | "advanced_detailed_report"
): EntitlementCheckResult {
  if (reportType === "basic_summary") {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (reportType === "weekly_report") {
    if (effectivePlan === "standard" || effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Weekly Learning Reports and comprehensive weekly academic digests require a Standard or Premium subscription.",
    };
  }

  if (reportType === "advanced_detailed_report") {
    if (effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: "Advanced granular topic breakdowns, repeated misconception diagnostics, and printable executive reports require a Premium subscription.",
    };
  }

  return { allowed: true, requiredPlan: "basic" };
}

// 4. PARENT LEARNING INTELLIGENCE
// Basic: Basic progress visibility
// Standard: Useful progress insights
// Premium: Advanced learning intelligence and deeper insights
export function checkParentIntelligenceAccess(
  effectivePlan: PlanTier,
  level: "basic_visibility" | "useful_insights" | "advanced_intelligence"
): EntitlementCheckResult {
  if (level === "basic_visibility") {
    return { allowed: true, requiredPlan: "basic" };
  }

  if (level === "useful_insights") {
    if (effectivePlan === "standard" || effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "standard",
      isLocked: true,
      reason: "Actionable parent insights, weak topic highlights, and guided recommendations require a Standard or Premium subscription.",
    };
  }

  if (level === "advanced_intelligence") {
    if (effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "basic" };
    }
    return {
      allowed: false,
      requiredPlan: "premium",
      isLocked: true,
      reason: "Advanced learning intelligence, exam readiness indicators, and deep longitudinal insights require a Premium subscription.",
    };
  }

  return { allowed: true, requiredPlan: "basic" };
}

// ── AREA 1: iGG POINTS ENTITLEMENT (ALWAYS ACCESSIBLE ACROSS ALL TIERS) ──
/**
 * Verifies that iGG Points features (earning, viewing, streaks, history, conversion)
 * remain 100% available and never paywalled across all subscription tiers (Basic, Standard, Premium).
 */
export function checkPointsAccess(
  _effectivePlan: PlanTier,
  _feature: "earning" | "viewing" | "streaks" | "history" | "conversion" = "viewing"
): EntitlementCheckResult {
  return {
    allowed: true,
    requiredPlan: "basic",
    isLocked: false,
    reason: "iGG Points, daily streaks, earning, and reward conversions are freely accessible on all plans.",
  };
}

