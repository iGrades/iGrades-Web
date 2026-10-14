import { useState } from "react";
import { Box, Flex, Heading, Text, VStack, Button, Icon } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { PiUserPlusFill } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { useParentIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { StudentQuickProfileHeader } from "./StudentQuickProfileHeader";
import { OverviewMetricsGrid } from "./OverviewMetricsGrid";
import { RecentActivitySection } from "./RecentActivitySection";
import { ProgressTrendsSection } from "./ProgressTrendsSection";
import { SubjectPerformanceSection } from "./SubjectPerformanceSection";
import AddGraderPopup from "@/parent-app/components/grader/addGraderPopover";
import { useParentSubscriptionEntitlement } from "@/parent-app/hooks/useParentSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";

export const ParentIntelligenceDashboard = () => {
  const { t } = useTranslation();
  const {
    studentsData,
    loading: studentsLoading,
    selectedStudent,
    setSelectedStudentId,
    getGraderDetails,
  } = useStudentsData();
  const [showAddChildPopup, setShowAddChildPopup] = useState(false);

  const { intelligence, loading: intelligenceLoading } = useParentIntelligence(selectedStudent);

  const isLoading = studentsLoading || intelligenceLoading;

  const {
    effectivePlan: childEntitlementPlan,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
    verifyAddChild,
  } = useParentSubscriptionEntitlement(selectedStudent);

  const effectivePlan = childEntitlementPlan || "basic";

  const handleAddChildClick = () => {
    const check = verifyAddChild();
    if (!check.allowed) {
      promptUpgrade("Additional Child Connection", check.requiredPlan, check.reason);
      return;
    }
    setShowAddChildPopup(true);
  };

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 2, sm: 3, md: 6 }} py={{ base: 3, md: 6 }} pb={{ base: "32px", md: "40px" }}>
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
        <Flex
          justify="center"
          align="center"
          minH={{ base: "calc(100vh - 220px)", md: "calc(100vh - 260px)" }}
          w="full"
          flex={1}
          my="auto"
        >
          <DancingLogoLoader size="sm" minH="auto" />
        </Flex>
      ) : (
        selectedStudent && intelligence && (
          <>
            {/* Student Quick Profile Card & Scaled Photos Horizontal List */}
            <StudentQuickProfileHeader
              selectedStudent={selectedStudent}
              studentsData={studentsData}
              setSelectedStudentId={setSelectedStudentId}
              intelligence={intelligence}
            />

            {/* 1. Key Metrics Overview Grid at top: Average Score, Questions Solved, etc. */}
            <OverviewMetricsGrid intelligence={intelligence} />

            {/* 2. Recent Learning Activity Feed */}
            <RecentActivitySection intelligence={intelligence} />

            {/* 3. Score Progress Over Time (Graph comes first immediately after recent activities) */}
            <ProgressTrendsSection intelligence={intelligence} />

            {/* 4. Subject Performance (Lastly) */}
            <SubjectPerformanceSection
              subjects={intelligence.subjects}
              registeredCourses={selectedStudent?.registered_courses}
            />
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
