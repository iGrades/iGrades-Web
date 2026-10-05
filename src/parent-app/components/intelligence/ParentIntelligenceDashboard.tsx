import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, VStack, HStack, Button, Icon } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import {
  PiUserPlusFill,
  PiArrowsClockwiseBold,
  PiFileTextFill,
  PiChartBarFill,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { useParentIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { StudentSelectorHeader } from "./StudentSelectorHeader";
import { OverviewMetricsGrid } from "./OverviewMetricsGrid";
import { AttentionAndActionsSection } from "./AttentionAndActionsSection";
import { SubjectPerformanceSection } from "./SubjectPerformanceSection";
import { StrengthsAndWeaknessesSection } from "./StrengthsAndWeaknessesSection";
import { ProgressTrendsSection } from "./ProgressTrendsSection";
import { RecentActivitySection } from "./RecentActivitySection";
import { ExamReadinessSection } from "./ExamReadinessSection";
import { WeeklyLearningReportView } from "./weeklyReport/WeeklyLearningReportView";
import AddGraderPopup from "@/parent-app/components/grader/addGraderPopover";
import { useParentSubscriptionEntitlement } from "@/parent-app/hooks/useParentSubscriptionEntitlement";
import { normalizePlan } from "@/services/subscriptionEntitlements";
import { ParentPaywallCard } from "@/parent-app/components/subscription/ParentPaywallCard";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";

export const ParentIntelligenceDashboard = () => {
  const { t } = useTranslation();
  const { studentsData, loading: studentsLoading, getGraderDetails } = useStudentsData();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAddChildPopup, setShowAddChildPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "weekly_report">("overview");

  // Automatically select the first child if none is selected
  useEffect(() => {
    if (studentsData && studentsData.length > 0) {
      if (!selectedStudentId || !studentsData.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(studentsData[0].id);
      }
    }
  }, [studentsData, selectedStudentId]);

  const selectedStudent = studentsData?.find((s) => s.id === selectedStudentId) || (studentsData?.[0] ?? null);

  const { intelligence, loading: intelligenceLoading, refreshIntelligence } = useParentIntelligence(selectedStudent);

  const isLoading = studentsLoading || intelligenceLoading;

  const handleRefresh = () => {
    getGraderDetails();
    refreshIntelligence();
  };

  const {
    effectivePlan,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
    verifyAddChild,
  } = useParentSubscriptionEntitlement(selectedStudent);

  const selectedStudentPlan = normalizePlan(
    selectedStudent?.subscription,
    selectedStudent?.subscription_status
  ).effectivePlan;
  const isSelectedChildPremium = selectedStudentPlan === "premium";

  const handleAddChildClick = () => {
    const check = verifyAddChild();
    if (!check.allowed) {
      promptUpgrade("Additional Child Connection", check.requiredPlan, check.reason);
      return;
    }
    setShowAddChildPopup(true);
  };

  const handleTabClick = (tab: "overview" | "weekly_report") => {
    if (tab === "weekly_report" && !isSelectedChildPremium) {
      promptUpgrade(
        "Weekly Learning Reports",
        "premium",
        `Weekly Learning Reports provide comprehensive study digests and require ${selectedStudent?.firstname || "your child"} to be on the Premium plan.`,
        selectedStudent
      );
      return;
    }
    setActiveTab(tab);
  };

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }} pb={{ base: "100px", md: "40px" }}>
      {/* Top Welcome & Sync Header */}
      <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
        <Box>
          <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="800">
            {t("Parent Dashboard")}
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            See how your child is doing in school, their top subjects, and easy ways to help them succeed.
          </Text>
        </Box>

        <HStack gap={2} wrap="wrap">
          {/* Dashboard View Switcher */}
          <HStack bg="gray.100" p={1} borderRadius="full" border="1px solid" borderColor="gray.200">
            <Button
              size="xs"
              variant={activeTab === "overview" ? "solid" : "ghost"}
              bg={activeTab === "overview" ? "#206CE1" : "transparent"}
              color={activeTab === "overview" ? "white" : "gray.700"}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              px={3}
              onClick={() => handleTabClick("overview")}
            >
              <Icon as={PiChartBarFill} mr={1} />
              {t("Overview")}
            </Button>
            <Button
              size="xs"
              variant={activeTab === "weekly_report" ? "solid" : "ghost"}
              bg={activeTab === "weekly_report" ? "#206CE1" : "transparent"}
              color={activeTab === "weekly_report" ? "white" : "gray.700"}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              px={3}
              onClick={() => handleTabClick("weekly_report")}
            >
              <Icon as={PiFileTextFill} mr={1} />
              {t("Weekly Report")}
            </Button>
          </HStack>

          <Button
            size="xs"
            variant="outline"
            colorPalette="gray"
            borderRadius="full"
            onClick={handleRefresh}
            fontSize="xs"
            fontWeight="600"
          >
            <Icon as={PiArrowsClockwiseBold} mr={1} />
            {t("Refresh")}
          </Button>

          <Button
            size="xs"
            bg="#206CE1"
            color="white"
            borderRadius="full"
            onClick={handleAddChildClick}
            fontSize="xs"
            fontWeight="600"
            _hover={{ bg: "blue.700" }}
          >
            <Icon as={PiUserPlusFill} mr={1} />
            {t("Add Child")}
          </Button>
        </HStack>
      </Flex>

      {/* No Students State */}
      {!studentsLoading && (!studentsData || studentsData.length === 0) ? (
        <Box
          bg="white"
          p={{ base: 8, md: 12 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          textAlign="center"
          boxShadow="sm"
        >
          <VStack gap={4} maxW="md" mx="auto">
            <Box bg="blue.50" p={4} borderRadius="full">
              <Icon as={PiUserPlusFill} color="blue.600" boxSize="32px" />
            </Box>
            <Heading size="md" color="gray.900">
              {t("Welcome to your Parent Dashboard!")}
            </Heading>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              Link your child's student account to view their quiz scores, subject performance, progress over time, and helpful tips to guide their studies.
            </Text>
            <Button
              bg="#206CE1"
              color="white"
              borderRadius="xl"
              px={6}
              py={3}
              fontWeight="bold"
              fontSize="sm"
              onClick={handleAddChildClick}
              _hover={{ bg: "blue.700" }}
            >
              <Icon as={PiUserPlusFill} mr={2} /> {t("Add Your Child")}
            </Button>
          </VStack>
        </Box>
      ) : isLoading && !intelligence ? (
        <Flex justify="center" align="center" minH="300px" w="full">
          <DancingLogoLoader size="lg" text="Loading your child's academic dashboard..." />
        </Flex>
      ) : (
        selectedStudent && (
          <>
            {/* 1. Student Selector & Header */}
            <StudentSelectorHeader
              students={studentsData || []}
              selectedStudent={selectedStudent}
              onSelectStudent={(st) => setSelectedStudentId(st.id)}
              intelligence={intelligence}
              onAddChildClick={handleAddChildClick}
            />

            {/* Render Selected View Tab */}
            {activeTab === "weekly_report" ? (
              isSelectedChildPremium ? (
                <WeeklyLearningReportView
                  student={selectedStudent}
                  onClose={() => setActiveTab("overview")}
                />
              ) : (
                <ParentPaywallCard
                  title="Weekly Learning Reports"
                  description={`Weekly Learning Reports provide detailed weekly academic digests, mastery indicators, topic insights, and tailored recommendations. Available when ${selectedStudent?.firstname || "your child"} is on Premium (₦25,000).`}
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
              )
            ) : (
              intelligence && (
                <>
                  {/* 2. Key Metrics Overview Grid (Core: Average scores & overall activity) */}
                  <OverviewMetricsGrid intelligence={intelligence} />

                  {/* 8. Recent Learning Activity Feed (Core: Basic quiz history and activity) */}
                  <RecentActivitySection intelligence={intelligence} />

                  {/* 5. Subject Performance (Core: Subject performance and scores) */}
                  <SubjectPerformanceSection
                    subjects={intelligence.subjects}
                    registeredCourses={selectedStudent?.registered_courses}
                  />

                  {/* 7. Longitudinal Progress Trends (Core: Progress trends over time) */}
                  <ProgressTrendsSection intelligence={intelligence} />

                  {/* 6. Strengths & Areas Requiring Attention Deep-Dive (Core: Topic strengths & focus areas) */}
                  <StrengthsAndWeaknessesSection intelligence={intelligence} />

                  {/* 3. Cognitive Diagnostics: Exam Readiness Section (Premium: Advanced learning intelligence) */}
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

                  {/* 4. Action Radar: What Needs Attention & What Can I Do (Premium: Advanced cognitive diagnostics) */}
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
                </>
              )
            )}
          </>
        )
      )}

      {/* Add Child Popover Modal */}
      {showAddChildPopup && (
        <AddGraderPopup
          showBox={showAddChildPopup}
          setShowBox={setShowAddChildPopup}
          onClose={() => setShowAddChildPopup(false)}
        />
      )}

      {/* Subscription Upgrade Modal */}
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

export default ParentIntelligenceDashboard;
