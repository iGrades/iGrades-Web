"use client";

import { useState } from "react";
import { Box, Flex, Heading, Text, HStack, Badge, Progress, Button, Icon, Grid } from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useNavigationStore } from "@/store/usenavigationStore";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiAlertCircle,
  FiArrowRight,
  FiAward,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import type { ExamReadinessData } from "@/hooks/useExamReadiness";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LockedBadge } from "@/components/subscription/LockedBadge";

interface Props {
  readiness: ExamReadinessData | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export const ExamReadinessCard = ({ readiness, loading }: Props) => {
  const { setCurrentStudentPage } = useNavigationStore();
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const {
    effectivePlan,
    verifySubject,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  if (loading) {
    return (
      <Box
        bg="white"
        p={4}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.04)"
        my={4}
      >
        <DancingLogoLoader size="sm" text="Calculating Exam Readiness..." minH="90px" />
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

  const displayedSubjects = showAllSubjects ? subjectBreakdown : subjectBreakdown.slice(0, 3);

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.04)"
      p={{ base: 4, sm: 5 }}
      my={4}
    >
      {/* Mobile-Native Section Header */}
      <Flex justify="space-between" align="center" mb={3.5}>
        <Box>
          <Heading
            as="h2"
            fontSize={{ base: "15px", md: "16px" }}
            fontWeight="700"
            color="#1E293B"
            lineHeight="shorter"
          >
            Exam Readiness
          </Heading>
          <Text fontSize="11px" color="#64748B" mt={0.5}>
            Target: {targetExam} {hasSufficientData ? `· ${confidenceLevel} confidence` : ""}
          </Text>
        </Box>
        <Badge
          colorPalette={bandColor}
          variant="solid"
          size="sm"
          borderRadius="full"
          px={2.5}
          py={0.5}
          fontSize="11px"
          fontWeight="700"
        >
          {readinessBand}
        </Badge>
      </Flex>

      {/* Insufficient Data State */}
      {!hasSufficientData ? (
        <Box
          bg="#F8FAFC"
          border="1px dashed"
          borderColor="#CBD5E1"
          borderRadius="xl"
          p={4}
          textAlign="center"
        >
          <Icon as={FiInfo} color="#288AE4" boxSize="20px" mb={1.5} />
          <Heading fontSize="13px" fontWeight="700" color="#1E293B" mb={1}>
            Not enough practice data yet
          </Heading>
          <Text fontSize="11px" color="#64748B" maxW="360px" mx="auto" mb={3}>
            Take 1 practice quiz to compute your {targetExam} readiness score.
          </Text>
          <Button
            size="sm"
            w="full"
            bg="#288AE4"
            color="white"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12px"
            _hover={{ bg: "#1D75C7" }}
            onClick={() => setCurrentStudentPage("quiz")}
          >
            Take Your First Practice Quiz <Icon as={FiArrowRight} ml={1.5} />
          </Button>
        </Box>
      ) : (
        <>
          {/* Mobile Hero Score Card */}
          <Box
            bg="#F8FAFC"
            borderRadius="xl"
            border="1px solid"
            borderColor="#E2E8F0"
            p={3.5}
            mb={3}
          >
            <Flex align="center" gap={3.5}>
              {/* Score circle badge */}
              <Flex
                direction="column"
                align="center"
                justify="center"
                w={{ base: "64px", sm: "70px" }}
                h={{ base: "64px", sm: "70px" }}
                borderRadius="full"
                border="3.5px solid"
                borderColor={
                  overallReadiness >= 75
                    ? "#10B981"
                    : overallReadiness >= 55
                    ? "#288AE4"
                    : overallReadiness >= 40
                    ? "#F59E0B"
                    : "#EF4444"
                }
                bg="white"
                flexShrink={0}
              >
                <Text fontSize="18px" fontWeight="800" color="#1E293B" lineHeight="1">
                  {overallReadiness}%
                </Text>
                <Text fontSize="8.5px" fontWeight="600" color="#64748B" mt="1px">
                  READY
                </Text>
              </Flex>

              {/* Score description & coverage details */}
              <Box flex={1} minW={0}>
                <Text fontSize="10px" fontWeight="700" color="#64748B" textTransform="uppercase" letterSpacing="wider">
                  Overall Preparation
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#1E293B" lineHeight="1.3" mt={0.5}>
                  {readinessBand === "Exam Ready"
                    ? "Excellent performance for " + targetExam
                    : readinessBand === "On Track"
                    ? "Solid progress toward " + targetExam
                    : readinessBand === "Developing"
                    ? "Building foundational knowledge"
                    : "Focused revision recommended"}
                </Text>
                <Text fontSize="10.5px" color="#64748B" mt={1}>
                  {readiness.subjectsEvaluatedCount} subjects evaluated · {readiness.totalQuestionsAnswered} Qs solved
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* 4 Diagnostics Quick Metric Tiles (2x2 Mobile Grid) */}
          <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3.5}>
            {/* Strongest */}
            <Box p={2.5} borderRadius="xl" bg="#F0FDF4" border="1px solid" borderColor="#DCFCE7">
              <HStack gap={1} color="#15803D" fontSize="10px" fontWeight="700" mb={0.5}>
                <Icon as={FiAward} boxSize="11px" />
                <Text>Strongest</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="700" color="#1E293B" truncate>
                {strongestSubjects.length > 0 ? strongestSubjects[0].subjectName : "In progress"}
              </Text>
              <Text fontSize="10px" color="#15803D" mt={0.5}>
                {strongestSubjects.length > 0 ? `${strongestSubjects[0].readinessScore}% ready` : "Practice more"}
              </Text>
            </Box>

            {/* Needs Focus */}
            <Box p={2.5} borderRadius="xl" bg="#FFF7ED" border="1px solid" borderColor="#FFEDD5">
              <HStack gap={1} color="#C2410C" fontSize="10px" fontWeight="700" mb={0.5}>
                <Icon as={FiAlertCircle} boxSize="11px" />
                <Text>Needs Focus</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="700" color="#1E293B" truncate>
                {weakestSubjects.length > 0 ? weakestSubjects[0].subjectName : "None"}
              </Text>
              <Text fontSize="10px" color="#C2410C" mt={0.5}>
                {weakestSubjects.length > 0 ? `${weakestSubjects[0].readinessScore}% ready` : "All on track"}
              </Text>
            </Box>

            {/* Improving */}
            <Box p={2.5} borderRadius="xl" bg="#EFF6FF" border="1px solid" borderColor="#DBEAFE">
              <HStack gap={1} color="#1D4ED8" fontSize="10px" fontWeight="700" mb={0.5}>
                <Icon as={FiTrendingUp} boxSize="11px" />
                <Text>Improving</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="700" color="#1E293B" truncate>
                {improvingSubjects.length > 0 ? improvingSubjects[0].subjectName : "Steady"}
              </Text>
              <Text fontSize="10px" color="#1D4ED8" mt={0.5}>
                {improvingSubjects.length > 0 ? `+${improvingSubjects[0].trendDiff}% trend` : "Consistent"}
              </Text>
            </Box>

            {/* Review */}
            <Box p={2.5} borderRadius="xl" bg="#FAF5FF" border="1px solid" borderColor="#F3E8FF">
              <HStack gap={1} color="#7E22CE" fontSize="10px" fontWeight="700" mb={0.5}>
                <Icon as={decliningSubjects.length > 0 ? FiTrendingDown : FiMinus} boxSize="11px" />
                <Text>Review</Text>
              </HStack>
              <Text fontSize="12px" fontWeight="700" color="#1E293B" truncate>
                {decliningSubjects.length > 0 ? decliningSubjects[0].subjectName : "Stable"}
              </Text>
              <Text fontSize="10px" color="#7E22CE" mt={0.5}>
                {decliningSubjects.length > 0 ? `${decliningSubjects[0].trendDiff}% down` : "No drops"}
              </Text>
            </Box>
          </Grid>

          {/* Subject-by-Subject Mobile List */}
          <Box mb={3.5}>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase" letterSpacing="wider">
                Subject Breakdown
              </Text>
              <Text fontSize="10.5px" color="#94A3B8">
                {subjectBreakdown.length} total
              </Text>
            </Flex>

            <Box display="flex" flexDirection="column" gap={2}>
              {displayedSubjects.map((sub, idx) => {
                const isSubjectAllowed = verifySubject(idx, sub.subjectName).allowed;
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
                    ? "#288AE4"
                    : (sub.readinessScore || 0) >= 50
                    ? "#F59E0B"
                    : "#EF4444";

                return (
                  <Box
                    key={sub.subjectId}
                    p={3}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={!isSubjectAllowed ? "#FED7AA" : "#F1F5F9"}
                    bg={!isSubjectAllowed ? "#FFF7ED" : "#F8FAFC"}
                    cursor="pointer"
                    _active={{ bg: "#EDF2F7" }}
                    transition="all 0.15s"
                    onClick={() => {
                      if (!isSubjectAllowed) {
                        promptUpgrade(
                          "Expanded Subject Readiness",
                          "standard",
                          "Basic plan includes your first 4 starter subjects. Upgrade to Standard (₦15,000) to track readiness across all registered subjects."
                        );
                        return;
                      }
                      setCurrentStudentPage("quiz");
                    }}
                  >
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <HStack gap={1.5}>
                        <Text fontSize="12px" fontWeight="700" color="#1E293B" textTransform="capitalize">
                          {sub.subjectName}
                        </Text>
                        {!isSubjectAllowed && (
                          <LockedBadge requiredPlan="standard" label="Standard" size="xs" />
                        )}
                      </HStack>
                      {sub.readinessScore !== null ? (
                        <Badge colorPalette={subColor} size="xs" variant="solid" borderRadius="md" fontSize="10px" px={1.5}>
                          {sub.readinessScore}%
                        </Badge>
                      ) : (
                        <Badge colorPalette="gray" size="xs" variant="surface" borderRadius="md" fontSize="10px">
                          No quizzes
                        </Badge>
                      )}
                    </Flex>

                    {sub.readinessScore !== null ? (
                      <>
                        <Progress.Root value={sub.readinessScore} size="xs">
                          <Progress.Track bg="#E2E8F0" borderRadius="full" h="4px">
                            <Progress.Range bg={progressCol} borderRadius="full" />
                          </Progress.Track>
                        </Progress.Root>
                        <HStack justify="space-between" mt={1.5} fontSize="9.5px" color="#64748B">
                          <Text>{sub.questionsSolved} Qs solved</Text>
                          <Text>{sub.topicCoveragePercent}% coverage</Text>
                        </HStack>
                      </>
                    ) : (
                      <Text fontSize="9.5px" color="#94A3B8" fontStyle="italic">
                        Complete 1 quiz to calculate score
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Expand / Collapse Button if more than 3 subjects */}
            {subjectBreakdown.length > 3 && (
              <Button
                variant="ghost"
                size="xs"
                w="full"
                color="#288AE4"
                fontWeight="600"
                fontSize="11px"
                mt={2}
                py={1}
                _hover={{ bg: "#F1F5F9" }}
                onClick={() => setShowAllSubjects(!showAllSubjects)}
              >
                <HStack gap={1}>
                  <Text>
                    {showAllSubjects
                      ? "Show fewer subjects"
                      : `View all ${subjectBreakdown.length} subjects`}
                  </Text>
                  <Icon as={showAllSubjects ? FiChevronUp : FiChevronDown} />
                </HStack>
              </Button>
            )}
          </Box>

          {/* Recommended Next Action Banner (Mobile Style) */}
          <Box
            bg="#288AE4"
            color="white"
            p={3.5}
            borderRadius="xl"
            boxShadow="0 2px 6px rgba(40, 138, 228, 0.2)"
          >
            <HStack gap={1.5} mb={1}>
              <Box bg="white/20" px={2} py={0.5} borderRadius="full" fontSize="9.5px" fontWeight="700" letterSpacing="wide">
                RECOMMENDED ACTION
              </Box>
            </HStack>
            <Text fontSize="13px" fontWeight="700" color="white" lineHeight="1.3">
              {recommendedNextAction.title}
            </Text>
            <Text fontSize="11px" color="white" opacity={0.9} mt={1} lineHeight="1.3">
              {recommendedNextAction.description}
            </Text>

            <Button
              size="sm"
              w="full"
              mt={3}
              h="36px"
              bg="white"
              color="#288AE4"
              borderRadius="lg"
              fontWeight="700"
              fontSize="12px"
              _hover={{ bg: "#F8FAFC" }}
              _active={{ bg: "#E2E8F0" }}
              onClick={() => {
                if (recommendedNextAction.actionType === "watch_video") {
                  setCurrentStudentPage("learn");
                } else {
                  setCurrentStudentPage("quiz");
                }
              }}
            >
              {recommendedNextAction.ctaText} <Icon as={FiArrowRight} ml={1.5} />
            </Button>
          </Box>
        </>
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </Box>
  );
};

export default ExamReadinessCard;
