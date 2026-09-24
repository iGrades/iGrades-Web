import { Box, Flex, Heading, Text, VStack, Badge, Icon, Grid, HStack } from "@chakra-ui/react";
import {
  PiCheckCircleFill,
  PiNotebookFill,
  PiArrowCounterClockwiseBold,
  PiTargetFill,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import type { WeeklyTopicInsight } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  improvedTopics: WeeklyTopicInsight[];
  topicsRequiringPractice: WeeklyTopicInsight[];
  topicsWithRepeatedMistakes: WeeklyTopicInsight[];
};

export const WeeklyTopicInsights = ({
  improvedTopics,
  topicsRequiringPractice,
  topicsWithRepeatedMistakes,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={3.5} wrap="wrap" gap={2}>
        <HStack gap={2.5}>
          <Box bg="purple.50" p={2} borderRadius="xl" border="1px solid" borderColor="purple.200" boxShadow="0 2px 6px rgba(147, 51, 234, 0.12)">
            <Icon as={PiTargetFill} color="purple.600" boxSize="18px" />
          </Box>
          <Box>
            <Heading size="sm" color="gray.900" fontWeight="800">
              {t("Granular Topic Insights")}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Pinpointing specific concepts where your child is excelling and where practice will help most.")}
            </Text>
          </Box>
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }} gap={4.5}>
        {/* 1. Topics Showing Improvement / Strong Mastery */}
        <Box
          bg="white"
          p={5}
          borderRadius="2xl"
          border="none"
          boxShadow="0 6px 24px -3px rgba(15, 23, 42, 0.07), 0 2px 8px -2px rgba(15, 23, 42, 0.04)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 12px 30px -4px rgba(16, 185, 129, 0.15)" }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Flex align="center" gap={2.5} mb={3.5}>
            <Box bg="green.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(16, 185, 129, 0.15)">
              <Icon as={PiCheckCircleFill} color="green.600" boxSize="18px" />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="800" color="green.900" textTransform="uppercase" letterSpacing="0.04em">
                {t("Strong & Improving Topics")}
              </Text>
              <Text fontSize="11px" color="gray.500">
                {t("High accuracy demonstrated")}
              </Text>
            </Box>
          </Flex>

          {improvedTopics.length === 0 ? (
            <Box p={4} textAlign="center" bg="gray.50" borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.03)">
              <Text fontSize="xs" color="gray.500">
                {t("Complete more topic-specific quizzes to record mastery highlights.")}
              </Text>
            </Box>
          ) : (
            <VStack gap={2.5} align="stretch">
              {improvedTopics.map((topic) => (
                <Box
                  key={`imp-${topic.topicId}`}
                  p={3.5}
                  bg="green.50/70"
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(16, 185, 129, 0.12)"
                >
                  <Flex justify="space-between" align="start" mb={1}>
                    <Text fontSize="xs" fontWeight="800" color="gray.900">
                      {topic.topicName}
                    </Text>
                    <Badge colorPalette="green" variant="solid" size="xs" borderRadius="full">
                      {topic.accuracy}%
                    </Badge>
                  </Flex>
                  <Text fontSize="11px" color="gray.600" mb={1}>
                    {topic.subjectName} • {topic.correctQuestions}/{topic.totalQuestions} {t("correct")}
                  </Text>
                  <Text fontSize="10px" color="green.800" fontWeight="500">
                    {topic.reason}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* 2. Topics Requiring Additional Practice */}
        <Box
          bg="white"
          p={5}
          borderRadius="2xl"
          border="none"
          boxShadow="0 6px 24px -3px rgba(15, 23, 42, 0.07), 0 2px 8px -2px rgba(15, 23, 42, 0.04)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 12px 30px -4px rgba(245, 158, 11, 0.15)" }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Flex align="center" gap={2.5} mb={3.5}>
            <Box bg="orange.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(245, 158, 11, 0.15)">
              <Icon as={PiNotebookFill} color="orange.600" boxSize="18px" />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="800" color="orange.900" textTransform="uppercase" letterSpacing="0.04em">
                {t("Requires Practice")}
              </Text>
              <Text fontSize="11px" color="gray.500">
                {t("Concepts needing another review")}
              </Text>
            </Box>
          </Flex>

          {topicsRequiringPractice.length === 0 ? (
            <Box p={4} textAlign="center" bg="gray.50" borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.03)">
              <Text fontSize="xs" color="gray.500">
                {t("No challenging topics identified in this practice cycle!")}
              </Text>
            </Box>
          ) : (
            <VStack gap={2.5} align="stretch">
              {topicsRequiringPractice.map((topic) => (
                <Box
                  key={`prac-${topic.topicId}`}
                  p={3.5}
                  bg="orange.50/70"
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(245, 158, 11, 0.12)"
                >
                  <Flex justify="space-between" align="start" mb={1}>
                    <Text fontSize="xs" fontWeight="800" color="gray.900">
                      {topic.topicName}
                    </Text>
                    <Badge colorPalette="orange" variant="subtle" size="xs" borderRadius="full">
                      {topic.accuracy}%
                    </Badge>
                  </Flex>
                  <Text fontSize="11px" color="gray.600" mb={1}>
                    {topic.subjectName} • {topic.totalQuestions} {t("questions attempted")}
                  </Text>
                  <Text fontSize="10px" color="orange.800" fontWeight="500">
                    {topic.reason}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* 3. Topics with Repeated Mistakes */}
        <Box
          bg="white"
          p={5}
          borderRadius="2xl"
          border="none"
          boxShadow="0 6px 24px -3px rgba(15, 23, 42, 0.07), 0 2px 8px -2px rgba(15, 23, 42, 0.04)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 12px 30px -4px rgba(239, 68, 68, 0.15)" }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Flex align="center" gap={2.5} mb={3.5}>
            <Box bg="red.50" p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(239, 68, 68, 0.15)">
              <Icon as={PiArrowCounterClockwiseBold} color="red.600" boxSize="16px" />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="800" color="red.900" textTransform="uppercase" letterSpacing="0.04em">
                {t("Repeated Mistakes")}
              </Text>
              <Text fontSize="11px" color="gray.500">
                {t("Tricky question patterns")}
              </Text>
            </Box>
          </Flex>

          {topicsWithRepeatedMistakes.length === 0 ? (
            <Box p={4} textAlign="center" bg="gray.50" borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.03)">
              <Text fontSize="xs" color="gray.500">
                {t("No repeated error patterns detected this week. Great work!")}
              </Text>
            </Box>
          ) : (
            <VStack gap={2.5} align="stretch">
              {topicsWithRepeatedMistakes.map((topic) => (
                <Box
                  key={`mis-${topic.topicId}`}
                  p={3.5}
                  bg="red.50/70"
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(239, 68, 68, 0.12)"
                >
                  <Flex justify="space-between" align="start" mb={1}>
                    <Text fontSize="xs" fontWeight="800" color="gray.900">
                      {topic.topicName}
                    </Text>
                    <Badge colorPalette="red" variant="subtle" size="xs" borderRadius="full">
                      {topic.incorrectQuestions} {t("Missed")}
                    </Badge>
                  </Flex>
                  <Text fontSize="11px" color="gray.600" mb={1}>
                    {topic.subjectName} • {topic.accuracy}% {t("accuracy")}
                  </Text>
                  <Text fontSize="10px" color="red.800" fontWeight="500">
                    {topic.reason}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Grid>
    </Box>
  );
};
