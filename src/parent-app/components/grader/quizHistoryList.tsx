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

  const hasStandardAccess = effectivePlan === "standard" || effectivePlan === "premium";
  const hasPremiumAccess = effectivePlan === "premium";

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
        {/* Basic: Overview key metrics and recent quiz history */}
        <OverviewMetricsGrid intelligence={intelligence} />
        <RecentActivitySection intelligence={intelligence} />

        {/* Standard: Subject performance and longitudinal trends */}
        {hasStandardAccess ? (
          <SubjectPerformanceSection
            subjects={intelligence.subjects}
            registeredCourses={studentObj?.registered_courses}
          />
        ) : (
          <ParentPaywallCard
            title="Subject Performance Breakdown"
            description="Detailed subject accuracy, course trends, and curriculum mastery are available on Standard and Premium plans."
            requiredPlan="standard"
            onUpgradeClick={() =>
              promptUpgrade(
                "Subject Performance",
                "standard",
                "Upgrade to Standard to monitor subject-by-subject grades and score distributions."
              )
            }
          />
        )}

        {hasStandardAccess ? (
          <ProgressTrendsSection intelligence={intelligence} />
        ) : (
          <ParentPaywallCard
            title="Longitudinal Progress Trends"
            description="Track your child's quiz score progression across weeks with interactive score delta charts on Standard or Premium."
            requiredPlan="standard"
            onUpgradeClick={() =>
              promptUpgrade(
                "Progress Trends",
                "standard",
                "Upgrade to Standard to view score progression over time."
              )
            }
          />
        )}

        {hasStandardAccess ? (
          <StrengthsAndWeaknessesSection intelligence={intelligence} />
        ) : (
          <ParentPaywallCard
            title="Topic Strengths & Focus Areas"
            description="View high-performing topics and areas where practice is needed to improve grades."
            requiredPlan="standard"
            onUpgradeClick={() =>
              promptUpgrade(
                "Topic Strengths & Focus Areas",
                "standard",
                "Upgrade to Standard to identify exact subject topic strengths."
              )
            }
          />
        )}

        {/* Premium: Advanced learning intelligence & Action Radar */}
        {hasPremiumAccess ? (
          <AttentionAndActionsSection intelligence={intelligence} />
        ) : (
          <ParentPaywallCard
            title="Cognitive Action Radar & Support Insights"
            description="Advanced parental guidance, priority topic alerts, and home coaching recommendations require Premium."
            requiredPlan="premium"
            onUpgradeClick={() =>
              promptUpgrade(
                "Action Radar & Support Insights",
                "premium",
                "Upgrade to Premium for deep cognitive diagnostic alerts."
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
