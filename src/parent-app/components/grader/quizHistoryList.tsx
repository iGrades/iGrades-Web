import { Box, VStack, Flex, Text } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useParentIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { OverviewMetricsGrid } from "../intelligence/OverviewMetricsGrid";
import { AttentionAndActionsSection } from "../intelligence/AttentionAndActionsSection";
import { SubjectPerformanceSection } from "../intelligence/SubjectPerformanceSection";
import { StrengthsAndWeaknessesSection } from "../intelligence/StrengthsAndWeaknessesSection";
import { ProgressTrendsSection } from "../intelligence/ProgressTrendsSection";
import { RecentActivitySection } from "../intelligence/RecentActivitySection";

import { useParentSubscriptionEntitlement } from "@/parent-app/hooks/useParentSubscriptionEntitlement";
import { normalizePlan } from "@/services/subscriptionEntitlements";
import { ParentPaywallCard } from "@/parent-app/components/subscription/ParentPaywallCard";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";

type QuizHistoryListProps = {
  studentId: string;
  student?: any;
};

const QuizHistoryList = ({ studentId, student }: QuizHistoryListProps) => {
  const studentObj = student || { id: studentId };
  const { intelligence, loading } = useParentIntelligence(studentObj);
  const {
    effectivePlan,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useParentSubscriptionEntitlement();

  const isStudentPremium = normalizePlan(
    studentObj?.subscription,
    studentObj?.subscription_status
  ).effectivePlan === "premium";

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="280px" w="full">
        <DancingLogoLoader size="md" text="Loading student intelligence report..." minH="240px" />
      </Flex>
    );
  }

  if (!intelligence) {
    return (
      <Box p={8} textAlign="center" bg="gray.50" borderRadius="xl">
        <Text fontSize="sm" color="gray.500">No academic data found for this student.</Text>
      </Box>
    );
  }

  return (
    <>
      <VStack align="stretch" gap={5} w="full">
        {/* Basic & Core: Overview key metrics and recent quiz history */}
        <OverviewMetricsGrid intelligence={intelligence} />
        <RecentActivitySection intelligence={intelligence} />

        {/* Core Progress: Subject performance and longitudinal trends */}
        <SubjectPerformanceSection
          subjects={intelligence.subjects}
          registeredCourses={studentObj?.registered_courses}
        />

        <ProgressTrendsSection intelligence={intelligence} />

        <StrengthsAndWeaknessesSection intelligence={intelligence} />

        {/* Premium: Action Radar */}
        {isStudentPremium ? (
          <AttentionAndActionsSection intelligence={intelligence} />
        ) : (
          <ParentPaywallCard
            title="Cognitive Action Radar & Support Insights"
            description={`Actionable parental guidance alerts, structured study habit interventions, and targeted learning recommendations require ${studentObj?.firstname || "your child"} to be on Premium (₦25,000).`}
            requiredPlan="premium"
            childName={studentObj?.firstname}
            onUpgradeClick={() =>
              promptUpgrade(
                "Action Radar & Support Insights",
                "premium",
                `Upgrade ${studentObj?.firstname || "your child"} to Premium for deep cognitive diagnostic alerts.`,
                studentObj
              )
            }
          />
        )}
      </VStack>

      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
        portalType="parent"
      />
    </>
  );
};

export default QuizHistoryList;
