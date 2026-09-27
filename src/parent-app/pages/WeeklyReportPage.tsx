import { useState, useEffect } from "react";
import { Box, Heading, Text, HStack } from "@chakra-ui/react";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { useParentIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { useParentSubscriptionEntitlement } from "@/parent-app/hooks/useParentSubscriptionEntitlement";
import { StudentSelectorHeader } from "@/parent-app/components/intelligence/StudentSelectorHeader";
import { WeeklyLearningReportView } from "@/parent-app/components/intelligence/weeklyReport/WeeklyLearningReportView";
import { ParentPaywallCard } from "@/parent-app/components/subscription/ParentPaywallCard";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import AddGraderPopup from "@/parent-app/components/grader/addGraderPopover";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { useTranslation } from "react-i18next";

export const WeeklyReportPage = () => {
  const { t } = useTranslation();
  const { studentsData } = useStudentsData();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAddChildPopup, setShowAddChildPopup] = useState(false);

  // Automatically select the first child if none is selected
  useEffect(() => {
    if (studentsData && studentsData.length > 0) {
      if (!selectedStudentId || !studentsData.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(studentsData[0].id);
      }
    }
  }, [studentsData, selectedStudentId]);

  const selectedStudent =
    studentsData?.find((s) => s.id === selectedStudentId) || (studentsData?.[0] ?? null);

  const { intelligence } = useParentIntelligence(selectedStudent);

  const {
    effectivePlan,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
    verifyAddChild,
  } = useParentSubscriptionEntitlement();

  const hasStandardAccess = effectivePlan === "standard" || effectivePlan === "premium";

  const handleAddChildClick = () => {
    const check = verifyAddChild();
    if (!check.allowed) {
      promptUpgrade("Additional Child Connection", check.requiredPlan, check.reason);
      return;
    }
    setShowAddChildPopup(true);
  };

  return (
    <Box
      maxW="7xl"
      mx="auto"
      px={{ base: 3, md: 6 }}
      py={{ base: 4, md: 6 }}
      pb={{ base: "100px", md: "40px" }}
    >
      {/* Header */}
      <Box mb={5}>
        <HStack gap={2.5} mb={1}>
          <Box
            p={2}
            borderRadius="xl"
            bg="blue.50"
            color="primaryColor"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <BsFileEarmarkBarGraphFill size={22} />
          </Box>
          <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="800">
            {t("Weekly Learning Reports")}
          </Heading>
        </HStack>
        <Text fontSize="xs" color="gray.500">
          Executive weekly study digests, syllabus pacing, subject mastery adjustments, and personalized recommendation steps.
        </Text>
      </Box>

      {/* Student Selector Header */}
      <StudentSelectorHeader
        students={studentsData || []}
        selectedStudent={selectedStudent}
        onSelectStudent={(st) => setSelectedStudentId(st.id)}
        intelligence={intelligence}
        onAddChildClick={handleAddChildClick}
      />

      {/* Report View or Paywall */}
      {hasStandardAccess ? (
        <WeeklyLearningReportView
          student={selectedStudent}
          onClose={() => setCurrentParentPage("home")}
        />
      ) : (
        <ParentPaywallCard
          title="Weekly Learning Reports"
          description="Detailed weekly academic summaries, mastery indicators, topic insights, and tailored recommendations require a Standard (₦15,000) or Premium subscription."
          requiredPlan="standard"
          onUpgradeClick={() =>
            promptUpgrade(
              "Weekly Learning Reports",
              "standard",
              "Weekly learning reports provide executive parent summaries, study habits analysis, and topic mastery tracking."
            )
          }
        />
      )}

      {/* Modals */}
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
