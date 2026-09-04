import { Box, Flex, Heading, Text, VStack, HStack, Icon, Badge } from "@chakra-ui/react";
import { FiCheckCircle, FiPlayCircle, FiClock, FiCalendar } from "react-icons/fi";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const RecentActivitySection = ({ intelligence }: Props) => {
  const { recentActivities, lastActiveDate, studyStreakDays } = intelligence;

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)">
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <HStack gap={2.5}>
          <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200">
            <Icon as={FiCalendar} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
              Recent Activity
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              A quick list of the latest quizzes taken and lessons watched.
            </Text>
          </Box>
        </HStack>

        <HStack gap={2}>
          {lastActiveDate && (
            <Badge colorPalette="gray" variant="surface" size="sm" borderRadius="full">
              <Icon as={FiClock} mr={1} /> Active: {lastActiveDate}
            </Badge>
          )}
          <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full">
            {studyStreakDays} Day Streak
          </Badge>
        </HStack>
      </Flex>

      {recentActivities.length === 0 ? (
        <Box p={6} textAlign="center" bg="gray.50" borderRadius="xl">
          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            No quizzes or video lessons recorded yet. Completed activities will show up here as your child studies.
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={3}>
          {recentActivities.map((act) => {
            const isQuiz = act.type === "quiz";
            const icon = isQuiz ? FiCheckCircle : FiPlayCircle;
            const iconColor = isQuiz ? "teal.600" : "purple.600";
            const iconBg = isQuiz ? "teal.50" : "purple.50";
            const iconBorder = isQuiz ? "teal.200" : "purple.200";

            return (
              <Box
                key={act.id}
                p={3.5}
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                bg="white"
                _hover={{ bg: "gray.50/80", borderColor: "blue.100" }}
                transition="all 0.15s"
              >
                <Flex justify="space-between" align="center" gap={3}>
                  <HStack gap={3}>
                    <Box bg={iconBg} p={2} borderRadius="lg" border="1px solid" borderColor={iconBorder}>
                      <Icon as={icon} color={iconColor} boxSize="16px" />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="gray.900">
                        {act.title}
                      </Text>
                      <Text fontSize="11px" color="gray.500" mt={0.5}>
                        {act.subtitle}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack gap={2.5}>
                    {act.score !== undefined && (
                      <Badge
                        colorPalette={act.score >= 75 ? "green" : act.score >= 50 ? "blue" : "orange"}
                        variant="solid"
                        size="sm"
                        borderRadius="md"
                      >
                        {act.score}%
                      </Badge>
                    )}
                    <Text fontSize="11px" color="gray.400" fontWeight="600" whiteSpace="nowrap">
                      {act.formattedDate}
                    </Text>
                  </HStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
