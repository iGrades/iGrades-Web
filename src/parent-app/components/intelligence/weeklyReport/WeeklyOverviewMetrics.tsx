import { Grid, GridItem, Box, Flex, Text, Heading, Icon, Badge, HStack, Progress } from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiLayers,
} from "react-icons/fi";
import type { WeeklyReportData } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  report: WeeklyReportData;
};

export const WeeklyOverviewMetrics = ({ report }: Props) => {
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
          No Activity
        </Badge>
      );
    }
    if (!hasPriorWeekData || accuracyDelta === null) {
      return (
        <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
          Baseline Week
        </Badge>
      );
    }
    if (accuracyDelta > 0) {
      return (
        <Badge colorPalette="green" variant="solid" size="sm" borderRadius="full">
          <Flex align="center" gap={1}>
            <Icon as={FiTrendingUp} boxSize="11px" />
            +{accuracyDelta}% vs Last Week
          </Flex>
        </Badge>
      );
    }
    if (accuracyDelta < 0) {
      return (
        <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full">
          <Flex align="center" gap={1}>
            <Icon as={FiTrendingDown} boxSize="11px" />
            {accuracyDelta}% vs Last Week
          </Flex>
        </Badge>
      );
    }
    return (
      <Badge colorPalette="gray" variant="subtle" size="sm" borderRadius="full">
        <Flex align="center" gap={1}>
          <Icon as={FiMinus} boxSize="11px" />
          Stable vs Last Week
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
        <Box>
          <Heading size="sm" color="gray.900" fontWeight="800">
            Learning Activity & Progress
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            Quantitative metrics comparing weekly practice volume and accuracy.
          </Text>
        </Box>
        {getDeltaBadge()}
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={3.5}>
        {/* 1. Overall Accuracy */}
        <GridItem>
          <Box
            bg="white"
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.150"
            boxShadow="0 1px 4px rgba(0,0,0,0.03)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                Average Accuracy
              </Text>
              <Box bg="blue.50" p={1.5} borderRadius="lg">
                <Icon as={FiBookOpen} color="#206CE1" boxSize="16px" />
              </Box>
            </Flex>

            <Box my={2}>
              <Flex align="baseline" gap={2}>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800">
                  {hasStudied ? `${overallAccuracy}%` : "—"}
                </Heading>
                {hasStudied && (
                  <Text fontSize="xs" color="gray.500">
                    {overallAccuracy >= 75 ? "Mastery" : overallAccuracy >= 55 ? "Good" : "Needs Review"}
                  </Text>
                )}
              </Flex>
              {hasPriorWeekData && previousOverallAccuracy !== null ? (
                <Text fontSize="11px" color="gray.500" mt={1}>
                  Prior week: <strong>{previousOverallAccuracy}%</strong>
                </Text>
              ) : (
                <Text fontSize="11px" color="gray.400" mt={1}>
                  No prior comparison data
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
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.150"
            boxShadow="0 1px 4px rgba(0,0,0,0.03)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                Questions Solved
              </Text>
              <Box bg="green.50" p={1.5} borderRadius="lg">
                <Icon as={FiCheckCircle} color="#10B981" boxSize="16px" />
              </Box>
            </Flex>

            <Box my={2}>
              <Flex align="baseline" gap={2}>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800">
                  {totalQuestionsAttempted}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  attempted
                </Text>
              </Flex>
              <Text fontSize="11px" color="green.700" fontWeight="600" mt={1}>
                {totalQuestionsCorrect} answered correctly ({correctRate}%)
              </Text>
            </Box>

            <Text fontSize="10px" color="gray.400">
              Across all weekly practice quizzes
            </Text>
          </Box>
        </GridItem>

        {/* 3. Study Sessions & Streak */}
        <GridItem>
          <Box
            bg="white"
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.150"
            boxShadow="0 1px 4px rgba(0,0,0,0.03)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                Study Sessions
              </Text>
              <Box bg="purple.50" p={1.5} borderRadius="lg">
                <Icon as={FiLayers} color="#6366F1" boxSize="16px" />
              </Box>
            </Flex>

            <Box my={2}>
              <Flex align="baseline" gap={2}>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800">
                  {totalSessions}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  completed
                </Text>
              </Flex>
              <HStack gap={1} mt={1}>
                <Icon as={FiZap} color="orange.500" boxSize="13px" />
                <Text fontSize="11px" color="orange.700" fontWeight="700">
                  {studyStreakDays} active day{studyStreakDays === 1 ? "" : "s"} this week
                </Text>
              </HStack>
            </Box>

            <Text fontSize="10px" color="gray.400">
              {studyStreakDays >= 3 ? "Consistent practice cadence" : "Room to add 1-2 more practice days"}
            </Text>
          </Box>
        </GridItem>

        {/* 4. Estimated Study Time */}
        <GridItem>
          <Box
            bg="white"
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.150"
            boxShadow="0 1px 4px rgba(0,0,0,0.03)"
            h="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justify="space-between" align="start">
              <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                Estimated Study Time
              </Text>
              <Box bg="teal.50" p={1.5} borderRadius="lg">
                <Icon as={FiClock} color="#0D9488" boxSize="16px" />
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
                  active
                </Text>
              </Flex>
              <Text fontSize="11px" color="teal.700" fontWeight="600" mt={1}>
                Based on quizzes & lessons
              </Text>
            </Box>

            <Text fontSize="10px" color="gray.400">
              Target: ~15 mins per study day
            </Text>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};
