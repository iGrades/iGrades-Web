import { Box, VStack, Flex, Text } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useParentIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { OverviewMetricsGrid } from "../intelligence/OverviewMetricsGrid";
import { AttentionAndActionsSection } from "../intelligence/AttentionAndActionsSection";
import { SubjectPerformanceSection } from "../intelligence/SubjectPerformanceSection";
import { StrengthsAndWeaknessesSection } from "../intelligence/StrengthsAndWeaknessesSection";
import { ProgressTrendsSection } from "../intelligence/ProgressTrendsSection";
import { RecentActivitySection } from "../intelligence/RecentActivitySection";

type QuizHistoryListProps = {
  studentId: string;
  student?: any;
};

const QuizHistoryList = ({ studentId, student }: QuizHistoryListProps) => {
  const studentObj = student || { id: studentId };
  const { intelligence, loading } = useParentIntelligence(studentObj);

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
    <VStack align="stretch" gap={5} w="full">
      <OverviewMetricsGrid intelligence={intelligence} />
      <AttentionAndActionsSection intelligence={intelligence} />
      <SubjectPerformanceSection
        subjects={intelligence.subjects}
        registeredCourses={studentObj?.registered_courses}
      />
      <StrengthsAndWeaknessesSection intelligence={intelligence} />
      <ProgressTrendsSection intelligence={intelligence} />
      <RecentActivitySection intelligence={intelligence} />
    </VStack>
  );
};

export default QuizHistoryList;
