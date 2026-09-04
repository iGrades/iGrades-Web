import { Box, Grid, GridItem, Flex, Heading, Text, VStack, HStack, Icon, Badge, Progress } from "@chakra-ui/react";
import { FiAward, FiTarget, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const StrengthsAndWeaknessesSection = ({ intelligence }: Props) => {
  const { strengths, areasForAttention } = intelligence;

  return (
    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={5} mb={6}>
      {/* 1. STRENGTHS */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 4, md: 6 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={3}>
            <HStack gap={2.5}>
              <Box bg="green.50" p={2} borderRadius="xl" border="1px solid" borderColor="green.200">
                <Icon as={FiAward} color="green.600" boxSize="18px" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                  Student Strengths
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Topics and subjects where your child is doing exceptionally well.
                </Text>
              </Box>
            </HStack>
            <Badge colorPalette="green" variant="subtle" size="sm" borderRadius="md" px={2}>
              Doing Great
            </Badge>
          </Flex>

          {/* Highlight Banner */}
          <Box bg="green.50/60" p={3.5} borderRadius="xl" border="1px solid" borderColor="green.200/80" mb={4}>
            <Text fontSize="xs" fontWeight="700" color="green.900">
              {strengths.highlight}
            </Text>
            <Text fontSize="xs" color="green.800" mt={1} lineHeight="tall">
              {strengths.description}
            </Text>
          </Box>

          {/* Detailed Topic & Subject Strengths */}
          <VStack align="stretch" gap={3} flex="1">
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              Top Mastered Topics & Subjects
            </Text>

            {strengths.topTopics.length > 0 ? (
              strengths.topTopics.slice(0, 4).map((topic) => (
                <Box
                  key={topic.topicId}
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  bg="gray.50/60"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={FiCheckCircle} color="green.600" boxSize="14px" />
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {topic.topicName}
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        ({topic.subjectName})
                      </Text>
                    </HStack>
                    <Badge colorPalette="green" variant="solid" size="xs" borderRadius="md">
                      {topic.accuracy}%
                    </Badge>
                  </Flex>
                  <Progress.Root value={topic.accuracy} size="xs" colorPalette="green">
                    <Progress.Track bg="gray.200" borderRadius="full">
                      <Progress.Range bg="#10B981" borderRadius="full" />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))
            ) : strengths.topSubjects.length > 0 ? (
              strengths.topSubjects.map((sub) => (
                <Box
                  key={sub.subjectId}
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  bg="gray.50/60"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={FiCheckCircle} color="green.600" boxSize="14px" />
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {sub.subjectName}
                      </Text>
                    </HStack>
                    <Badge colorPalette="green" variant="solid" size="xs" borderRadius="md">
                      {sub.accuracy}%
                    </Badge>
                  </Flex>
                  <Progress.Root value={sub.accuracy} size="xs" colorPalette="green">
                    <Progress.Track bg="gray.200" borderRadius="full">
                      <Progress.Range bg="#10B981" borderRadius="full" />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))
            ) : (
              <Box p={4} textAlign="center" bg="gray.50" borderRadius="xl">
                <Text fontSize="xs" color="gray.500" fontStyle="italic">
                  Taking more practice quizzes will highlight your child's top topics here.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </GridItem>

      {/* 2. AREAS REQUIRING ATTENTION */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 4, md: 6 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={3}>
            <HStack gap={2.5}>
              <Box bg="orange.50" p={2} borderRadius="xl" border="1px solid" borderColor="orange.200">
                <Icon as={FiTarget} color="orange.600" boxSize="18px" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                  Areas to Practice
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Specific topics where a little more practice can boost your child's grades.
                </Text>
              </Box>
            </HStack>
            <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="md" px={2}>
              Extra Focus
            </Badge>
          </Flex>

          {/* Highlight Banner */}
          <Box bg="orange.50/60" p={3.5} borderRadius="xl" border="1px solid" borderColor="orange.200/80" mb={4}>
            <Text fontSize="xs" fontWeight="700" color="orange.900">
              {areasForAttention.highlight}
            </Text>
            <Text fontSize="xs" color="orange.800" mt={1} lineHeight="tall">
              {areasForAttention.description}
            </Text>
          </Box>

          {/* Detailed Struggling Topics & Subjects */}
          <VStack align="stretch" gap={3} flex="1">
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              Topics to Practice Next
            </Text>

            {areasForAttention.strugglingTopics.length > 0 ? (
              areasForAttention.strugglingTopics.slice(0, 4).map((topic) => (
                <Box
                  key={topic.topicId}
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="orange.200"
                  bg="orange.50/30"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={FiAlertTriangle} color="orange.500" boxSize="14px" />
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {topic.topicName}
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        ({topic.subjectName})
                      </Text>
                    </HStack>
                    <Badge colorPalette="orange" variant="surface" size="xs" borderRadius="md">
                      {topic.accuracy}% score
                    </Badge>
                  </Flex>
                  <Progress.Root value={topic.accuracy} size="xs" colorPalette="orange">
                    <Progress.Track bg="gray.200" borderRadius="full">
                      <Progress.Range bg="#F59E0B" borderRadius="full" />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))
            ) : areasForAttention.strugglingSubjects.length > 0 ? (
              areasForAttention.strugglingSubjects.map((sub) => (
                <Box
                  key={sub.subjectId}
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="orange.200"
                  bg="orange.50/30"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={FiAlertTriangle} color="orange.500" boxSize="14px" />
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {sub.subjectName}
                      </Text>
                    </HStack>
                    <Badge colorPalette="orange" variant="surface" size="xs" borderRadius="md">
                      {sub.accuracy}% score
                    </Badge>
                  </Flex>
                  <Progress.Root value={sub.accuracy} size="xs" colorPalette="orange">
                    <Progress.Track bg="gray.200" borderRadius="full">
                      <Progress.Range bg="#F59E0B" borderRadius="full" />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))
            ) : (
              <Box p={4} textAlign="center" bg="gray.50" borderRadius="xl">
                <Text fontSize="xs" color="gray.500" fontStyle="italic">
                  No major weak spots found. Your child is performing well across all topics practiced so far!
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};
