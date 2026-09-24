import { Grid, GridItem, Box, Flex, Text, Heading, Icon, Badge } from "@chakra-ui/react";
import { FiMinus } from "react-icons/fi";
import {
  PiGraduationCapFill,
  PiFlameFill,
  PiChartLineUpFill,
  PiTrendDownBold,
} from "react-icons/pi";
import { MdAssignmentTurnedIn, MdPlayLesson } from "react-icons/md";
import { useTranslation } from "react-i18next";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const OverviewMetricsGrid = ({ intelligence }: Props) => {
  const { t } = useTranslation();
  const {
    overallAccuracy,
    overallGrade,
    overallTrend,
    overallTrendDiff,
    totalQuestionsAnswered,
    totalPracticeSessions,
    totalVideosWatched,
    studyStreakDays,
    learningStatus,
  } = intelligence;

  const trendIcon = overallTrend === "up" ? PiChartLineUpFill : overallTrend === "down" ? PiTrendDownBold : FiMinus;
  const trendColor = overallTrend === "up" ? "green.600" : overallTrend === "down" ? "red.600" : "gray.600";
  const trendText =
    overallTrend === "up"
      ? `+${overallTrendDiff}% ${t("improving")}`
      : overallTrend === "down"
      ? `${overallTrendDiff}% ${t("needs review")}`
      : t("Steady performance");

  return (
    <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4} mb={6}>
      {/* 1. Overall Performance Card */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 4, md: 5 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{ borderColor: "blue.200", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(32, 108, 225, 0.08)" }}
          transition="all 0.2s"
        >
          <Flex justify="space-between" align="start">
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Average Score")}
            </Text>
            <Box bg="blue.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(32, 108, 225, 0.12)">
              <Icon as={PiGraduationCapFill} color="#206CE1" boxSize="18px" />
            </Box>
          </Flex>

          <Box my={2}>
            <Flex align="baseline" gap={2}>
              <Heading size={{ base: "xl", md: "2xl" }} color="gray.900" fontWeight="800">
                {overallAccuracy}%
              </Heading>
              <Badge
                colorPalette={overallAccuracy >= 75 ? "green" : overallAccuracy >= 55 ? "blue" : "orange"}
                variant="solid"
                size="sm"
                px={2}
                borderRadius="md"
              >
                {t("Grade")} {overallGrade}
              </Badge>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Across all quiz attempts")}
            </Text>
          </Box>

          <Flex align="center" gap={1.5} color={trendColor} fontSize="xs" fontWeight="700">
            <Icon as={trendIcon} />
            <Text>{trendText}</Text>
          </Flex>
        </Box>
      </GridItem>

      {/* 2. Questions Solved */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 4, md: 5 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{ borderColor: "teal.200", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(20, 184, 166, 0.08)" }}
          transition="all 0.2s"
        >
          <Flex justify="space-between" align="start">
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Questions Solved")}
            </Text>
            <Box bg="teal.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(20, 184, 166, 0.12)">
              <Icon as={MdAssignmentTurnedIn} color="teal.600" boxSize="18px" />
            </Box>
          </Flex>

          <Box my={2}>
            <Heading size={{ base: "xl", md: "2xl" }} color="gray.900" fontWeight="800">
              {totalQuestionsAnswered}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Across")} {totalPracticeSessions} {t("practice test")}{totalPracticeSessions === 1 ? "" : "s"}
            </Text>
          </Box>

          <Text fontSize="xs" color="teal.700" fontWeight="600">
            {totalPracticeSessions > 0 ? t("Active practice") : t("Ready to start")}
          </Text>
        </Box>
      </GridItem>

      {/* 3. Video Lessons */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 4, md: 5 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{ borderColor: "purple.200", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(168, 85, 247, 0.08)" }}
          transition="all 0.2s"
        >
          <Flex justify="space-between" align="start">
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Video Lessons")}
            </Text>
            <Box bg="purple.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(168, 85, 247, 0.12)">
              <Icon as={MdPlayLesson} color="purple.600" boxSize="18px" />
            </Box>
          </Flex>

          <Box my={2}>
            <Heading size={{ base: "xl", md: "2xl" }} color="gray.900" fontWeight="800">
              {totalVideosWatched}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Completed topics")}
            </Text>
          </Box>

          <Text fontSize="xs" color="purple.700" fontWeight="600">
            {t("Concept learning")}
          </Text>
        </Box>
      </GridItem>

      {/* 4. Study Streak & Learning Status */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 4, md: 5 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{ borderColor: "orange.200", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.08)" }}
          transition="all 0.2s"
        >
          <Flex justify="space-between" align="start">
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Study Streak")}
            </Text>
            <Box bg="orange.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(249, 115, 22, 0.15)">
              <Icon as={PiFlameFill} color="orange.500" boxSize="18px" />
            </Box>
          </Flex>

          <Box my={2}>
            <Flex align="baseline" gap={1.5}>
              <Heading size={{ base: "xl", md: "2xl" }} color="gray.900" fontWeight="800">
                {studyStreakDays}
              </Heading>
              <Text fontSize="sm" fontWeight="700" color="orange.600">
                {t("Days")}
              </Text>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Status")}: {learningStatus}
            </Text>
          </Box>

          <Text fontSize="xs" color="orange.700" fontWeight="600">
            {studyStreakDays > 0 ? t("Daily study habit") : t("Ready for next lesson")}
          </Text>
        </Box>
      </GridItem>
    </Grid>
  );
};
