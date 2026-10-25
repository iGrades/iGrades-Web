"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Flex,
  Icon,
} from "@chakra-ui/react";
import {
  FiClock,
  FiTarget,
  FiArrowRight,
  FiRepeat,
  FiBookOpen,
  FiZap,
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { PiShootingStarDuotone } from "react-icons/pi";
import type { StudyRecommendation, RecommendationType } from "@/services/learningIntelligence/types";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useSparkStore } from "@/store/useSparkStore";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LockedBadge } from "@/components/subscription/LockedBadge";

interface NextStudyRecommendationCardProps {
  recommendation?: StudyRecommendation;
  allRecommendations?: StudyRecommendation[];
  targetExam?: string;
  loading?: boolean;
}

const TYPE_CONFIG: Record<
  RecommendationType,
  { label: string; bg: string; color: string; icon: React.ElementType }
> = {
  review: {
    label: "Mistake Drill",
    bg: "#FEF2F2",
    color: "#DC2626",
    icon: FiRepeat,
  },
  topic: {
    label: "Topic Focus",
    bg: "#FFF7ED",
    color: "#EA580C",
    icon: FiTarget,
  },
  subject: {
    label: "Subject Refresher",
    bg: "#EFF6FF",
    color: "#2563EB",
    icon: FiBookOpen,
  },
  practice: {
    label: "Targeted Practice",
    bg: "#F0FDFA",
    color: "#0D9488",
    icon: FiCheckCircle,
  },
  goal: {
    label: "Streak & Goal",
    bg: "#FAF5FF",
    color: "#9333EA",
    icon: FiAward,
  },
  exam_prep: {
    label: "Exam Simulation",
    bg: "#EEF2FF",
    color: "#4F46E5",
    icon: FiZap,
  },
};

export const NextStudyRecommendationCard: React.FC<NextStudyRecommendationCardProps> = ({
  recommendation,
  allRecommendations = [],
  targetExam = "WAEC",
  loading = false,
}) => {
  const { setCurrentStudentPage } = useNavigationStore();
  const { openWithContext } = useSparkStore();
  const [showSecondary, setShowSecondary] = useState(false);

  const {
    effectivePlan,
    verifyRecommendations,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  if (loading) {
    return (
      <Box
        p={4}
        borderRadius="2xl"
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.04)"
        my={4}
      >
        <Text fontSize="11px" color="gray.400">
          Analyzing performance & finding your next study focus...
        </Text>
      </Box>
    );
  }

  if (!recommendation) {
    return null;
  }

  const recType = recommendation.type || "topic";
  const config = TYPE_CONFIG[recType] || TYPE_CONFIG.topic;
  const TypeIcon = config.icon;

  const handleAction = (rec: StudyRecommendation) => {
    if (rec.actionType === "diagnose_weakness" || rec.actionTarget?.page === "spark") {
      const sparkAccess = verifyRecommendations("advanced_intelligence");
      if (!sparkAccess.allowed) {
        promptUpgrade(
          "Spark AI Tutoring Companion",
          "premium",
          "Personalized Spark AI tutoring companion assistance is available on the Premium (₦25,000) plan."
        );
        return;
      }

      openWithContext(
        {
          contextType: "topic_study",
          subject: rec.subjectName,
          topic: rec.topicName,
          examination: targetExam,
          sourceView: "recommendations_card",
        },
        rec.sparkPromptHint ||
          `Help me master ${rec.topicName || rec.subjectName || "this topic"}. What are the core concepts and common exam traps?`
      );
      return;
    }

    if (rec.actionTarget?.page === "quiz" || rec.actionType === "practice_quiz" || rec.actionType === "mock_exam") {
      setCurrentStudentPage("quiz");
      return;
    }

    if (rec.actionTarget?.page === "learn" || rec.actionType === "watch_video") {
      setCurrentStudentPage("learn");
      return;
    }

    if (rec.actionTarget?.page === "rewards") {
      setCurrentStudentPage("rewards");
      return;
    }

    setCurrentStudentPage("quiz");
  };

  const secondaryRecommendations = allRecommendations.filter(
    (r) => r.id !== recommendation.id
  );

  return (
    <Box
      borderRadius="2xl"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.04)"
      p={{ base: 4, sm: 5 }}
      my={4}
    >
      {/* Mobile Header */}
      <Flex justify="space-between" align="center" mb={3.5} gap={2}>
        <Box minW={0} flex={1}>
          <Heading
            as="h2"
            fontSize={{ base: "13.5px", sm: "15px", md: "16px" }}
            fontWeight="700"
            color="#1E293B"
            lineHeight="1.2"
            whiteSpace="nowrap"
          >
            What should I study next?
          </Heading>
          <Text fontSize="11px" color="#64748B" mt={0.5} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            Tailored recommendation for {targetExam}
          </Text>
        </Box>

        <HStack gap={1.5} flexShrink={0}>
          <Box
            bg={config.bg}
            color={config.color}
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="10.5px"
            fontWeight="700"
            whiteSpace="nowrap"
          >
            {config.label}
          </Box>
        </HStack>
      </Flex>

      {/* Main recommendation mobile card */}
      <Box
        p={3.5}
        borderRadius="xl"
        bg="#F8FAFC"
        border="1px solid"
        borderColor="#E2E8F0"
        mb={3}
      >
        {/* Top card info row */}
        <Flex justify="space-between" align="center" mb={2}>
          <HStack gap={2} minW={0}>
            <Flex
              w="28px"
              h="28px"
              borderRadius="lg"
              bg={config.bg}
              color={config.color}
              align="center"
              justify="center"
              fontSize="14px"
              flexShrink={0}
            >
              <TypeIcon />
            </Flex>
            <Text fontSize="13px" fontWeight="700" color="#1E293B" truncate>
              {recommendation.title}
            </Text>
          </HStack>

          <HStack gap={1.5} flexShrink={0}>
            {recommendation.priority === "high" && (
              <Badge colorPalette="red" variant="solid" fontSize="9.5px" px={1.5} py={0.2} borderRadius="md">
                Priority
              </Badge>
            )}
            <HStack gap={1} fontSize="10px" color="#64748B" bg="#EDF2F7" px={1.5} py={0.5} borderRadius="md">
              <Icon as={FiClock} boxSize="10px" />
              <Text>{recommendation.estimatedMinutes || 15}m</Text>
            </HStack>
          </HStack>
        </Flex>

        {/* Description */}
        <Text fontSize="12px" color="#475569" lineHeight="1.45" mb={2.5}>
          {recommendation.description}
        </Text>

        {/* Why this matters callout */}
        {recommendation.reason && (
          <Flex
            gap={2}
            p={2}
            borderRadius="lg"
            bg="#EFF6FF"
            border="1px solid"
            borderColor="#DBEAFE"
            align="flex-start"
            mb={3}
          >
            <Box color="#288AE4" mt={0.5} flexShrink={0}>
              <Icon as={FiHelpCircle} boxSize="12px" />
            </Box>
            <Text fontSize="11px" color="#1E40AF" lineHeight="1.35">
              <strong>Why:</strong> {recommendation.reason}
            </Text>
          </Flex>
        )}

        {/* Action Buttons (Mobile-first vertical stack) */}
        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            w="full"
            h="38px"
            bg="#288AE4"
            color="white"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12.5px"
            boxShadow="0 2px 6px rgba(40, 138, 228, 0.2)"
            _hover={{ bg: "#1D75C7" }}
            _active={{ bg: "#185BA9" }}
            onClick={() => handleAction(recommendation)}
          >
            {recommendation.actionText || "Start Activity"}
            <Icon as={FiArrowRight} ml={1.5} />
          </Button>

          {recommendation.topicName && (
            <Button
              w="full"
              h="34px"
              variant="outline"
              borderColor="#CBD5E1"
              color="#288AE4"
              bg="white"
              borderRadius="xl"
              fontSize="11.5px"
              fontWeight="600"
              _hover={{ bg: "#F8FAFC" }}
              _active={{ bg: "#F1F5F9" }}
              onClick={() => {
                if (effectivePlan !== "premium") {
                  promptUpgrade(
                    "Spark AI Tutoring Companion",
                    "premium",
                    "Advanced personalized learning intelligence with Spark AI tutoring companion requires a Premium (₦25,000) subscription."
                  );
                  return;
                }
                openWithContext(
                  {
                    contextType: "topic_study",
                    subject: recommendation.subjectName,
                    topic: recommendation.topicName,
                    examination: targetExam,
                    sourceView: "recommendations_card",
                  },
                  `Can you explain the core concepts of ${recommendation.topicName} in ${recommendation.subjectName || "my syllabus"}?`
                );
              }}
            >
              <PiShootingStarDuotone style={{ marginRight: "5px" }} />
              Ask Spark about this topic {effectivePlan !== "premium" && "(Premium)"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Secondary recommendations mobile collapsible */}
      {secondaryRecommendations.length > 0 && (
        <Box pt={1}>
          {effectivePlan === "basic" ? (
            <Flex
              p={2.5}
              borderRadius="xl"
              bg="#FFF7ED"
              border="1px dashed"
              borderColor="#FDBA74"
              justify="space-between"
              align="center"
              gap={2}
            >
              <HStack gap={1.5}>
                <LockedBadge requiredPlan="standard" label="Standard" size="xs" />
                <Text fontSize="11px" fontWeight="600" color="#9A3412">
                  {secondaryRecommendations.length} more personalized study paths
                </Text>
              </HStack>
              <Button
                size="xs"
                h="26px"
                bg="#288AE4"
                color="white"
                borderRadius="md"
                fontSize="10px"
                fontWeight="700"
                _hover={{ bg: "#1D75C7" }}
                onClick={() =>
                  promptUpgrade(
                    "Personalized Study Paths",
                    "standard",
                    "Personalized study recommendations and tailored revision paths require a Standard (₦15,000) or Premium subscription."
                  )
                }
              >
                Unlock
              </Button>
            </Flex>
          ) : (
            <>
              <Button
                variant="ghost"
                size="xs"
                w="full"
                color="#64748B"
                fontSize="11px"
                fontWeight="600"
                py={1}
                _hover={{ color: "#1E293B", bg: "#F8FAFC" }}
                onClick={() => setShowSecondary(!showSecondary)}
              >
                <HStack gap={1} justify="center">
                  <Text>
                    {showSecondary
                      ? "Hide additional recommendations"
                      : `View ${secondaryRecommendations.length} more recommendations`}
                  </Text>
                  <Icon as={showSecondary ? FiChevronUp : FiChevronDown} />
                </HStack>
              </Button>

              {showSecondary && (
                <VStack gap={2} mt={2.5} align="stretch">
                  {secondaryRecommendations.map((secRec) => {
                    const secConfig = TYPE_CONFIG[secRec.type || "topic"] || TYPE_CONFIG.topic;
                    const SecIcon = secConfig.icon;

                    return (
                      <Flex
                        key={secRec.id}
                        p={2.5}
                        borderRadius="lg"
                        bg="#F8FAFC"
                        border="1px solid"
                        borderColor="#E2E8F0"
                        align="center"
                        justify="space-between"
                        gap={2}
                      >
                        <HStack gap={2} flex={1} minW={0}>
                          <Flex
                            w="24px"
                            h="24px"
                            borderRadius="md"
                            bg={secConfig.bg}
                            color={secConfig.color}
                            align="center"
                            justify="center"
                            fontSize="12px"
                            flexShrink={0}
                          >
                            <SecIcon />
                          </Flex>
                          <Box minW={0}>
                            <Text fontSize="11.5px" fontWeight="700" color="#1E293B" truncate>
                              {secRec.title}
                            </Text>
                            <Text fontSize="10px" color="#64748B" truncate>
                              {secRec.description}
                            </Text>
                          </Box>
                        </HStack>

                        <Button
                          size="xs"
                          h="26px"
                          variant="solid"
                          bg="#288AE4"
                          color="white"
                          borderRadius="md"
                          fontSize="10.5px"
                          fontWeight="600"
                          _hover={{ bg: "#1D75C7" }}
                          onClick={() => handleAction(secRec)}
                          flexShrink={0}
                        >
                          {secRec.actionText || "Start"}
                        </Button>
                      </Flex>
                    );
                  })}
                </VStack>
              )}
            </>
          )}
        </Box>
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

export default NextStudyRecommendationCard;
