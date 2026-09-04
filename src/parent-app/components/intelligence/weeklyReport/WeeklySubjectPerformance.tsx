import { Box, Flex, Heading, Text, VStack, HStack, Badge, Icon, Grid } from "@chakra-ui/react";
import {
  FiAward,
  FiTrendingUp,
  FiAlertCircle,
  FiBook,
} from "react-icons/fi";
import type { WeeklySubjectMetric } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  subjects: WeeklySubjectMetric[];
  strongestSubject: WeeklySubjectMetric | null;
  mostImprovedSubject: WeeklySubjectMetric | null;
  needsAttentionSubject: WeeklySubjectMetric | null;
};

export const WeeklySubjectPerformance = ({
  subjects,
  strongestSubject,
  mostImprovedSubject,
  needsAttentionSubject,
}: Props) => {
  const getSubjectStatusBadge = (status: WeeklySubjectMetric["status"]) => {
    switch (status) {
      case "strong":
        return <Badge colorPalette="green" variant="solid" size="xs" borderRadius="full">Strong</Badge>;
      case "good":
        return <Badge colorPalette="blue" variant="subtle" size="xs" borderRadius="full">On Track</Badge>;
      case "fair":
        return <Badge colorPalette="yellow" variant="subtle" size="xs" borderRadius="full">Fair</Badge>;
      case "needs_attention":
        return <Badge colorPalette="orange" variant="subtle" size="xs" borderRadius="full">Needs Practice</Badge>;
      default:
        return <Badge colorPalette="gray" variant="surface" size="xs" borderRadius="full">Not Started</Badge>;
    }
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 75) return "#10B981";
    if (accuracy >= 60) return "#206CE1";
    if (accuracy >= 45) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={3.5} wrap="wrap" gap={2}>
        <Box>
          <Heading size="sm" color="gray.900" fontWeight="800">
            Subject Performance Breakdown
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            Weekly mastery, score adjustments, and key subject highlights.
          </Text>
        </Box>
        <Badge colorPalette="gray" variant="surface" size="sm" borderRadius="full">
          {subjects.length} Active Subject{subjects.length === 1 ? "" : "s"}
        </Badge>
      </Flex>

      {/* 3 Highlight Pills: Strongest, Most Improved, Needs Attention */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={3} mb={4}>
        {/* Strongest Subject */}
        <Box
          bg="green.50"
          p={3.5}
          borderRadius="xl"
          border="1px solid"
          borderColor="green.200"
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Box bg="white" p={2} borderRadius="lg" shadow="xs">
            <Icon as={FiAward} color="green.600" boxSize="18px" />
          </Box>
          <Box>
            <Text fontSize="11px" fontWeight="800" color="green.800" textTransform="uppercase" letterSpacing="0.04em">
              Strongest Subject
            </Text>
            <Text fontSize="sm" fontWeight="800" color="green.900">
              {strongestSubject ? strongestSubject.subjectName : "Pending Activity"}
            </Text>
            {strongestSubject && (
              <Text fontSize="11px" color="green.700">
                {strongestSubject.accuracy}% accuracy ({strongestSubject.questionsAttempted} questions)
              </Text>
            )}
          </Box>
        </Box>

        {/* Most Improved Subject */}
        <Box
          bg="blue.50"
          p={3.5}
          borderRadius="xl"
          border="1px solid"
          borderColor="blue.200"
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Box bg="white" p={2} borderRadius="lg" shadow="xs">
            <Icon as={FiTrendingUp} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Text fontSize="11px" fontWeight="800" color="#1E56B3" textTransform="uppercase" letterSpacing="0.04em">
              Most Improved
            </Text>
            <Text fontSize="sm" fontWeight="800" color="blue.900">
              {mostImprovedSubject ? mostImprovedSubject.subjectName : "Consistent Progress"}
            </Text>
            {mostImprovedSubject ? (
              <Text fontSize="11px" color="#1E56B3">
                +{mostImprovedSubject.trendDiff}% gain vs prior week
              </Text>
            ) : (
              <Text fontSize="11px" color="gray.500">
                Steady baseline maintained
              </Text>
            )}
          </Box>
        </Box>

        {/* Needs Attention Subject */}
        <Box
          bg={needsAttentionSubject ? "orange.50" : "gray.50"}
          p={3.5}
          borderRadius="xl"
          border="1px solid"
          borderColor={needsAttentionSubject ? "orange.200" : "gray.200"}
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Box bg="white" p={2} borderRadius="lg" shadow="xs">
            <Icon as={FiAlertCircle} color={needsAttentionSubject ? "orange.600" : "gray.500"} boxSize="18px" />
          </Box>
          <Box>
            <Text fontSize="11px" fontWeight="800" color={needsAttentionSubject ? "orange.800" : "gray.600"} textTransform="uppercase" letterSpacing="0.04em">
              Needs Attention
            </Text>
            <Text fontSize="sm" fontWeight="800" color={needsAttentionSubject ? "orange.900" : "gray.700"}>
              {needsAttentionSubject ? needsAttentionSubject.subjectName : "None Flagged"}
            </Text>
            {needsAttentionSubject ? (
              <Text fontSize="11px" color="orange.700">
                {needsAttentionSubject.accuracy}% accuracy • Practice recommended
              </Text>
            ) : (
              <Text fontSize="11px" color="gray.500">
                All active subjects performing well
              </Text>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Subject List Cards */}
      {subjects.length === 0 ? (
        <Box p={6} textAlign="center" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
          <Text fontSize="xs" color="gray.500">
            No subject practice recorded for this weekly period.
          </Text>
        </Box>
      ) : (
        <VStack gap={2.5} align="stretch">
          {subjects.map((sub) => {
            const hasPrior = sub.previousAccuracy !== null;
            return (
              <Box
                key={sub.subjectId}
                bg="white"
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.150"
                boxShadow="0 1px 3px rgba(0,0,0,0.02)"
                _hover={{ borderColor: "blue.200" }}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
                  <HStack gap={2.5}>
                    <Box bg="blue.50" p={1.5} borderRadius="md">
                      <Icon as={FiBook} color="#206CE1" boxSize="14px" />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="800" color="gray.900">
                        {sub.subjectName}
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        {sub.questionsAttempted} questions attempted • {sub.sessionsCount} session{sub.sessionsCount === 1 ? "" : "s"}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack gap={3}>
                    {hasPrior && sub.trendDiff !== 0 && (
                      <Badge
                        colorPalette={sub.trendDiff > 0 ? "green" : "orange"}
                        variant="subtle"
                        size="xs"
                        borderRadius="full"
                      >
                        {sub.trendDiff > 0 ? `+${sub.trendDiff}%` : `${sub.trendDiff}%`}
                      </Badge>
                    )}
                    {getSubjectStatusBadge(sub.status)}
                    <Flex align="baseline" gap={1}>
                      <Text fontSize="md" fontWeight="800" color="gray.900">
                        {sub.accuracy}%
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        (Grade {sub.grade})
                      </Text>
                    </Flex>
                  </HStack>
                </Flex>

                {/* Progress bar */}
                <Box mt={2}>
                  <Box w="full" bg="gray.100" h="6px" borderRadius="full" overflow="hidden">
                    <Box
                      h="full"
                      w={`${Math.min(Math.max(sub.accuracy, 4), 100)}%`}
                      bg={getProgressColor(sub.accuracy)}
                      borderRadius="full"
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
