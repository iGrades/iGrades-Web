import { useState, useMemo, useCallback } from "react";
import { useUser } from "@/parent-app/context/parentDataContext";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import {
  normalizePlan,
  checkParentFeatureAccess,
  checkAddChildAccess,
  PLAN_CONFIGS,
  type PlanTier,
  type EntitlementCheckResult,
  type ParentPremiumFeature,
} from "@/services/subscriptionEntitlements";

export interface UpgradeModalState {
  isOpen: boolean;
  featureName: string;
  requiredPlan: PlanTier;
  reason?: string;
  childName?: string;
  childId?: string;
}

export function useParentSubscriptionEntitlement(selectedChild?: any | null) {
  const { parent, loading: isParentLoading } = useUser();
  const { studentsData } = useStudentsData();

  const currentParent = parent?.[0] || null;

  // Active child resolution: use selectedChild if provided, or default to the first student
  const activeChild = useMemo(() => {
    if (selectedChild) return selectedChild;
    if (studentsData && studentsData.length > 0) return studentsData[0];
    return null;
  }, [selectedChild, studentsData]);

  // Derive active child's effective subscription
  const { effectivePlan: childEffectivePlan, isActive: isChildActive } = useMemo(() => {
    if (!activeChild) {
      return { effectivePlan: "basic" as PlanTier, isActive: true };
    }
    return normalizePlan(activeChild.subscription, activeChild.subscription_status);
  }, [activeChild]);

  // Overall family summary for informational display
  const hasAnyPremiumChild = useMemo(() => {
    return (studentsData || []).some(
      (s) => normalizePlan(s.subscription, s.subscription_status).effectivePlan === "premium"
    );
  }, [studentsData]);

  const currentChildrenCount = useMemo(() => {
    return studentsData?.length || 0;
  }, [studentsData]);

  // Modal prompt state
  const [modalState, setModalState] = useState<UpgradeModalState>({
    isOpen: false,
    featureName: "",
    requiredPlan: "premium",
    reason: undefined,
  });

  const promptUpgrade = useCallback(
    (
      featureName: string,
      requiredPlan: PlanTier = "premium",
      reason?: string,
      childOverride?: any
    ) => {
      const targetChild = childOverride || activeChild;
      const childName = targetChild ? `${targetChild.firstname || "Your child"}` : "Your child";
      setModalState({
        isOpen: true,
        featureName,
        requiredPlan,
        reason:
          reason ||
          `${featureName} is available when ${childName} is on the Premium plan.`,
        childName,
        childId: targetChild?.id,
      });
    },
    [activeChild]
  );

  const closeUpgradeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Evaluates feature access against a specific child (or the active child).
   * Weekly Reports, Action Radar, and Cognitive Diagnostics are PREMIUM-ONLY.
   */
  const checkChildFeature = useCallback(
    (feature: ParentPremiumFeature, targetChild?: any | null): EntitlementCheckResult => {
      const child = targetChild !== undefined ? targetChild : activeChild;
      if (!child) {
        return {
          allowed: false,
          requiredPlan: "premium",
          isLocked: true,
          reason: "Please connect and select a child to access learning intelligence.",
        };
      }
      const { effectivePlan } = normalizePlan(child.subscription, child.subscription_status);
      const childName = child.firstname || "your child";
      return checkParentFeatureAccess(effectivePlan, feature, childName);
    },
    [activeChild]
  );

  // Dedicated feature verifiers evaluated for the active child
  const verifyWeeklyReport = useCallback(
    (targetChild?: any | null): EntitlementCheckResult => {
      return checkChildFeature("weekly_reports", targetChild);
    },
    [checkChildFeature]
  );

  const verifyActionRadar = useCallback(
    (targetChild?: any | null): EntitlementCheckResult => {
      return checkChildFeature("action_radar", targetChild);
    },
    [checkChildFeature]
  );

  const verifyCognitiveDiagnostics = useCallback(
    (targetChild?: any | null): EntitlementCheckResult => {
      return checkChildFeature("cognitive_diagnostics", targetChild);
    },
    [checkChildFeature]
  );

  // Child connection is a core free parent feature: always allowed
  const verifyAddChild = useCallback((): EntitlementCheckResult => {
    return checkAddChildAccess();
  }, []);

  // Backward-compatible aliases
  const verifyReport = useCallback(
    (reportType: string, targetChild?: any | null): EntitlementCheckResult => {
      if (reportType === "basic_summary") {
        return { allowed: true, requiredPlan: "basic", isLocked: false };
      }
      return checkChildFeature("weekly_reports", targetChild);
    },
    [checkChildFeature]
  );

  const verifyIntelligence = useCallback(
    (level: string, targetChild?: any | null): EntitlementCheckResult => {
      if (level === "basic_visibility") {
        return { allowed: true, requiredPlan: "basic", isLocked: false };
      }
      return checkChildFeature("action_radar", targetChild);
    },
    [checkChildFeature]
  );

  const verifyDashboardSection = useCallback(
    (section: string, targetChild?: any | null): EntitlementCheckResult => {
      if (section === "basic_metrics" || section === "recent_activity") {
        return { allowed: true, requiredPlan: "basic", isLocked: false };
      }
      return checkChildFeature("cognitive_diagnostics", targetChild);
    },
    [checkChildFeature]
  );

  return {
    currentParent,
    activeChild,
    childEffectivePlan,
    isChildActive,
    hasAnyPremiumChild,
    currentChildrenCount,
    maxAllowedChildren: 100, // No artificial cap on connected children
    canAddMoreChildren: true,
    effectivePlan: childEffectivePlan,
    planDetails: PLAN_CONFIGS[childEffectivePlan],
    loading: isParentLoading,

    // Specific feature checkers
    checkChildFeature,
    verifyWeeklyReport,
    verifyActionRadar,
    verifyCognitiveDiagnostics,
    verifyAddChild,

    // Legacy compatibility stubs
    verifyReport,
    verifyIntelligence,
    verifyDashboardSection,

    // Upgrade prompt modal
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  };
}
