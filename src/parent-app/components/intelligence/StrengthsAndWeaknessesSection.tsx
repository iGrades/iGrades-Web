import { Box, Grid, GridItem, Flex, Heading, Text, VStack, HStack, Icon, Badge, Progress } from "@chakra-ui/react";
import {
  PiTrophyFill,
  PiNotebookFill,
  PiCheckCircleFill,
  PiWarningCircleFill,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const StrengthsAndWeaknessesSection = ({ intelligence }: Props) => {
  const { t } = useTranslation();
  const { strengths, areasForAttention } = intelligence;

  return (
    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={5} mb={6}>
      {/* 1. STRENGTHS */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="2xl"
          border="none"
          boxShadow="0 10px 30px -5px rgba(16, 185, 129, 0.12), 0 4px 14px -2px rgba(15, 23, 42, 0.04)"
          _hover={{
            transform: "translateY(-3px)",
            boxShadow: "0 16px 36px -4px rgba(16, 185, 129, 0.20), 0 6px 16px -2px rgba(15, 23, 42, 0.05)",
          }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={3.5}>
            <HStack gap={2.5}>
              <Box bg="green.50" p={2.5} borderRadius="xl" border="none" boxShadow="0 2px 8px rgba(16, 185, 129, 0.18)">
                <Icon as={PiTrophyFill} color="green.600" boxSize="18px" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                  {t("Student Strengths")}
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  {t("Topics and subjects where your child is doing exceptionally well.")}
                </Text>
              </Box>
            </HStack>
            <Badge colorPalette="green" variant="subtle" size="sm" borderRadius="full" px={2.5} py={0.5}>
              {t("Doing Great")}
            </Badge>
          </Flex>

          {/* Highlight Banner */}
          <Box bg="green.50/70" p={4} borderRadius="xl" border="none" boxShadow="0 2px 10px rgba(16, 185, 129, 0.12)" mb={4}>
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
              {t("Top Mastered Topics & Subjects")}
            </Text>

            {strengths.topTopics.length > 0 ? (
              strengths.topTopics.slice(0, 4).map((topic) => (
                <Box
                  key={topic.topicId}
                  p={3.5}
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(16, 185, 129, 0.08)"
                  bg="gray.50/80"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.14)" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={PiCheckCircleFill} color="green.600" boxSize="15px" />
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
                  p={3.5}
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(16, 185, 129, 0.08)"
                  bg="gray.50/80"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.14)" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={PiCheckCircleFill} color="green.600" boxSize="15px" />
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
                  {t("Taking more practice quizzes will highlight your child's top topics here.")}
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
          p={{ base: 5, md: 6 }}
          borderRadius="2xl"
          border="none"
          boxShadow="0 10px 30px -5px rgba(245, 158, 11, 0.16), 0 4px 14px -2px rgba(15, 23, 42, 0.05)"
          _hover={{
            transform: "translateY(-3px)",
            boxShadow: "0 16px 36px -4px rgba(245, 158, 11, 0.24), 0 6px 16px -2px rgba(15, 23, 42, 0.06)",
          }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          h="full"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={3.5}>
            <HStack gap={2.5}>
              <Box bg="orange.50" p={2.5} borderRadius="xl" border="none" boxShadow="0 2px 8px rgba(245, 158, 11, 0.2)">
                <Icon as={PiNotebookFill} color="orange.600" boxSize="18px" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
                  {t("Areas to Practice")}
                </Heading>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  {t("Specific topics where a little more practice can boost your child's grades.")}
                </Text>
              </Box>
            </HStack>
            <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full" px={2.5} py={0.5}>
              {t("Extra Focus")}
            </Badge>
          </Flex>

          {/* Highlight Banner */}
          <Box bg="orange.50/70" p={4} borderRadius="xl" border="none" boxShadow="0 2px 10px rgba(245, 158, 11, 0.14)" mb={4}>
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
              {t("Topics to Practice Next")}
            </Text>

            {areasForAttention.strugglingTopics.length > 0 ? (
              areasForAttention.strugglingTopics.slice(0, 4).map((topic) => (
                <Box
                  key={topic.topicId}
                  p={3.5}
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(245, 158, 11, 0.10)"
                  bg="orange.50/40"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.18)" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={PiWarningCircleFill} color="orange.500" boxSize="15px" />
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {topic.topicName}
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        ({topic.subjectName})
                      </Text>
                    </HStack>
                    <Badge colorPalette="orange" variant="surface" size="xs" borderRadius="md">
                      {topic.accuracy}% {t("score")}
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
                  p={3.5}
                  borderRadius="xl"
                  border="none"
                  boxShadow="0 2px 8px rgba(245, 158, 11, 0.10)"
                  bg="orange.50/40"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.18)" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <HStack gap={2}>
                      <Icon as={PiWarningCircleFill} color="orange.500" boxSize="15px" />
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {sub.subjectName}
                      </Text>
                    </HStack>
                    <Badge colorPalette="orange" variant="surface" size="xs" borderRadius="md">
                      {sub.accuracy}% {t("score")}
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
                  {t("No major weak spots found. Your child is performing well across all topics practiced so far!")}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
};
