import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import AvatarComp from "@/components/avatar";
import QuizHistoryList from "@/parent-app/components/grader/quizHistoryList";
import { WeeklyLearningReportView } from "@/parent-app/components/intelligence/weeklyReport/WeeklyLearningReportView";
import { GiNotebook } from "react-icons/gi";
import { LuFileText, LuTrendingUp, LuUsers } from "react-icons/lu";

export const ParentQuizReportView = () => {
  const { studentsData, loading } = useStudentsData();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<"history" | "weekly">("history");

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="280px" w="full">
        <DancingLogoLoader size="md" text="Loading academic quiz reports..." minH="240px" />
      </Flex>
    );
  }

  if (!studentsData || studentsData.length === 0) {
    return (
      <Box
        p={{ base: 6, md: 10 }}
        textAlign="center"
        bg="gray.50"
        borderRadius="2xl"
        border="1px dashed"
        borderColor="gray.300"
        maxW="2xl"
        mx="auto"
        my={6}
      >
        <Flex
          w="56px"
          h="56px"
          mx="auto"
          mb={4}
          borderRadius="full"
          bg="blue.50"
          align="center"
          justify="center"
        >
          <Icon as={GiNotebook} boxSize="28px" color="primaryColor" />
        </Flex>
        <Heading size="md" color="gray.800" mb={2}>
          No Child Profiles Found
        </Heading>
        <Text fontSize="sm" color="gray.500" maxW="md" mx="auto">
          Add your child under the &quot;Children&quot; section in Settings to start tracking their quiz results, academic progress trends, and diagnostic intelligence.
        </Text>
      </Box>
    );
  }

  // Active student selection fallback to first child
  const activeStudent =
    studentsData.find((s) => s.id === selectedStudentId) || studentsData[0];

  return (
    <Box w="full" maxW="7xl" mx="auto" pb={8}>
      {/* Top Banner / Child Selection */}
      <Box
        p={{ base: 4, md: 6 }}
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="xs"
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap={4}
        >
          <HStack gap={3}>
            <Box
              p={3}
              bg="cyan.50"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={GiNotebook} boxSize="24px" color="#00A8E6" />
            </Box>
            <Box>
              <HStack gap={2}>
                <Heading size="md" color="gray.900">
                  Student Quiz Reports
                </Heading>
                <Badge colorPalette="blue" variant="subtle" size="sm">
                  Academic Intelligence
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                Review comprehensive quiz history, strengths, weaknesses, and weekly performance digests.
              </Text>
            </Box>
          </HStack>

          {/* Report View Toggle */}
          <HStack
            bg="gray.100"
            p={1}
            borderRadius="xl"
            w={{ base: "full", sm: "auto" }}
          >
            <Button
              size="xs"
              variant={reportType === "history" ? "solid" : "ghost"}
              colorPalette={reportType === "history" ? "blue" : undefined}
              onClick={() => setReportType("history")}
              borderRadius="lg"
              flex={{ base: 1, sm: "initial" }}
              px={3}
              py={1.5}
            >
              <LuTrendingUp style={{ marginRight: "6px" }} />
              Quiz History & Trends
            </Button>
            <Button
              size="xs"
              variant={reportType === "weekly" ? "solid" : "ghost"}
              colorPalette={reportType === "weekly" ? "blue" : undefined}
              onClick={() => setReportType("weekly")}
              borderRadius="lg"
              flex={{ base: 1, sm: "initial" }}
              px={3}
              py={1.5}
            >
              <LuFileText style={{ marginRight: "6px" }} />
              Weekly Report Digest
            </Button>
          </HStack>
        </Flex>

        {/* Child Selector Tabs (if multiple children or for quick child info) */}
        {studentsData.length > 1 && (
          <Box mt={5} pt={4} borderTop="1px solid" borderColor="gray.100">
            <HStack gap={2} mb={2}>
              <Icon as={LuUsers} color="gray.500" boxSize="14px" />
              <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                Select Child:
              </Text>
            </HStack>
            <Flex gap={2.5} wrap="wrap">
              {studentsData.map((student) => {
                const isSelected = activeStudent.id === student.id;
                const studentName = `${student.firstname} ${student.lastname}`;
                return (
                  <Flex
                    key={student.id}
                    align="center"
                    gap={2.5}
                    px={3.5}
                    py={2}
                    borderRadius="xl"
                    cursor="pointer"
                    transition="all 0.2s"
                    bg={isSelected ? "blue.50" : "gray.50"}
                    border="1.5px solid"
                    borderColor={isSelected ? "primaryColor" : "gray.200"}
                    _hover={{ borderColor: "primaryColor" }}
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <AvatarComp
                      username={studentName}
                      profileImage={student.profile_image}
                    />
                    <Box textAlign="left">
                      <Text
                        fontSize="xs"
                        fontWeight={isSelected ? "bold" : "medium"}
                        color={isSelected ? "primaryColor" : "gray.800"}
                      >
                        {student.firstname} {student.lastname}
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        {student.class || student.school || "Student"}
                      </Text>
                    </Box>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
        )}
      </Box>

      {/* Selected Child Info Badge */}
      <Flex
        justify="space-between"
        align="center"
        mb={5}
        px={1}
        wrap="wrap"
        gap={2}
      >
        <HStack gap={2.5}>
          <AvatarComp
            username={`${activeStudent.firstname} ${activeStudent.lastname}`}
            profileImage={activeStudent.profile_image}
          />
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="gray.900">
              {activeStudent.firstname}&apos;s Academic & Quiz Report
            </Text>
            <Text fontSize="xs" color="gray.500">
              {activeStudent.school ? `${activeStudent.school} • ` : ""}
              {activeStudent.class || "Student"}
            </Text>
          </Box>
        </HStack>
      </Flex>

      {/* Report Content View */}
      {reportType === "history" ? (
        <VStack align="stretch" gap={6} w="full">
          <QuizHistoryList
            studentId={activeStudent.id}
            student={activeStudent}
          />
        </VStack>
      ) : (
        <WeeklyLearningReportView student={activeStudent} />
      )}
    </Box>
  );
};
