import { Box, Flex, Heading, Text, VStack, HStack, Badge, Icon, Grid } from "@chakra-ui/react";
import {
  PiBookOpenTextFill,
  PiTrophyFill,
  PiChartLineUpFill,
  PiWarningCircleFill,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const getSubjectStatusBadge = (status: WeeklySubjectMetric["status"]) => {
    switch (status) {
      case "strong":
        return <Badge colorPalette="green" variant="solid" size="xs" borderRadius="full">{t("Strong")}</Badge>;
      case "good":
        return <Badge colorPalette="blue" variant="subtle" size="xs" borderRadius="full">{t("On Track")}</Badge>;
      case "fair":
        return <Badge colorPalette="yellow" variant="subtle" size="xs" borderRadius="full">{t("Fair")}</Badge>;
      case "needs_attention":
        return <Badge colorPalette="orange" variant="subtle" size="xs" borderRadius="full">{t("Needs Practice")}</Badge>;
      default:
        return <Badge colorPalette="gray" variant="surface" size="xs" borderRadius="full">{t("Not Started")}</Badge>;
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
        <HStack gap={2.5}>
          <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200" boxShadow="0 2px 6px rgba(32, 108, 225, 0.12)">
            <Icon as={PiBookOpenTextFill} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Heading size="sm" color="gray.900" fontWeight="800">
              {t("Subject Performance Breakdown")}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Weekly mastery, score adjustments, and key subject highlights.")}
            </Text>
          </Box>
        </HStack>
        <Badge colorPalette="gray" variant="surface" size="sm" borderRadius="full">
          {subjects.length} {t("Active Subject")}{subjects.length === 1 ? "" : "s"}
        </Badge>
      </Flex>

      {/* 3 Highlight Pills: Strongest, Most Improved, Needs Attention */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={3.5} mb={4}>
        {/* Strongest Subject */}
        <Box
          bg="green.50"
          p={4}
          borderRadius="2xl"
          border="none"
          boxShadow="0 4px 18px -2px rgba(16, 185, 129, 0.18), 0 2px 6px -1px rgba(0, 0, 0, 0.04)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 24px -2px rgba(16, 185, 129, 0.25)" }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          display="flex"
          alignItems="center"
          gap={3.5}
        >
          <Box bg="white" p={2.5} borderRadius="xl" boxShadow="0 2px 6px rgba(16, 185, 129, 0.15)">
            <Icon as={PiTrophyFill} color="green.600" boxSize="18px" />
          </Box>
          <Box>
            <Text fontSize="11px" fontWeight="800" color="green.800" textTransform="uppercase" letterSpacing="0.04em">
              {t("Strongest Subject")}
            </Text>
            <Text fontSize="sm" fontWeight="800" color="green.900">
              {strongestSubject ? strongestSubject.subjectName : t("Pending Activity")}
            </Text>
            {strongestSubject && (
              <Text fontSize="11px" color="green.700">
                {strongestSubject.accuracy}% {t("accuracy")} ({strongestSubject.questionsAttempted} {t("questions")})
              </Text>
            )}
          </Box>
        </Box>

        {/* Most Improved Subject */}
        <Box
          bg="blue.50"
          p={4}
          borderRadius="2xl"
          border="none"
          boxShadow="0 4px 18px -2px rgba(32, 108, 225, 0.18), 0 2px 6px -1px rgba(0, 0, 0, 0.04)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 24px -2px rgba(32, 108, 225, 0.25)" }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          display="flex"
          alignItems="center"
          gap={3.5}
        >
          <Box bg="white" p={2.5} borderRadius="xl" boxShadow="0 2px 6px rgba(32, 108, 225, 0.15)">
            <Icon as={PiChartLineUpFill} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Text fontSize="11px" fontWeight="800" color="#1E56B3" textTransform="uppercase" letterSpacing="0.04em">
              {t("Most Improved")}
            </Text>
            <Text fontSize="sm" fontWeight="800" color="blue.900">
              {mostImprovedSubject ? mostImprovedSubject.subjectName : t("Consistent Progress")}
            </Text>
            {mostImprovedSubject ? (
              <Text fontSize="11px" color="#1E56B3">
                +{mostImprovedSubject.trendDiff}% {t("gain vs prior week")}
              </Text>
            ) : (
              <Text fontSize="11px" color="gray.500">
                {t("Steady baseline maintained")}
              </Text>
            )}
          </Box>
        </Box>

        {/* Needs Attention Subject */}
        <Box
          bg={needsAttentionSubject ? "orange.50" : "gray.50"}
          p={4}
          borderRadius="2xl"
          border="none"
          boxShadow={
            needsAttentionSubject
              ? "0 4px 18px -2px rgba(245, 158, 11, 0.18), 0 2px 6px -1px rgba(0, 0, 0, 0.04)"
              : "0 4px 14px -2px rgba(0, 0, 0, 0.05)"
          }
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: needsAttentionSubject
              ? "0 8px 24px -2px rgba(245, 158, 11, 0.25)"
              : "0 6px 18px -2px rgba(0, 0, 0, 0.08)",
          }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          display="flex"
          alignItems="center"
          gap={3.5}
        >
          <Box bg="white" p={2.5} borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.08)">
            <Icon as={PiWarningCircleFill} color={needsAttentionSubject ? "orange.600" : "gray.500"} boxSize="18px" />
          </Box>
          <Box>
            <Text fontSize="11px" fontWeight="800" color={needsAttentionSubject ? "orange.800" : "gray.600"} textTransform="uppercase" letterSpacing="0.04em">
              {t("Needs Attention")}
            </Text>
            <Text fontSize="sm" fontWeight="800" color={needsAttentionSubject ? "orange.900" : "gray.700"}>
              {needsAttentionSubject ? needsAttentionSubject.subjectName : t("None Flagged")}
            </Text>
            {needsAttentionSubject ? (
              <Text fontSize="11px" color="orange.700">
                {needsAttentionSubject.accuracy}% {t("accuracy • Practice recommended")}
              </Text>
            ) : (
              <Text fontSize="11px" color="gray.500">
                {t("All active subjects performing well")}
              </Text>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Subject List Cards */}
      {subjects.length === 0 ? (
        <Box p={6} textAlign="center" bg="gray.50" borderRadius="2xl" boxShadow="0 2px 10px rgba(0, 0, 0, 0.04)">
          <Text fontSize="xs" color="gray.500">
            {t("No subject practice recorded for this weekly period.")}
          </Text>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {subjects.map((sub) => {
            const hasPrior = sub.previousAccuracy !== null;
            return (
              <Box
                key={sub.subjectId}
                bg="white"
                p={4.5}
                borderRadius="2xl"
                border="none"
                boxShadow="0 4px 18px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 26px -3px rgba(32, 108, 225, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.04)",
                }}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
                  <HStack gap={2.5}>
                    <Box bg="blue.50" p={2} borderRadius="lg" boxShadow="0 2px 6px rgba(32, 108, 225, 0.08)">
                      <Icon as={PiBookOpenTextFill} color="#206CE1" boxSize="15px" />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="800" color="gray.900">
                        {sub.subjectName}
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        {sub.questionsAttempted} {t("questions attempted")} • {sub.sessionsCount} {t("session")}{sub.sessionsCount === 1 ? "" : "s"}
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
                        ({t("Grade")} {sub.grade})
                      </Text>
                    </Flex>
                  </HStack>
                </Flex>

                {/* Progress bar */}
                <Box mt={2.5}>
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
