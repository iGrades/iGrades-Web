import { useState } from "react";
import { Box, Heading, Text, HStack, Flex } from "@chakra-ui/react";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { useParentIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { useParentSubscriptionEntitlement } from "@/parent-app/hooks/useParentSubscriptionEntitlement";
import { normalizePlan } from "@/services/subscriptionEntitlements";
import { StrengthsAndWeaknessesSection } from "@/parent-app/components/intelligence/StrengthsAndWeaknessesSection";
import { ExamReadinessSection } from "@/parent-app/components/intelligence/ExamReadinessSection";
import { AttentionAndActionsSection } from "@/parent-app/components/intelligence/AttentionAndActionsSection";
import { WeeklyLearningReportView } from "@/parent-app/components/intelligence/weeklyReport/WeeklyLearningReportView";
import { ParentPaywallCard } from "@/parent-app/components/subscription/ParentPaywallCard";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import AddGraderPopup from "@/parent-app/components/grader/addGraderPopover";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { useNavigationStore } from "@/store/usenavigationStore";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";

export const WeeklyReportPage = () => {
  const { t } = useTranslation();
  const setCurrentParentPage = useNavigationStore((state) => state.setCurrentParentPage);
  const { loading: studentsLoading, selectedStudent, getGraderDetails } = useStudentsData();
  const [showAddChildPopup, setShowAddChildPopup] = useState(false);

  const { intelligence, loading: intelligenceLoading } = useParentIntelligence(selectedStudent);

  const isLoading = studentsLoading || intelligenceLoading;

  const {
    effectivePlan,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useParentSubscriptionEntitlement(selectedStudent);

  const selectedStudentPlan = normalizePlan(
    selectedStudent?.subscription,
    selectedStudent?.subscription_status
  ).effectivePlan;
  const isSelectedChildPremium = selectedStudentPlan === "premium";

  return (
    <Box
      maxW="7xl"
      mx="auto"
      px={{ base: 2, sm: 3, md: 6 }}
      py={{ base: 3, md: 6 }}
      pb={{ base: "32px", md: "40px" }}
    >
      {/* Header */}
      <Box mb={5}>
        <HStack gap={2.5}>
          <BsFileEarmarkBarGraphFill size={20} color="#206CE1" />
          <Heading size={{ base: "sm", md: "lg" }} color="gray.900" fontWeight="800">
            {t("Learning Reports & Academic Diagnostics")}
          </Heading>
        </HStack>
      </Box>

      {/* Content */}
      {isLoading && !intelligence ? (
        <Flex justify="center" align="center" minH="calc(70vh - 120px)" w="full" flex={1}>
          <DancingLogoLoader size="md" />
        </Flex>
      ) : !selectedStudent ? (
        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          textAlign="center"
          border="1px solid"
          borderColor="gray.100"
        >
          <Text color="gray.500" fontSize="sm">
            {t("Please connect or select a child in the top bar to view reports.")}
          </Text>
        </Box>
      ) : (
        intelligence && (
          <>
            {/* 1. Student Strengths & Areas to Practice */}
            <StrengthsAndWeaknessesSection intelligence={intelligence} />

            {/* 2. Exam Readiness Indicator */}
            {isSelectedChildPremium ? (
              <ExamReadinessSection
                studentId={selectedStudent.id}
                studentClass={selectedStudent.class}
                studentName={`${selectedStudent.firstname || ""} ${selectedStudent.lastname || ""}`.trim()}
              />
            ) : (
              <ParentPaywallCard
                title="Exam Readiness Indicator"
                description={`Advanced predictive AI calculates real-time exam preparedness for WAEC, JAMB UTME, and NECO with confidence scoring and priority topic roadmaps on Premium. Available when ${selectedStudent?.firstname || "your child"} is on Premium (₦25,000).`}
                requiredPlan="premium"
                childName={selectedStudent?.firstname}
                onUpgradeClick={() =>
                  promptUpgrade(
                    "Exam Readiness Indicator",
                    "premium",
                    `Deep longitudinal predictive analysis benchmarks ${selectedStudent?.firstname || "your student"}'s test history against national exam standards.`,
                    selectedStudent
                  )
                }
              />
            )}

            {/* 3. Parent Action Radar: What Needs Attention & Recommendations */}
            {isSelectedChildPremium ? (
              <AttentionAndActionsSection intelligence={intelligence} />
            ) : (
              <ParentPaywallCard
                title="Parent Action Radar & Cognitive Diagnostics"
                description={`Actionable parental guidance alerts, structured study habit interventions, and targeted learning recommendations require ${selectedStudent?.firstname || "your child"} to be on Premium (₦25,000).`}
                requiredPlan="premium"
                childName={selectedStudent?.firstname}
                onUpgradeClick={() =>
                  promptUpgrade(
                    "Action Radar & Diagnostics",
                    "premium",
                    `Advanced parent intelligence diagnoses specific study roadblocks and provides high-impact home coaching actions for ${selectedStudent?.firstname || "your child"}.`,
                    selectedStudent
                  )
                }
              />
            )}

            {/* 4. Weekly Learning Report View / Paywall */}
            {isSelectedChildPremium ? (
              <WeeklyLearningReportView
                student={selectedStudent}
                onClose={() => setCurrentParentPage("home")}
              />
            ) : (
              <ParentPaywallCard
                title="Weekly Learning Reports"
                description={`Weekly Learning Reports provide detailed weekly academic digests, mastery indicators, and tailored recommendations. Available when ${selectedStudent?.firstname || "your child"} is on Premium (₦25,000).`}
                requiredPlan="premium"
                childName={selectedStudent?.firstname}
                onUpgradeClick={() =>
                  promptUpgrade(
                    "Weekly Learning Reports",
                    "premium",
                    `Weekly learning reports provide executive parent summaries, study habits analysis, and topic mastery tracking for ${selectedStudent?.firstname || "your child"}.`,
                    selectedStudent
                  )
                }
              />
            )}
          </>
        )
      )}

      {/* Add Child Popover Modal */}
      {showAddChildPopup && (
        <AddGraderPopup
          showBox={showAddChildPopup}
          setShowBox={setShowAddChildPopup}
          onClose={() => {
            setShowAddChildPopup(false);
            getGraderDetails();
          }}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
        portalType="parent"
      />
    </Box>
  );
};

export default WeeklyReportPage;
