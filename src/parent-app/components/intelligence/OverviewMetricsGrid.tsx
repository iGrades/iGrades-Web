import { Grid, GridItem, Box, Flex, Text, Heading, Icon, Badge } from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiCheckCircle, FiPlayCircle, FiZap, FiBookOpen } from "react-icons/fi";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const OverviewMetricsGrid = ({ intelligence }: Props) => {
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

  const trendIcon = overallTrend === "up" ? FiTrendingUp : overallTrend === "down" ? FiTrendingDown : FiMinus;
  const trendColor = overallTrend === "up" ? "green.600" : overallTrend === "down" ? "red.600" : "gray.600";
  const trendText =
    overallTrend === "up"
      ? `+${overallTrendDiff}% improving`
      : overallTrend === "down"
      ? `${overallTrendDiff}% needs review`
      : "Steady performance";

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
              Average Score
            </Text>
            <Box bg="blue.50" p={2} borderRadius="xl">
              <Icon as={FiBookOpen} color="#206CE1" boxSize="18px" />
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
                Grade {overallGrade}
              </Badge>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              Across all quiz attempts
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
              Questions Solved
            </Text>
            <Box bg="teal.50" p={2} borderRadius="xl">
              <Icon as={FiCheckCircle} color="teal.600" boxSize="18px" />
            </Box>
          </Flex>

          <Box my={2}>
            <Heading size={{ base: "xl", md: "2xl" }} color="gray.900" fontWeight="800">
              {totalQuestionsAnswered}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              Across {totalPracticeSessions} practice test{totalPracticeSessions === 1 ? "" : "s"}
            </Text>
          </Box>

          <Text fontSize="xs" color="teal.700" fontWeight="600">
            {totalPracticeSessions > 0 ? "Active practice" : "Ready to start"}
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
              Video Lessons
            </Text>
            <Box bg="purple.50" p={2} borderRadius="xl">
              <Icon as={FiPlayCircle} color="purple.600" boxSize="18px" />
            </Box>
          </Flex>

          <Box my={2}>
            <Heading size={{ base: "xl", md: "2xl" }} color="gray.900" fontWeight="800">
              {totalVideosWatched}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              Completed topics
            </Text>
          </Box>

          <Text fontSize="xs" color="purple.700" fontWeight="600">
            Concept learning
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
              Study Streak
            </Text>
            <Box bg="orange.50" p={2} borderRadius="xl">
              <Icon as={FiZap} color="orange.500" boxSize="18px" />
            </Box>
          </Flex>

          <Box my={2}>
            <Flex align="baseline" gap={1.5}>
              <Heading size={{ base: "xl", md: "2xl" }} color="gray.900" fontWeight="800">
                {studyStreakDays}
              </Heading>
              <Text fontSize="sm" fontWeight="700" color="orange.600">
                Days
              </Text>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              Status: {learningStatus}
            </Text>
          </Box>

          <Text fontSize="xs" color="orange.700" fontWeight="600">
            {studyStreakDays > 0 ? "Daily study habit" : "Ready for next lesson"}
          </Text>
        </Box>
      </GridItem>
    </Grid>
  );
};
