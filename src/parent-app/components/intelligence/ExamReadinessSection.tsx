import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Icon,
  HStack,
  Grid,
  Progress,
} from "@chakra-ui/react";
import { FiMinus } from "react-icons/fi";
import {
  PiMedalFill,
  PiWarningCircleFill,
  PiChartLineUpFill,
  PiTrendDownBold,
  PiShieldCheckFill,
  PiInfoFill,
} from "react-icons/pi";
import { TbTargetArrow } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { useExamReadiness } from "@/hooks/useExamReadiness";

interface Props {
  studentId: string;
  studentClass: string;
  studentName?: string;
}

export const ExamReadinessSection = ({ studentId, studentClass, studentName = "Your child" }: Props) => {
  const { t } = useTranslation();
  const { readiness, loading } = useExamReadiness(studentId, studentClass);

  if (loading) {
    return (
      <Box
        bg="white"
        p={{ base: 4, md: 6 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
        mb={6}
      >
        <Flex justify="center" align="center" minH="120px">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            {t("Calculating Exam Readiness for")} {studentName}...
          </Text>
        </Flex>
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
    priorityTopics,
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
      p={{ base: 4, md: 6 }}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
      mb={6}
      position="relative"
      overflow="hidden"
    >
      {/* Top Gradient Accent */}
      <Box position="absolute" top={0} left={0} right={0} h="4px" bgGradient="linear(to-r, #1E56B3, #206CE1, #38BDF8)" />

      {/* Section Header */}
      <Flex justify="space-between" align={{ base: "start", sm: "center" }} mb={5} wrap="wrap" gap={3}>
        <HStack gap={2.5}>
          <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200" boxShadow="0 2px 6px rgba(32, 108, 225, 0.12)">
            <Icon as={TbTargetArrow} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <HStack gap={2} wrap="wrap">
              <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                {t("Exam Readiness Indicator")}
              </Heading>
              <Badge colorPalette="blue" variant="solid" size="sm" borderRadius="full" px={2.5}>
                {t("Target")}: {targetExam}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Current preparation and practice status based on available test evidence")}
            </Text>
          </Box>
        </HStack>

        <HStack gap={2}>
          {hasSufficientData && (
            <Badge colorPalette="gray" variant="surface" size="xs" borderRadius="full">
              {t("Confidence")}: {confidenceLevel}
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
          <Icon as={PiInfoFill} color="#206CE1" boxSize="24px" mb={2} />
          <Heading size="sm" color="gray.900" mb={1}>
            {t("Not enough data yet")}
          </Heading>
          <Text fontSize="xs" color="gray.600" maxW="480px" mx="auto">
            {studentName} needs to complete at least 1 practice quiz (10 questions) in their student portal to generate a verified exam readiness indicator for {targetExam}.
          </Text>
        </Box>
      ) : (
        <>
          {/* Main Score & Diagnostic Blocks */}
          <Grid templateColumns={{ base: "1fr", md: "240px 1fr" }} gap={4} mb={5}>
            {/* Overall Score Box */}
            <Box
              bg="gray.50"
              p={4}
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
                {t("Overall Readiness")}
              </Text>
              <Heading size="2xl" color="#1E56B3" fontWeight="900" my={1.5}>
                {overallReadiness}%
              </Heading>
              <Badge colorPalette={bandColor} variant="solid" size="md" borderRadius="full" px={3} py={0.5}>
                {readinessBand}
              </Badge>
              <Text fontSize="10px" color="gray.500" mt={2}>
                {t("Based on")} {readiness.subjectsEvaluatedCount} {t("subjects")} & {readiness.totalQuestionsAnswered} {t("questions solved")}
              </Text>
            </Box>

            {/* Diagnostic Badges */}
            <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }} gap={2.5}>
              {/* Strongest */}
              <Box p={3} borderRadius="xl" bg="green.50/40" border="1px solid" borderColor="green.200">
                <HStack gap={1} color="green.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={PiMedalFill} />
                  <Text>{t("Strongest")}</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {strongestSubjects.length > 0 ? strongestSubjects[0].subjectName : t("Building data")}
                </Text>
                <Text fontSize="10px" color="green.700" mt={0.5}>
                  {strongestSubjects.length > 0 ? `${strongestSubjects[0].readinessScore}% ready` : t("Practice more")}
                </Text>
              </Box>

              {/* Weakest / Focus */}
              <Box p={3} borderRadius="xl" bg="orange.50/40" border="1px solid" borderColor="orange.200">
                <HStack gap={1} color="orange.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={PiWarningCircleFill} />
                  <Text>{t("Needs Focus")}</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {weakestSubjects.length > 0 ? weakestSubjects[0].subjectName : t("None")}
                </Text>
                <Text fontSize="10px" color="orange.700" mt={0.5}>
                  {weakestSubjects.length > 0 ? `${weakestSubjects[0].readinessScore}% ready` : t("All on track")}
                </Text>
              </Box>

              {/* Improving */}
              <Box p={3} borderRadius="xl" bg="blue.50/40" border="1px solid" borderColor="blue.200">
                <HStack gap={1} color="blue.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={PiChartLineUpFill} />
                  <Text>{t("Improving")}</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {improvingSubjects.length > 0 ? improvingSubjects[0].subjectName : t("Consistent")}
                </Text>
                <Text fontSize="10px" color="blue.700" mt={0.5}>
                  {improvingSubjects.length > 0 ? `+${improvingSubjects[0].trendDiff}% trend` : t("Steady pace")}
                </Text>
              </Box>

              {/* Declining */}
              <Box p={3} borderRadius="xl" bg="purple.50/40" border="1px solid" borderColor="purple.200">
                <HStack gap={1} color="purple.700" fontSize="11px" fontWeight="700" mb={1}>
                  <Icon as={decliningSubjects.length > 0 ? PiTrendDownBold : FiMinus} />
                  <Text>{t("Review")}</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="800" color="gray.900" truncate>
                  {decliningSubjects.length > 0 ? decliningSubjects[0].subjectName : t("Stable")}
                </Text>
                <Text fontSize="10px" color="purple.700" mt={0.5}>
                  {decliningSubjects.length > 0 ? `${decliningSubjects[0].trendDiff}% drop` : t("No drops")}
                </Text>
              </Box>
            </Grid>
          </Grid>

          {/* Subject-by-Subject Breakdown */}
          <Box mb={5}>
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={3}>
              {t("Subject Readiness Breakdown")}
            </Text>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={3}>
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
                          {t("No tests")}
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
                          <Text>{sub.questionsSolved} {t("Qs solved")}</Text>
                          <Text>{sub.topicCoveragePercent}% {t("topic coverage")}</Text>
                        </HStack>
                      </>
                    ) : (
                      <Text fontSize="10px" color="gray.400" fontStyle="italic" mt={1}>
                        {t("Requires 1 quiz attempt")}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Grid>
          </Box>

          {/* Priority Topics Alert (if any) */}
          {priorityTopics.length > 0 && (
            <Box mb={5} p={3.5} borderRadius="xl" bg="orange.50/40" border="1px solid" borderColor="orange.200">
              <HStack gap={2} mb={2}>
                <Icon as={PiWarningCircleFill} color="orange.600" />
                <Text fontSize="xs" fontWeight="800" color="orange.900">
                  {t("Priority Practice Topics for")} {studentName}
                </Text>
              </HStack>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={2}>
                {priorityTopics.slice(0, 4).map((pt, i) => (
                  <Box key={i} p={2.5} bg="white" borderRadius="lg" border="1px solid" borderColor="orange.100">
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {pt.topicName}
                      </Text>
                      <Badge colorPalette="orange" size="xs" variant="subtle">
                        {pt.subjectName}
                      </Badge>
                    </HStack>
                    <Text fontSize="10px" color="gray.600">
                      {pt.recommendedAction}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}

          {/* Parent Action Guidance */}
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
                  {t("How You Can Help")}
                </Badge>
              </HStack>
              <Text fontSize="sm" fontWeight="800" color="white">
                {recommendedNextAction.title}
              </Text>
              <Text fontSize="xs" color="blue.100" mt={0.5}>
                Encourage {studentName} to spend 15 minutes reviewing this topic or taking a practice quiz on iGrades this week.
              </Text>
            </Box>
          </Box>
        </>
      )}

      {/* Bottom Disclaimer */}
      <HStack gap={1.5} color="gray.400" fontSize="10px" mt={4} justify="center">
        <Icon as={PiShieldCheckFill} boxSize="12px" />
        <Text>
          {t("Readiness indicator reflects current iGrades practice activity and test performance. It is an internal preparation diagnostic, not an official exam board prediction.")}
        </Text>
      </HStack>
    </Box>
  );
};
