import { useMemo } from "react";
import { Box, Flex, Heading, Text, VStack, HStack, Badge, Progress, Icon, Table } from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiBook, FiClock } from "react-icons/fi";
import type { SubjectIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { filterRegisteredSubjects } from "@/utils/subjectMatching";

type Props = {
  subjects: SubjectIntelligence[];
  onSelectSubject?: (subjectId: string) => void;
  registeredCourses?: string[] | string | null;
};

export const SubjectPerformanceSection = ({ subjects, onSelectSubject, registeredCourses }: Props) => {
  const displayedSubjects = useMemo(() => {
    if (registeredCourses !== undefined && registeredCourses !== null) {
      return filterRegisteredSubjects(subjects, registeredCourses);
    }
    return subjects;
  }, [subjects, registeredCourses]);
  const getStatusBadge = (status: SubjectIntelligence["status"]) => {
    switch (status) {
      case "strong":
        return <Badge colorPalette="green" variant="solid" size="sm" borderRadius="full">Strong</Badge>;
      case "good":
        return <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">On Track</Badge>;
      case "fair":
        return <Badge colorPalette="yellow" variant="subtle" size="sm" borderRadius="full">Fair</Badge>;
      case "needs_attention":
        return <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full">Needs Practice</Badge>;
      default:
        return <Badge colorPalette="gray" variant="surface" size="sm" borderRadius="full">Not Started</Badge>;
    }
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 75) return "#10B981"; // green
    if (accuracy >= 60) return "#206CE1"; // brand blue
    if (accuracy >= 45) return "#F59E0B"; // amber
    return "#EF4444"; // red
  };

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)" mb={6}>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <HStack gap={2.5}>
          <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200">
            <Icon as={FiBook} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
              Subject Performance
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              See your child's average quiz scores, progress, and activity in each subject.
            </Text>
          </Box>
        </HStack>
        <Badge colorPalette="gray" variant="surface" size="sm" borderRadius="full">
          {displayedSubjects.length} Registered Subject{displayedSubjects.length === 1 ? "" : "s"}
        </Badge>
      </Flex>

      {displayedSubjects.length === 0 ? (
        <Box p={6} textAlign="center" bg="gray.50" borderRadius="xl">
          <Text fontSize="xs" color="gray.500">
            No subjects registered yet. Add subjects to view detailed scores and progress.
          </Text>
        </Box>
      ) : (
        <Table.ScrollArea border="1px solid" borderColor="gray.100" borderRadius="xl">
          <Table.Root size={{ base: "sm", md: "md" }} stickyHeader>
            <Table.Header>
              <Table.Row bg="gray.50">
                <Table.ColumnHeader fontSize="xs" fontWeight="700" color="gray.600">
                  Subject
                </Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight="700" color="gray.600" textAlign="center">
                  Average Score
                </Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight="700" color="gray.600" textAlign="center">
                  Score Trend
                </Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight="700" color="gray.600" textAlign="center">
                  Questions Solved
                </Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight="700" color="gray.600" textAlign="center">
                  Performance
                </Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight="700" color="gray.600" textAlign="right">
                  Last Active
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {displayedSubjects.map((sub) => {
                const trendIcon = sub.trend === "up" ? FiTrendingUp : sub.trend === "down" ? FiTrendingDown : FiMinus;
                const trendColor = sub.trend === "up" ? "green.600" : sub.trend === "down" ? "red.600" : "gray.600";
                const trendText =
                  sub.trend === "up"
                    ? `↑ +${sub.trendDiff}%`
                    : sub.trend === "down"
                    ? `↓ ${sub.trendDiff}%`
                    : sub.trend === "stable"
                    ? "→ Stable"
                    : "— New";

                return (
                  <Table.Row
                    key={sub.subjectId}
                    _hover={{ bg: "blue.50/20", cursor: onSelectSubject ? "pointer" : "default" }}
                    onClick={() => onSelectSubject?.(sub.subjectId)}
                  >
                    {/* Subject Name & Grade */}
                    <Table.Cell py={3.5}>
                      <VStack align="start" gap={0.5}>
                        <Text fontSize="xs" fontWeight="700" color="gray.900" textTransform="capitalize">
                          {sub.subjectName}
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          {sub.sessionsCount} test{sub.sessionsCount === 1 ? "" : "s"} taken
                        </Text>
                      </VStack>
                    </Table.Cell>

                    {/* Current Accuracy & Progress Bar */}
                    <Table.Cell py={3.5} minW="140px">
                      {sub.sessionsCount > 0 ? (
                        <Box>
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="xs" fontWeight="800" color="gray.900">
                              {sub.accuracy}%
                            </Text>
                            <Badge
                              colorPalette={
                                sub.accuracy >= 80
                                  ? "green"
                                  : sub.accuracy >= 70
                                  ? "blue"
                                  : sub.accuracy >= 55
                                  ? "yellow"
                                  : sub.accuracy >= 40
                                  ? "orange"
                                  : "red"
                              }
                              size="xs"
                              variant="solid"
                              borderRadius="md"
                            >
                              Grade {sub.grade}
                            </Badge>
                          </Flex>
                          <Progress.Root value={sub.accuracy} size="xs" colorPalette="blue">
                            <Progress.Track bg="gray.100" borderRadius="full">
                              <Progress.Range bg={getProgressColor(sub.accuracy)} borderRadius="full" />
                            </Progress.Track>
                          </Progress.Root>
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.400" textAlign="center" fontStyle="italic">
                          No tests yet
                        </Text>
                      )}
                    </Table.Cell>

                    {/* Recent Trend */}
                    <Table.Cell py={3.5} textAlign="center">
                      <HStack justify="center" gap={1} color={trendColor} fontSize="xs" fontWeight="700">
                        <Icon as={trendIcon} />
                        <Text>{trendText}</Text>
                      </HStack>
                    </Table.Cell>

                    {/* Questions Attempted */}
                    <Table.Cell py={3.5} textAlign="center">
                      <Text fontSize="xs" fontWeight="600" color="gray.800">
                        {sub.questionsAttempted} Qs
                      </Text>
                    </Table.Cell>

                    {/* Performance */}
                    <Table.Cell py={3.5} textAlign="center">
                      {getStatusBadge(sub.status)}
                    </Table.Cell>

                    {/* Last Activity */}
                    <Table.Cell py={3.5} textAlign="right">
                      {sub.lastActivity ? (
                        <HStack justify="end" gap={1} color="gray.600" fontSize="xs">
                          <Icon as={FiClock} boxSize="12px" color="gray.400" />
                          <Text>{sub.lastActivity}</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="xs" color="gray.400" fontStyle="italic">
                          Not started
                        </Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}
    </Box>
  );
};
