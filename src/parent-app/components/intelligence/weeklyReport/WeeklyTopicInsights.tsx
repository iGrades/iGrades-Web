import { Box, Flex, Heading, Text, VStack, Badge, Icon, Grid } from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiRepeat,
  FiTarget,
} from "react-icons/fi";
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
  return (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={3.5} wrap="wrap" gap={2}>
        <Box>
          <Heading size="sm" color="gray.900" fontWeight="800">
            Granular Topic Insights
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            Pinpointing specific concepts where your child is excelling and where practice will help most.
          </Text>
        </Box>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
        {/* 1. Topics Showing Improvement / Strong Mastery */}
        <Box
          bg="white"
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor="green.200"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Flex align="center" gap={2} mb={3}>
            <Box bg="green.50" p={1.5} borderRadius="lg">
              <Icon as={FiCheckCircle} color="green.600" boxSize="16px" />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="800" color="green.900" textTransform="uppercase" letterSpacing="0.04em">
                Strong & Improving Topics
              </Text>
              <Text fontSize="11px" color="gray.500">
                High accuracy demonstrated
              </Text>
            </Box>
          </Flex>

          {improvedTopics.length === 0 ? (
            <Box p={4} textAlign="center" bg="gray.50" borderRadius="lg">
              <Text fontSize="xs" color="gray.500">
                Complete more topic-specific quizzes to record mastery highlights.
              </Text>
            </Box>
          ) : (
            <VStack gap={2.5} align="stretch">
              {improvedTopics.map((topic) => (
                <Box
                  key={`imp-${topic.topicId}`}
                  p={3}
                  bg="green.50/50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="green.100"
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
                    {topic.subjectName} • {topic.correctQuestions}/{topic.totalQuestions} correct
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
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor="orange.200"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Flex align="center" gap={2} mb={3}>
            <Box bg="orange.50" p={1.5} borderRadius="lg">
              <Icon as={FiTarget} color="orange.600" boxSize="16px" />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="800" color="orange.900" textTransform="uppercase" letterSpacing="0.04em">
                Requires Practice
              </Text>
              <Text fontSize="11px" color="gray.500">
                Concepts needing another review
              </Text>
            </Box>
          </Flex>

          {topicsRequiringPractice.length === 0 ? (
            <Box p={4} textAlign="center" bg="gray.50" borderRadius="lg">
              <Text fontSize="xs" color="gray.500">
                No challenging topics identified in this practice cycle!
              </Text>
            </Box>
          ) : (
            <VStack gap={2.5} align="stretch">
              {topicsRequiringPractice.map((topic) => (
                <Box
                  key={`prac-${topic.topicId}`}
                  p={3}
                  bg="orange.50/50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="orange.100"
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
                    {topic.subjectName} • {topic.totalQuestions} questions attempted
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
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor="red.200"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Flex align="center" gap={2} mb={3}>
            <Box bg="red.50" p={1.5} borderRadius="lg">
              <Icon as={FiRepeat} color="red.600" boxSize="16px" />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="800" color="red.900" textTransform="uppercase" letterSpacing="0.04em">
                Repeated Mistakes
              </Text>
              <Text fontSize="11px" color="gray.500">
                Tricky question patterns
              </Text>
            </Box>
          </Flex>

          {topicsWithRepeatedMistakes.length === 0 ? (
            <Box p={4} textAlign="center" bg="gray.50" borderRadius="lg">
              <Text fontSize="xs" color="gray.500">
                No repeated error patterns detected this week. Great work!
              </Text>
            </Box>
          ) : (
            <VStack gap={2.5} align="stretch">
              {topicsWithRepeatedMistakes.map((topic) => (
                <Box
                  key={`mis-${topic.topicId}`}
                  p={3}
                  bg="red.50/50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="red.100"
                >
                  <Flex justify="space-between" align="start" mb={1}>
                    <Text fontSize="xs" fontWeight="800" color="gray.900">
                      {topic.topicName}
                    </Text>
                    <Badge colorPalette="red" variant="subtle" size="xs" borderRadius="full">
                      {topic.incorrectQuestions} Missed
                    </Badge>
                  </Flex>
                  <Text fontSize="11px" color="gray.600" mb={1}>
                    {topic.subjectName} • {topic.accuracy}% accuracy
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
