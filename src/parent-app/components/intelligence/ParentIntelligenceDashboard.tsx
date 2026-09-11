import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, VStack, HStack, Button, Icon } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { FiUserPlus, FiRefreshCw, FiFileText, FiBarChart2 } from "react-icons/fi";
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
import { WeeklyReportBannerCard } from "./weeklyReport/WeeklyReportBannerCard";
import AddGraderPopup from "@/parent-app/components/grader/addGraderPopover";

export const ParentIntelligenceDashboard = () => {
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

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }} pb={{ base: "100px", md: "40px" }}>
      {/* Top Welcome & Sync Header */}
      <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
        <Box>
          <Heading size={{ base: "md", md: "lg" }} color="gray.900" fontWeight="800">
            Parent Dashboard
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
              onClick={() => setActiveTab("overview")}
            >
              <Icon as={FiBarChart2} mr={1} />
              Overview
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
              onClick={() => setActiveTab("weekly_report")}
            >
              <Icon as={FiFileText} mr={1} />
              Weekly Report
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
            <Icon as={FiRefreshCw} mr={1} />
            Refresh
          </Button>

          <Button
            size="xs"
            bg="#206CE1"
            color="white"
            borderRadius="full"
            onClick={() => setShowAddChildPopup(true)}
            fontSize="xs"
            fontWeight="600"
            _hover={{ bg: "blue.700" }}
          >
            <Icon as={FiUserPlus} mr={1} />
            Add Child
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
              <Icon as={FiUserPlus} color="blue.600" boxSize="32px" />
            </Box>
            <Heading size="md" color="gray.900">
              Welcome to your Parent Dashboard!
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
              onClick={() => setShowAddChildPopup(true)}
              _hover={{ bg: "blue.700" }}
            >
              <Icon as={FiUserPlus} mr={2} /> Add Your Child
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
              onAddChildClick={() => setShowAddChildPopup(true)}
            />

            {/* Render Selected View Tab */}
            {activeTab === "weekly_report" ? (
              <WeeklyLearningReportView
                student={selectedStudent}
                onClose={() => setActiveTab("overview")}
              />
            ) : (
              intelligence && (
                <>
                  {/* Weekly Report Fast Access Banner */}
                  <WeeklyReportBannerCard
                    student={selectedStudent}
                    onOpenFullReport={() => setActiveTab("weekly_report")}
                  />

                  {/* 2. Key Metrics Overview Grid */}
                  <OverviewMetricsGrid intelligence={intelligence} />

                  {/* 3. Exam Readiness Section */}
                  <ExamReadinessSection
                    studentId={selectedStudent.id}
                    studentClass={selectedStudent.class}
                    studentName={`${selectedStudent.firstname || ""} ${selectedStudent.lastname || ""}`.trim()}
                  />

                  {/* 4. Action Radar: "What Needs Attention?" & "What Can I Do?" */}
                  <AttentionAndActionsSection intelligence={intelligence} />

                  {/* 5. Subject Performance */}
                  <SubjectPerformanceSection
                    subjects={intelligence.subjects}
                    registeredCourses={selectedStudent?.registered_courses}
                  />

                  {/* 6. Strengths & Areas Requiring Attention Deep-Dive */}
                  <StrengthsAndWeaknessesSection intelligence={intelligence} />

                  {/* 7. Longitudinal Progress Trends */}
                  <ProgressTrendsSection intelligence={intelligence} />

                  {/* 8. Recent Learning Activity Feed */}
                  <RecentActivitySection intelligence={intelligence} />
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
    </Box>
  );
};

export default ParentIntelligenceDashboard;
