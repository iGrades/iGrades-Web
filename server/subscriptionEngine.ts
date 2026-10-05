/**
 * Server-side Subscription & Entitlement Engine for iGrades B2C System
 * Enforces authoritative access control for exam attempts, past question years,
 * and parent features on the server proxy.
 */

export type PlanTier = "basic" | "standard" | "premium";

export class SubscriptionEngine {
  public normalizePlan(
    rawPlan?: string | null,
    rawStatus?: string | null
  ): {
    plan: PlanTier;
    effectivePlan: PlanTier;
    isActive: boolean;
    isExpired: boolean;
  } {
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

    const isActive = !isExpired && (statusLower === "active" || detectedPlan === "basic" || !statusLower);
    const effectivePlan: PlanTier = isActive ? detectedPlan : "basic";

    return {
      plan: detectedPlan,
      effectivePlan,
      isActive,
      isExpired,
    };
  }

  /**
   * Protected past question collection: [2026, 2025, 2024, 2023, 2022]
   * - Basic: All 5 locked
   * - Standard: 2026 & 2025 locked (Premium required); 2024, 2023, 2022 allowed
   * - Premium: All years allowed
   */
  public evaluatePastQuestionAccess(
    effectivePlan: PlanTier,
    year: string
  ): { allowed: boolean; requiredPlan: PlanTier; reason?: string } {
    if (effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "premium" };
    }

    const protected5 = ["2026", "2025", "2024", "2023", "2022"];
    const premiumOnly2 = ["2026", "2025"];
    const standardUnlocked3 = ["2024", "2023", "2022"];

    if (!protected5.includes(year)) {
      // Older archive years (2021 and older) are unlocked
      return { allowed: true, requiredPlan: "basic" };
    }

    if (premiumOnly2.includes(year)) {
      return {
        allowed: false,
        requiredPlan: "premium",
        reason: `Access Denied: Past questions from ${year} are part of the latest examination archive and require a Premium subscription.`,
      };
    }

    if (standardUnlocked3.includes(year)) {
      if (effectivePlan === "standard") {
        return { allowed: true, requiredPlan: "standard" };
      }
      return {
        allowed: false,
        requiredPlan: "standard",
        reason: `Access Denied: The recent 5 years of Past Questions (${year}) require a Standard or Premium subscription.`,
      };
    }

    return { allowed: true, requiredPlan: "basic" };
  }

  /**
   * Exam Mode Attempt Limits:
   * - Basic: 1 attempt per month
   * - Standard: Up to 20 attempts per month
   * - Premium: Full/unlimited access
   */
  public evaluateExamModeAccess(
    effectivePlan: PlanTier,
    currentMonthlyAttempts: number
  ): { allowed: boolean; requiredPlan: PlanTier; reason?: string; maxAllowed: number } {
    if (effectivePlan === "premium") {
      return { allowed: true, requiredPlan: "premium", maxAllowed: Infinity };
    }

    if (effectivePlan === "standard") {
      if (currentMonthlyAttempts < 20) {
        return { allowed: true, requiredPlan: "standard", maxAllowed: 20 };
      }
      return {
        allowed: false,
        requiredPlan: "premium",
        reason: "Access Denied: You've reached your 20 exam attempts for this month. Upgrade to Premium for unlimited exam access.",
        maxAllowed: 20,
      };
    }

    // Basic
    if (currentMonthlyAttempts < 1) {
      return { allowed: true, requiredPlan: "basic", maxAllowed: 1 };
    }

    return {
      allowed: false,
      requiredPlan: "standard",
      reason: "Access Denied: You've used your exam attempt for this month. Upgrade to Standard (up to 20 attempts) or Premium (unlimited).",
      maxAllowed: 1,
    };
  }

  /**
   * Parent Features:
   * Weekly Reports, Action Radar, Cognitive Diagnostics require connected child on Premium
   */
  public evaluateParentFeatureAccess(
    childPlan: PlanTier,
    feature: "weekly_reports" | "action_radar" | "cognitive_diagnostics"
  ): { allowed: boolean; requiredPlan: PlanTier; reason?: string } {
    if (childPlan === "premium") {
      return { allowed: true, requiredPlan: "premium" };
    }

    return {
      allowed: false,
      requiredPlan: "premium",
      reason: `Access Denied: ${feature.replace(/_/g, " ")} is available with your child's Premium plan.`,
    };
  }
}

export const subscriptionEngine = new SubscriptionEngine();
