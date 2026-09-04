import { Box, Flex, Heading, Text, HStack, Badge, Progress, Button, Icon, Grid } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useNavigationStore } from "@/store/usenavigationStore";
import {
  FiTarget,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiAlertCircle,
  FiArrowRight,
  FiShield,
  FiAward,
  FiInfo,
} from "react-icons/fi";
import type { ExamReadinessData } from "@/hooks/useExamReadiness";

interface Props {
  readiness: ExamReadinessData | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export const ExamReadinessCard = ({ readiness, loading }: Props) => {
  const { setCurrentStudentPage } = useNavigationStore();

  if (loading) {
    return (
      <Box
        bg="white"
        p={4}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 2px 10px rgba(0, 0, 0, 0.04)"
        mb={6}
      >
        <DancingLogoLoader size="sm" text="Calculating Exam Readiness Score..." minH="90px" />
      </Box>
    );
  }

  if (!readiness) return null;

  const {
    targetExam,
    overallReadiness,
    readinessBand,
    hasSufficientData,
    confidenceLevel,
    strongestSubjects,
    weakestSubjects,
    improvingSubjects,
    decliningSubjects,
    recommendedNextAction,
    subjectBreakdown,
  } = readiness;

  const bandColor =
    readinessBand === "Exam Ready"
      ? "green"
      : readinessBand === "On Track"
      ? "blue"
      : readinessBand === "Developing"
      ? "yellow"
      : readinessBand === "Needs Focus"
      ? "orange"
      : "gray";

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 4px 20px rgba(32, 108, 225, 0.05)"
      p={{ base: 4, md: 6 }}
      mb={6}
      position="relative"
      overflow="hidden"
    >
      {/* Top Accent Strip */}
      <Box position="absolute" top={0} left={0} right={0} h="4px" bgGradient="linear(to-r, #1E56B3, #206CE1, #38BDF8)" />

      {/* Header */}
      <Flex justify="space-between" align={{ base: "start", sm: "center" }} wrap="wrap" gap={3} mb={5}>
        <HStack gap={3}>
          <Box bg="blue.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="blue.200">
            <Icon as={FiTarget} color="#206CE1" boxSize="20px" />
          </Box>
          <Box>
            <HStack gap={2} wrap="wrap">
              <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                Exam Readiness Indicator
              </Heading>
              <Badge colorPalette="blue" variant="solid" size="sm" borderRadius="full" px={2.5}>
                Target: {targetExam}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              Current preparation and practice status based on your iGrades assessment data
            </Text>
          </Box>
        </HStack>

        <HStack gap={2}>
          {hasSufficientData && (
            <Badge colorPalette="gray" variant="surface" size="xs" borderRadius="full">
              Confidence: {confidenceLevel}
            </Badge>
          )}
        </HStack>
      </Flex>

      {/* Insufficient Data State */}
      {!hasSufficientData ? (
        <Box
          bg="blue.50/40"
          border="1px dashed"
          borderColor="blue.200"
          borderRadius="xl"
          p={{ base: 4, md: 6 }}
          textAlign="center"
        >
          <Icon as={FiInfo} color="#206CE1" boxSize="24px" mb={2} />
          <Heading size="sm" color="gray.900" mb={1}>
            Not enough data yet
          </Heading>
          <Text fontSize="xs" color="gray.600" maxW="480px" mx="auto" mb={4}>
            We need at least 1 practice quiz (10 questions) to calculate your verified exam readiness score for {targetExam}.
          </Text>
          <Button
            size="sm"
            bg="#206CE1"
            color="white"
            borderRadius="xl"
            fontWeight="700"
            _hover={{ bg: "#1E56B3" }}
            onClick={() => setCurrentStudentPage("quiz")}
          >
            Take Your First Practice Quiz <Icon as={FiArrowRight} ml={1} />
          </Button>
        </Box>
      ) : (
        <>
          {/* Main Score + Quick Stats Banner */}
          <Grid templateColumns={{ base: "1fr", md: "260px 1fr" }} gap={5} mb={6} alignContent="center">
            {/* Overall Score Circle/Block */}
            <Box
              bg="gray.50"
              p={5}
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                Overall Readiness
              </Text>
              <Heading size="2xl" color="#1E56B3" fontWeight="900" my={2}>
                {overallReadiness}%
              </Heading>
              <Badge colorPalette={bandColor} variant="solid" size="md" borderRadius="full" px={3} py={0.5}>
                {readinessBand}
              </Badge>
              <Text fontSize="10px" color="gray.500" mt={2} textAlign="center">
                Based on {readiness.subjectsEvaluatedCount} subjects & {readiness.totalQuestionsAnswered} questions solved
              </Text>
            </Box>

            {/* Diagnostics Summary Cards */}
            <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }} gap={3}>
              {/* Strongest */}
              <Box p={3.5} borderRadius="xl" bg="green.50/50" border="1px solid" borderColor="green.200">
                <HStack gap={1.5} color="green.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={FiAward} />
                  <Text>Strongest</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {strongestSubjects.length > 0 ? strongestSubjects[0].subjectName : "In progress"}
                </Text>
                <Text fontSize="10px" color="green.700" mt={0.5}>
                  {strongestSubjects.length > 0 ? `${strongestSubjects[0].readinessScore}% ready` : "Practice more"}
                </Text>
              </Box>

              {/* Focus Area */}
              <Box p={3.5} borderRadius="xl" bg="orange.50/50" border="1px solid" borderColor="orange.200">
                <HStack gap={1.5} color="orange.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={FiAlertCircle} />
                  <Text>Needs Focus</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {weakestSubjects.length > 0 ? weakestSubjects[0].subjectName : "None"}
                </Text>
                <Text fontSize="10px" color="orange.700" mt={0.5}>
                  {weakestSubjects.length > 0 ? `${weakestSubjects[0].readinessScore}% ready` : "All on track"}
                </Text>
              </Box>

              {/* Improving */}
              <Box p={3.5} borderRadius="xl" bg="blue.50/50" border="1px solid" borderColor="blue.200">
                <HStack gap={1.5} color="blue.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={FiTrendingUp} />
                  <Text>Improving</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {improvingSubjects.length > 0 ? improvingSubjects[0].subjectName : "Steady pace"}
                </Text>
                <Text fontSize="10px" color="blue.700" mt={0.5}>
                  {improvingSubjects.length > 0 ? `+${improvingSubjects[0].trendDiff}% trend` : "Consistent"}
                </Text>
              </Box>

              {/* Declining / Review */}
              <Box p={3.5} borderRadius="xl" bg="purple.50/50" border="1px solid" borderColor="purple.200">
                <HStack gap={1.5} color="purple.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={decliningSubjects.length > 0 ? FiTrendingDown : FiMinus} />
                  <Text>Review</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {decliningSubjects.length > 0 ? decliningSubjects[0].subjectName : "Stable"}
                </Text>
                <Text fontSize="10px" color="purple.700" mt={0.5}>
                  {decliningSubjects.length > 0 ? `${decliningSubjects[0].trendDiff}% down` : "No drops"}
                </Text>
              </Box>
            </Grid>
          </Grid>

          {/* Subject-by-Subject Readiness Bars */}
          <Box mb={5}>
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={3}>
              Subject Readiness Breakdown
            </Text>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={3}>
              {subjectBreakdown.map((sub) => {
                const subColor =
                  sub.status === "exam_ready"
                    ? "green"
                    : sub.status === "on_track"
                    ? "blue"
                    : sub.status === "developing"
                    ? "yellow"
                    : sub.status === "needs_focus"
                    ? "orange"
                    : "gray";

                const progressCol =
                  (sub.readinessScore || 0) >= 80
                    ? "#10B981"
                    : (sub.readinessScore || 0) >= 65
                    ? "#206CE1"
                    : (sub.readinessScore || 0) >= 50
                    ? "#F59E0B"
                    : "#EF4444";

                return (
                  <Box
                    key={sub.subjectId}
                    p={3.5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.100"
                    bg="gray.50/60"
                    cursor="pointer"
                    _hover={{ bg: "white", borderColor: "blue.200", shadow: "sm" }}
                    transition="all 0.2s"
                    onClick={() => setCurrentStudentPage("quiz")}
                  >
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <Text fontSize="xs" fontWeight="700" color="gray.900" textTransform="capitalize">
                        {sub.subjectName}
                      </Text>
                      {sub.readinessScore !== null ? (
                        <Badge colorPalette={subColor} size="xs" variant="solid" borderRadius="md">
                          {sub.readinessScore}%
                        </Badge>
                      ) : (
                        <Badge colorPalette="gray" size="xs" variant="surface" borderRadius="md">
                          No tests
                        </Badge>
                      )}
                    </Flex>

                    {sub.readinessScore !== null ? (
                      <>
                        <Progress.Root value={sub.readinessScore} size="xs">
                          <Progress.Track bg="gray.200" borderRadius="full">
                            <Progress.Range bg={progressCol} borderRadius="full" />
                          </Progress.Track>
                        </Progress.Root>
                        <HStack justify="space-between" mt={2} fontSize="10px" color="gray.500">
                          <Text>{sub.questionsSolved} Qs solved</Text>
                          <Text>{sub.topicCoveragePercent}% topic coverage</Text>
                        </HStack>
                      </>
                    ) : (
                      <Text fontSize="10px" color="gray.400" fontStyle="italic" mt={1}>
                        Requires 1 quiz to unlock readiness
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Grid>
          </Box>

          {/* Recommended Next Action Banner */}
          <Box
            bg="#206CE1"
            color="white"
            p={{ base: 4, md: 5 }}
            borderRadius="xl"
            display="flex"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ base: "start", sm: "center" }}
            gap={3}
          >
            <Box>
              <HStack gap={2} mb={1}>
                <Badge bg="white/20" color="white" size="xs" borderRadius="full" px={2}>
                  Recommended Next Action
                </Badge>
              </HStack>
              <Text fontSize="sm" fontWeight="800" color="white">
                {recommendedNextAction.title}
              </Text>
              <Text fontSize="xs" color="blue.100" mt={0.5}>
                {recommendedNextAction.description}
              </Text>
            </Box>

            <Button
              size="sm"
              bg="white"
              color="#206CE1"
              borderRadius="xl"
              fontWeight="800"
              flexShrink={0}
              _hover={{ bg: "gray.100" }}
              onClick={() => {
                if (recommendedNextAction.actionType === "watch_video") {
                  setCurrentStudentPage("learn");
                } else {
                  setCurrentStudentPage("quiz");
                }
              }}
            >
              {recommendedNextAction.ctaText} <Icon as={FiArrowRight} ml={1} />
            </Button>
          </Box>
        </>
      )}

      {/* Bottom Disclaimer */}
      <HStack gap={1.5} color="gray.400" fontSize="10px" mt={4} justify="center">
        <Icon as={FiShield} boxSize="12px" />
        <Text>
          Readiness indicator reflects current iGrades practice activity and test performance. It is an internal preparation diagnostic, not an official exam board prediction.
        </Text>
      </HStack>
    </Box>
  );
};
