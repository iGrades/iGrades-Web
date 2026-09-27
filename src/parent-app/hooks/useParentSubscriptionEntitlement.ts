import { useState, useMemo, useCallback } from "react";
import { useUser } from "@/parent-app/context/parentDataContext";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import {
  normalizePlan,
  getMaxChildrenAllowed,
  checkAddChildAccess,
  checkParentDashboardSectionAccess,
  checkParentReportAccess,
  checkParentIntelligenceAccess,
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

export function useParentSubscriptionEntitlement() {
  const { parent, loading: isParentLoading } = useUser();
  const { studentsData } = useStudentsData();

  const currentParent = parent?.[0] || null;

  // Determine effective subscription of parent:
  // If parent table explicitly has subscription, use that;
  // If not, inspect whether any connected child has Standard or Premium (family benefit)
  const { plan, effectivePlan, isActive, isExpired } = useMemo(() => {
    let rawPlan = currentParent?.subscription;
    let rawStatus = currentParent?.subscription_status;

    // Fallback: If parent has no explicit subscription, check children's subscriptions
    if (!rawPlan && studentsData && studentsData.length > 0) {
      const hasPremium = studentsData.some((s) =>
        s.subscription?.toString().toLowerCase().includes("premium")
      );
      const hasStandard = studentsData.some((s) =>
        s.subscription?.toString().toLowerCase().includes("standard")
      );
      if (hasPremium) {
        rawPlan = "premium";
        rawStatus = "active";
      } else if (hasStandard) {
        rawPlan = "standard";
        rawStatus = "active";
      }
    }

    return normalizePlan(rawPlan, rawStatus);
  }, [currentParent?.subscription, currentParent?.subscription_status, studentsData]);

  const isBasic = effectivePlan === "basic";
  const isStandard = effectivePlan === "standard";
  const isPremium = effectivePlan === "premium";
  const isMissing = !currentParent?.subscription;

  const planDetails = useMemo(() => {
    return PLAN_CONFIGS[effectivePlan];
  }, [effectivePlan]);

  const maxAllowedChildren = useMemo(() => {
    return getMaxChildrenAllowed(effectivePlan);
  }, [effectivePlan]);

  const currentChildrenCount = useMemo(() => {
    return studentsData?.length || 0;
  }, [studentsData]);

  // Upgrade prompt modal state
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

  // 1. Multiple Children Check
  const verifyAddChild = useCallback(
    (customChildCount?: number): EntitlementCheckResult => {
      const count = customChildCount !== undefined ? customChildCount : currentChildrenCount;
      return checkAddChildAccess(effectivePlan, count);
    },
    [effectivePlan, currentChildrenCount]
  );

  // 2. Parent Progress Dashboard Sections Check
  const verifyDashboardSection = useCallback(
    (
      section: "basic_metrics" | "recent_activity" | "subject_performance" | "progress_trends" | "advanced_intelligence"
    ): EntitlementCheckResult => {
      return checkParentDashboardSectionAccess(effectivePlan, section);
    },
    [effectivePlan]
  );

  // 3. Parent Reports Check
  const verifyReport = useCallback(
    (
      reportType: "basic_summary" | "weekly_report" | "advanced_detailed_report"
    ): EntitlementCheckResult => {
      return checkParentReportAccess(effectivePlan, reportType);
    },
    [effectivePlan]
  );

  // 4. Parent Learning Intelligence Check
  const verifyIntelligence = useCallback(
    (
      level: "basic_visibility" | "useful_insights" | "advanced_intelligence"
    ): EntitlementCheckResult => {
      return checkParentIntelligenceAccess(effectivePlan, level);
    },
    [effectivePlan]
  );

  return {
    rawPlan: plan,
    effectivePlan,
    isActive,
    isExpired,
    isBasic,
    isStandard,
    isPremium,
    isMissing,
    loading: isParentLoading,
    planDetails,
    maxAllowedChildren,
    currentChildrenCount,
    canAddMoreChildren: currentChildrenCount < maxAllowedChildren,
    verifyAddChild,
    verifyDashboardSection,
    verifyReport,
    verifyIntelligence,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  };
}
