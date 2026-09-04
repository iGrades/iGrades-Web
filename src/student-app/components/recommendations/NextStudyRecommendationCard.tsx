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
import type { StudyRecommendation, RecommendationType } from "@/services/learningIntelligence/types";
import { useNavigationStore } from "@/store/usenavigationStore";
import { useSparkStore } from "@/store/useSparkStore";

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
    bg: "red.50",
    color: "red.600",
    icon: FiRepeat,
  },
  topic: {
    label: "Topic Focus",
    bg: "orange.50",
    color: "orange.600",
    icon: FiTarget,
  },
  subject: {
    label: "Subject Refresher",
    bg: "blue.50",
    color: "blue.600",
    icon: FiBookOpen,
  },
  practice: {
    label: "Targeted Practice",
    bg: "teal.50",
    color: "teal.600",
    icon: FiCheckCircle,
  },
  goal: {
    label: "Streak & Goal",
    bg: "purple.50",
    color: "purple.600",
    icon: FiAward,
  },
  exam_prep: {
    label: "Exam Simulation",
    bg: "indigo.50",
    color: "indigo.600",
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

  if (loading) {
    return (
      <Box
        p={6}
        borderRadius="2xl"
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 4px 20px rgba(0,0,0,0.03)"
      >
        <Text fontSize="sm" color="gray.400">
          Analyzing performance & generating study recommendations...
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

    // Default to quiz practice
    setCurrentStudentPage("quiz");
  };

  const secondaryRecommendations = allRecommendations.filter(
    (r) => r.id !== recommendation.id
  );

  return (
    <Box
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
      bg="linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="0 10px 30px -5px rgba(32, 108, 225, 0.08)"
      position="relative"
      overflow="hidden"
      mb={6}
    >
      {/* Subtle top accent bar */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bg="linear-gradient(90deg, #206CE1 0%, #6366F1 50%, #EC4899 100%)"
      />

      {/* Header section */}
      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", sm: "center" }}
        flexDirection={{ base: "column", sm: "row" }}
        gap={3}
        mb={4}
      >
        <HStack gap={2}>
          <Box
            w={8}
            h={8}
            borderRadius="lg"
            bg={config.bg}
            color={config.color}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="18px"
          >
            <TypeIcon />
          </Box>
          <Box>
            <Heading size="sm" color="gray.900" fontWeight="700">
              What Should I Study Next?
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Tailored for your {targetExam} preparation
            </Text>
          </Box>
        </HStack>

        <HStack gap={2}>
          <Badge
            variant="subtle"
            px={2.5}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="600"
            bg={config.bg}
            color={config.color}
          >
            {config.label}
          </Badge>
          <HStack
            gap={1}
            px={2.5}
            py={1}
            borderRadius="full"
            bg="gray.100"
            fontSize="xs"
            color="gray.600"
            fontWeight="500"
          >
            <FiClock />
            <Text>{recommendation.estimatedMinutes || 15} mins</Text>
          </HStack>
        </HStack>
      </Flex>

      {/* Main recommendation body */}
      <Box
        p={4}
        borderRadius="xl"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="0 2px 8px rgba(0,0,0,0.02)"
        mb={4}
      >
        <HStack justify="space-between" align="flex-start" gap={3} mb={2}>
          <Heading size="xs" color="gray.800" fontWeight="600">
            {recommendation.title}
          </Heading>
          {recommendation.priority === "high" && (
            <Badge colorPalette="red" variant="solid" fontSize="10px" px={2}>
              High Priority
            </Badge>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.700" lineHeight="1.6" mb={3}>
          {recommendation.description}
        </Text>

        {recommendation.reason && (
          <HStack
            gap={2}
            p={2.5}
            borderRadius="lg"
            bg="blue.50"
            border="1px solid"
            borderColor="blue.100"
            alignItems="flex-start"
            mb={4}
          >
            <Box color="#206CE1" mt={0.5}>
              <FiHelpCircle size={14} />
            </Box>
            <Text fontSize="xs" color="blue.900" fontWeight="500">
              <strong>Why this matters:</strong> {recommendation.reason}
            </Text>
          </HStack>
        )}

        {/* Action Buttons */}
        <Flex
          gap={3}
          alignItems="center"
          flexDirection={{ base: "column", sm: "row" }}
        >
          <Button
            w={{ base: "full", sm: "auto" }}
            bg="#206CE1"
            color="white"
            _hover={{ bg: "blue.700", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            size="sm"
            px={5}
            borderRadius="lg"
            fontWeight="600"
            onClick={() => handleAction(recommendation)}
          >
            {recommendation.actionText || "Start Activity"}
            <FiArrowRight style={{ marginLeft: "6px" }} />
          </Button>

          {recommendation.topicName && (
            <Button
              w={{ base: "full", sm: "auto" }}
              variant="outline"
              colorPalette="gray"
              size="sm"
              borderRadius="lg"
              onClick={() => {
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
              Ask Spark about this topic
            </Button>
          )}
        </Flex>
      </Box>

      {/* Secondary recommendations toggle */}
      {secondaryRecommendations.length > 0 && (
        <Box pt={2}>
          <Button
            variant="ghost"
            size="xs"
            color="gray.600"
            _hover={{ color: "gray.900", bg: "transparent" }}
            onClick={() => setShowSecondary(!showSecondary)}
            p={0}
          >
            <HStack gap={1}>
              <Text fontWeight="600">
                {showSecondary
                  ? "Hide additional recommendations"
                  : `View ${secondaryRecommendations.length} more personalized recommendations`}
              </Text>
              {showSecondary ? <FiChevronUp /> : <FiChevronDown />}
            </HStack>
          </Button>

          {showSecondary && (
            <VStack gap={2} mt={3} align="stretch">
              {secondaryRecommendations.map((secRec) => {
                const secConfig = TYPE_CONFIG[secRec.type || "topic"] || TYPE_CONFIG.topic;
                const SecIcon = secConfig.icon;

                return (
                  <Flex
                    key={secRec.id}
                    p={3}
                    borderRadius="lg"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={3}
                  >
                    <HStack gap={3} flex={1}>
                      <Box
                        w={7}
                        h={7}
                        borderRadius="md"
                        bg={secConfig.bg}
                        color={secConfig.color}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="14px"
                        flexShrink={0}
                      >
                        <SecIcon />
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="600" color="gray.800">
                          {secRec.title}
                        </Text>
                        <Text fontSize="11px" color="gray.500" noOfLines={1}>
                          {secRec.description}
                        </Text>
                      </Box>
                    </HStack>

                    <Button
                      size="xs"
                      variant="outline"
                      colorPalette="blue"
                      borderRadius="md"
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
        </Box>
      )}
    </Box>
  );
};
