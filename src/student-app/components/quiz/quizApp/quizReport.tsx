import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Grid,
  GridItem,
  Progress,
  Icon,
  Button,
  List,
  Circle,
  Flex,
  Avatar,
  Separator,
  Image,
  Badge
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";
import logo from "@/assets/logo.png"; 
import { LuBookOpen } from "react-icons/lu";
import type { QuizResults, QuizAttemptProps } from "./types";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";

interface QuizReportPageProps {
  quizResults: QuizResults;
  quizData: QuizAttemptProps["quizData"];
  isDownloading: boolean;
  onDownload: () => Promise<void>;
  onClose: () => void;
}

export const QuizReportPage = ({
  quizResults,
  quizData,
  onClose,
  onDownload,
  isDownloading,
}: QuizReportPageProps) => {
  const { authdStudent } = useAuthdStudentData();
  // Logic to identify strengths and weaknesses
  const subjectBreakdown = Object.entries(quizResults.subjectResults).map(
    ([id, result]) => {
      const subject = quizData.subjects.find((s) => s.id === id);
      return {
        name: subject?.displayName || "Unknown",
        ...result,
      };
    },
  );

  const weakSubjects = subjectBreakdown.filter((s) => s.percentage < 50);
  const strongSubjects = subjectBreakdown.filter((s) => s.percentage >= 75);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="gray.50"
      zIndex={2000}
      overflowY="auto"
      p={{ base: 4, md: 10 }}
    >
      {/* Action Header (Not in PDF) */}
      <Flex p={4} maxW="1000px" m="auto" justify="space-between" align="center">
        <Button variant="ghost" onClick={onClose}>
          {" "}
          <FaArrowLeft /> Back
        </Button>
        {/*<Button
          bg="primaryColor"
          color="white"
          onClick={onDownload}
          size="sm"
          rounded="full"
        >
          Download PDF Report
        </Button>*/}
      </Flex>
      
      {/* Printable area */}
      <Box id="printable-report-area" m='auto' bg="white" p={10} position="relative">
        <VStack m="auto" maxW="1000px" align="stretch" gap={8} pb={20}>
          {/* student info header */}
          <Flex justify="space-between" align="flex-start" mb={10}>
            <VStack align="end" gap={0}>
              <Image src={logo} h="40px" alt="Company Logo" mb={2} />
              <Badge colorPalette="blue" variant="solid">
                Term Quiz Report
              </Badge>
              <Text fontSize="xs" mt={2} color="gray.500">
                Issued: {new Date().toLocaleDateString()}
              </Text>
            </VStack>
            
            <HStack gap={5}>
              <Avatar.Root size="2xl" shape="rounded">
                <Avatar.Image src={authdStudent?.profile_image} />
                <Avatar.Fallback name={authdStudent?.firstname} />
              </Avatar.Root>
              <VStack align="start" gap={0}>
                <Heading size="xl" color="gray.800">
                  {authdStudent?.firstname} {authdStudent?.lastname}
                </Heading>
                <Text fontWeight="bold" color="primaryColor">
                  {authdStudent?.class} Student
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Student ID: {authdStudent?.id?.slice(0, 8).toUpperCase()}
                </Text>
              </VStack>
            </HStack>

          
          </Flex>
          
          <Separator mb={8} />
          
          {/* Navigation & Header */}
          <HStack justify="space-between">
            <HStack color="primaryColor">
              <Icon as={FaChartLine} />
              <Text fontWeight="bold">Personalized Learning Report</Text>
            </HStack>
          </HStack>

          <Box bg="white" p={8} borderRadius="2xl" shadow="sm">
            <VStack align="start" gap={1}>
              <Heading size="lg">Quiz Analysis</Heading>
              <Text color="gray.500">
                Based on your attempt on{" "}
                {new Date(quizResults.timestamp).toLocaleDateString()}
              </Text>
            </VStack>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={6}
              mt={10}
            >
              {/* Score Card */}
              <GridItem bg="blue.50" p={6} borderRadius="xl">
                <VStack align="start">
                  <Text fontSize="sm" color="blue.600" fontWeight="bold">
                    Overall Accuracy
                  </Text>
                  <Heading size="2xl">{quizResults.overallGrade}</Heading>
                  <Text fontSize="xs">
                    Based on {quizResults.overallGradeLabel} performance
                  </Text>
                </VStack>
              </GridItem>

              {/* Time Card (Placeholder - adjust based on your actual time tracking) */}
              <GridItem bg="purple.50" p={6} borderRadius="xl">
                <VStack align="start">
                  <Text fontSize="sm" color="purple.600" fontWeight="bold">
                    Time Efficiency
                  </Text>
                  <HStack align="baseline">
                    <Heading size="xl">18</Heading>
                    <Text fontWeight="bold">mins</Text>
                  </HStack>
                  <Text fontSize="xs">Average of 45s per question</Text>
                </VStack>
              </GridItem>

              {/* Subject Count */}
              <GridItem bg="green.50" p={6} borderRadius="xl">
                <VStack align="start">
                  <Text fontSize="sm" color="green.600" fontWeight="bold">
                    Curriculum Coverage
                  </Text>
                  <Heading size="xl">{subjectBreakdown.length}</Heading>
                  <Text fontSize="xs">Subjects evaluated in this session</Text>
                </VStack>
              </GridItem>
            </Grid>
          </Box>

          {/* Diagnostic Breakdown */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1.2fr" }} gap={8}>
            {/* Detailed Subject Mastery */}
            <GridItem bg="white" p={8} borderRadius="2xl" shadow="sm">
              <Heading size="md" mb={6}>
                Subject Mastery
              </Heading>
              <VStack gap={6} align="stretch">
                {subjectBreakdown.map((subject, idx) => (
                  <Box key={idx}>
                    <Flex justify="space-between" mb={2}>
                      <Text fontWeight="bold" fontSize="sm">
                        {subject.name}
                      </Text>
                      <Text
                        fontWeight="bold"
                        fontSize="sm"
                        color={
                          subject.percentage > 50 ? "green.500" : "red.500"
                        }
                      >
                        {subject.percentage}%
                      </Text>
                    </Flex>
                    <Progress.Root
                      value={subject.percentage}
                      colorPalette={
                        subject.percentage > 70
                          ? "green"
                          : subject.percentage > 40
                            ? "yellow"
                            : "red"
                      }
                      size="sm"
                      rounded="full"
                    >
                      {" "}
                      <Progress.Track>
                        {" "}
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                ))}
              </VStack>
            </GridItem>

            {/* Insights & Recommendations */}
            <GridItem display="flex" flexDirection="column" gap={6}>
              {/* Strengths */}
              <Box
                bg="green.600"
                color="white"
                p={6}
                borderRadius="2xl"
                shadow="lg"
              >
                <HStack mb={4}>
                  <Icon as={FaCheckCircle} />
                  <Heading size="sm">Strongest Areas</Heading>
                </HStack>
                <List.Root gap={2}>
                  {strongSubjects.length > 0 ? (
                    strongSubjects.map((s, i) => (
                      <Text key={i} fontSize="sm">
                        Excellent work in **{s.name}**!
                      </Text>
                    ))
                  ) : (
                    <Text fontSize="sm">
                      Keep practicing to build core strengths.
                    </Text>
                  )}
                </List.Root>
              </Box>

              {/* Areas for Improvement */}
              <Box
                bg="white"
                border="1px solid"
                borderColor="orange.200"
                p={6}
                borderRadius="2xl"
              >
                <HStack mb={4} color="orange.500">
                  <Icon as={FaExclamationTriangle} />
                  <Heading size="sm">Needs Improvement</Heading>
                </HStack>
                <VStack align="start" gap={3}>
                  {weakSubjects.length > 0 ? (
                    weakSubjects.map((s, i) => (
                      <Box key={i}>
                        <Text fontSize="sm" fontWeight="bold">
                          {s.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Scored below 50%. Focus on foundational concepts.
                        </Text>
                      </Box>
                    ))
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No critical weaknesses detected.
                    </Text>
                  )}
                </VStack>
              </Box>
            </GridItem>
          </Grid>
          
          {/* Grading System Key */}
          
          <Box bg="white" p={8} borderRadius="2xl" shadow="sm">
            <VStack align="start" gap={4}>
              <HStack gap={2}>
                <Icon as={FaChartLine} color="primaryColor" />
                <Heading size="md">Grading System Key</Heading>
              </HStack>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Understand your performance levels based on the standard academic scoring range:
              </Text>
              
              <Grid templateColumns="repeat(6, 1fr)" gap={2} w="full">
                {[
                  { g: "A", range: "80-100", label: "Excellent", color: "green.500" },
                  { g: "B", range: "70-79", label: "V. Good", color: "blue.500" },
                  { g: "C", range: "55-69", label: "Good", color: "yellow.500" },
                  { g: "D", range: "40-54", label: "Fair", color: "orange.500" },
                  { g: "E", range: "30-39", label: "Poor", color: "pink.500" },
                  { g: "F", range: "0-29", label: "Fail", color: "red.500" },
                ].map((item) => (
                  <GridItem key={item.g} textAlign="center" p={3} border="1px solid" borderColor="gray.100" borderRadius="lg">
                    <Text fontWeight="bold" fontSize="lg" color={item.color}>{item.g}</Text>
                    <Text fontSize="10px" fontWeight="bold">{item.range}%</Text>
                    <Text fontSize="9px" color="gray.400" textTransform="uppercase">{item.label}</Text>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          </Box>

          {/* Actionable Next Steps */}
          <Box bg="white" p={8} borderRadius="2xl" shadow="sm">
            <HStack mb={6}>
              <Circle size="40px" bg="blue.50" color="blue.500">
                <FaLightbulb />
              </Circle>
              <VStack align="start" gap={0}>
                <Heading size="md">Study Recommendations</Heading>
                <Text fontSize="xs" color="gray.500">
                  Personalized content based on your performance
                </Text>
              </VStack>
            </HStack>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={4}
            >
              {weakSubjects.length > 0 ? (
                weakSubjects.map((s, i) => (
                  <Box
                    key={i}
                    p={4}
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="xl"
                    _hover={{ bg: "gray.50" }}
                    cursor="pointer"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color="primaryColor"
                        >
                          RECOMMENDED VIDEO
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {s.name} Fundamentals
                        </Text>
                      </VStack>
                      <Icon as={LuBookOpen} />
                    </HStack>
                  </Box>
                ))
              ) : (
                <Text color="gray.500" fontSize="sm">
                  You're doing great! Why not try a more advanced quiz in{" "}
                  {strongSubjects[0]?.name || "your core subjects"}?
                </Text>
              )}
            </Grid>
          </Box>
        </VStack>

        {/* PDF-Only Footer (Optional) */}
        <Box mt={20} pt={10} borderTop="2px solid" borderColor="gray.200">
          <Flex justify="space-between" align="center">
            <VStack align="start" gap={0}>
              <Text fontWeight="bold" fontSize="sm">
                Official Academic Record
              </Text>
              <Text fontSize="xs" color="gray.500">
                Generated by iGrades Learning System
              </Text>
            </VStack>
            <Box textAlign="right">
              <Text fontSize="xs" fontWeight="bold">
                Verification ID:
              </Text>
              <Text fontSize="10px" color="gray.400">
                {quizResults.timestamp.split("T")[0]}-
                {authdStudent?.id?.slice(0, 5)}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
      {/* Floating Action Buttons */}
      <HStack position="fixed" bottom={8} right={8} gap={4}>
        <Button
          colorPalette="blue"
          size="lg"
          rounded="full"
          shadow="xl"
          onClick={onDownload}
          loading={isDownloading}
        >
          Download PDF Report
        </Button>
      </HStack>
    </Box>
  );
};
