import { Grid, GridItem, Box, Flex, Text, Heading, Icon, Badge, HStack, Progress } from "@chakra-ui/react";
import {
  PiGraduationCapFill,
  PiClockFill,
  PiFlameFill,
  PiChartLineUpFill,
  PiTrendDownBold,
  PiCheckSquareOffsetFill,
  PiVideoFill,
  PiMinusBold,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import type { WeeklyReportData } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  report: WeeklyReportData;
};

export const WeeklyOverviewMetrics = ({ report }: Props) => {
  const { t } = useTranslation();
  const {
    overallAccuracy,
    previousOverallAccuracy,
    accuracyDelta,
    hasPriorWeekData,
    totalQuestionsAttempted,
    totalQuestionsCorrect,
    totalSessions,
    studyStreakDays,
    estimatedStudyTimeMinutes,
    hasStudied,
  } = report;

  const getDeltaBadge = () => {
    if (!hasStudied) {
      return (
        <Badge colorPalette="gray" variant="subtle" size="sm" borderRadius="full">
          {t("No Activity")}
        </Badge>
      );
    }
    if (!hasPriorWeekData || accuracyDelta === null) {
      return (
        <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
          {t("Baseline Week")}
        </Badge>
      );
    }
    if (accuracyDelta > 0) {
      return (
        <Badge colorPalette="green" variant="solid" size="sm" borderRadius="full">
          <Flex align="center" gap={1}>
            <Icon as={PiChartLineUpFill} boxSize="11px" />
            +{accuracyDelta}% {t("vs Last Week")}
          </Flex>
        </Badge>
      );
    }
    if (accuracyDelta < 0) {
      return (
        <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full">
          <Flex align="center" gap={1}>
            <Icon as={PiTrendDownBold} boxSize="11px" />
            {accuracyDelta}% {t("vs Last Week")}
          </Flex>
        </Badge>
      );
    }
    return (
      <Badge colorPalette="gray" variant="subtle" size="sm" borderRadius="full">
        <Flex align="center" gap={1}>
          <Icon as={PiMinusBold} boxSize="11px" />
          {t("Stable vs Last Week")}
        </Flex>
      </Badge>
    );
  };

  const correctRate = totalQuestionsAttempted > 0
    ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100)
    : 0;

  return (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={3.5} wrap="wrap" gap={2}>
        <HStack gap={2.5}>
          <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200" boxShadow="0 2px 6px rgba(32, 108, 225, 0.12)">
            <Icon as={PiChartLineUpFill} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Heading size="sm" color="gray.900" fontWeight="800">
              {t("Learning Activity & Progress")}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Quantitative metrics comparing weekly practice volume and accuracy.")}
            </Text>
          </Box>
        </HStack>
        {getDeltaBadge()}
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
        {/* 1. Overall Accuracy */}
        <GridItem>
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="none"
            boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.07), 0 2px 6px -1px rgba(15, 23, 42, 0.04)"
            _hover={{
              transform: "translateY(-3px)",
              boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.11), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
            }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                {t("Average Accuracy")}
              </Text>
              <Box bg="blue.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.04)">
                <Icon as={PiGraduationCapFill} color="#206CE1" boxSize="18px" />
              </Box>
            </Flex>

            <Box my={2}>
              <Flex align="baseline" gap={2}>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800">
                  {hasStudied ? `${overallAccuracy}%` : "—"}
                </Heading>
                {hasStudied && (
                  <Text fontSize="xs" color="gray.500">
                    {overallAccuracy >= 75 ? t("Mastery") : overallAccuracy >= 55 ? t("Good") : t("Needs Review")}
                  </Text>
                )}
              </Flex>
              {hasPriorWeekData && previousOverallAccuracy !== null ? (
                <Text fontSize="11px" color="gray.500" mt={1}>
                  {t("Prior week")}: <strong>{previousOverallAccuracy}%</strong>
                </Text>
              ) : (
                <Text fontSize="11px" color="gray.400" mt={1}>
                  {t("No prior comparison data")}
                </Text>
              )}
            </Box>

            {hasStudied && (
              <Progress.Root value={overallAccuracy} size="xs" colorPalette={overallAccuracy >= 70 ? "green" : overallAccuracy >= 50 ? "blue" : "orange"}>
                <Progress.Track bg="gray.100" borderRadius="full">
                  <Progress.Range borderRadius="full" />
                </Progress.Track>
              </Progress.Root>
            )}
          </Box>
        </GridItem>

        {/* 2. Questions Attempted & Accuracy */}
        <GridItem>
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="none"
            boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.07), 0 2px 6px -1px rgba(15, 23, 42, 0.04)"
            _hover={{
              transform: "translateY(-3px)",
              boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.11), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
            }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                {t("Questions Solved")}
              </Text>
              <Box bg="green.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.04)">
                <Icon as={PiCheckSquareOffsetFill} color="#10B981" boxSize="18px" />
              </Box>
            </Flex>

            <Box my={2}>
              <Flex align="baseline" gap={2}>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800">
                  {totalQuestionsAttempted}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  {t("attempted")}
                </Text>
              </Flex>
              <Text fontSize="11px" color="green.700" fontWeight="600" mt={1}>
                {totalQuestionsCorrect} {t("answered correctly")} ({correctRate}%)
              </Text>
            </Box>

            <Text fontSize="10px" color="gray.400">
              {t("Across all weekly practice quizzes")}
            </Text>
          </Box>
        </GridItem>

        {/* 3. Study Sessions & Streak */}
        <GridItem>
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="none"
            boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.07), 0 2px 6px -1px rgba(15, 23, 42, 0.04)"
            _hover={{
              transform: "translateY(-3px)",
              boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.11), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
            }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                {t("Video Lessons & Sessions")}
              </Text>
              <Box bg="purple.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.04)">
                <Icon as={PiVideoFill} color="#6366F1" boxSize="18px" />
              </Box>
            </Flex>

            <Box my={2}>
              <Flex align="baseline" gap={2}>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800">
                  {totalSessions}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  {t("completed")}
                </Text>
              </Flex>
              <HStack gap={1} mt={1}>
                <Icon as={PiFlameFill} color="orange.500" boxSize="14px" />
                <Text fontSize="11px" color="orange.700" fontWeight="700">
                  {studyStreakDays} {t("active day")}{studyStreakDays === 1 ? "" : "s"} {t("this week")}
                </Text>
              </HStack>
            </Box>

            <Text fontSize="10px" color="gray.400">
              {studyStreakDays >= 3 ? t("Consistent practice cadence") : t("Room to add 1-2 more practice days")}
            </Text>
          </Box>
        </GridItem>

        {/* 4. Estimated Study Time */}
        <GridItem>
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="none"
            boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.07), 0 2px 6px -1px rgba(15, 23, 42, 0.04)"
            _hover={{
              transform: "translateY(-3px)",
              boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.11), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
            }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                {t("Estimated Study Time")}
              </Text>
              <Box bg="teal.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.04)">
                <Icon as={PiClockFill} color="#0D9488" boxSize="18px" />
              </Box>
            </Flex>

            <Box my={2}>
              <Flex align="baseline" gap={2}>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800">
                  {estimatedStudyTimeMinutes > 60
                    ? `${Math.floor(estimatedStudyTimeMinutes / 60)}h ${estimatedStudyTimeMinutes % 60}m`
                    : `${estimatedStudyTimeMinutes}m`}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  {t("active")}
                </Text>
              </Flex>
              <Text fontSize="11px" color="teal.700" fontWeight="600" mt={1}>
                {t("Based on quizzes & lessons")}
              </Text>
            </Box>

            <Text fontSize="10px" color="gray.400">
              {t("Target: ~15 mins per study day")}
            </Text>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};
