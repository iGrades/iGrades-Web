import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Icon,
  Progress,
  Grid,
} from "@chakra-ui/react";
import { FaTrophy, FaChartLine, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import type { QuizResults, QuizAttemptProps } from "./types";

interface PerformanceAnalyticsProps {
  quizResults: QuizResults;
  quizData: QuizAttemptProps["quizData"];
}

const PerformanceAnalytics = ({ quizResults, quizData }: PerformanceAnalyticsProps) => {
  const resultsArray = Object.entries(quizResults.subjectResults).map(([id, result]) => ({
    id,
    name: quizData.subjects.find(s => s.id === id)?.displayName || "Unknown",
    ...result
  }));

  // 1. Sort by percentage, and use "correct answers count" as a tie-breaker
  const sortedResults = [...resultsArray].sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return b.correct - a.correct; // Tie-breaker: who got more absolute questions right
  });
  

  const strongest = sortedResults[0];
  const weakest = sortedResults[sortedResults.length - 1];

  // 2. Logic to handle "All Failed" or "All Same" scenarios
  const allSame = resultsArray.every(r => r.percentage === resultsArray[0].percentage);
  const totalCorrect = resultsArray.reduce((acc, curr) => acc + curr.correct, 0);
  const totalQuestions = resultsArray.reduce((acc, curr) => acc + curr.total, 0);
  const totalPercentage = Math.round((totalCorrect / totalQuestions) * 100);

  return (
    <Box w="full" bg="blue.50" p={6} borderRadius="xl" border="1px solid" borderColor="blue.100">
      <VStack align="stretch" gap={6}>
        <HStack gap={3}>
          <Icon as={FaChartLine} color="blue.600" boxSize={5} />
          <Heading size="md" color="blue.800">Performance Analytics</Heading>
        </HStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {/* Overall Performance */}
          <VStack align="flex-start" p={4} bg="white" borderRadius="lg" shadow="sm" h="full">
            <Text fontSize="xs" fontWeight="bold" color="gray.500">OVERALL ACCURACY</Text>
            <Heading size="xl" color="blue.600">{totalPercentage}%</Heading>
            <Progress.Root value={totalPercentage} colorPalette="blue" size="sm" w="full" mt={2}>
               <Progress.Track> <Progress.Range /></Progress.Track>
            </Progress.Root>
          </VStack>

          {/* Strongest Subject - Handle Ties/All Same */}
          <VStack align="flex-start" p={4} bg="white" borderRadius="lg" shadow="sm" h="full">
            <HStack color="green.600">
              <Icon as={allSame && totalPercentage < 50 ? FaInfoCircle : FaTrophy} />
              <Text fontSize="xs" fontWeight="bold">
                {allSame ? "CONSISTENT AREA" : "STRONGEST AREA"}
              </Text>
            </HStack>
            <Heading size="md" lineClamp={1}>{strongest.name}</Heading>
            <Text fontSize="sm" color="gray.600">
                {allSame ? "Uniform performance" : `${strongest.percentage}% Score`}
            </Text>
          </VStack>

          {/* Improvement Area - Hide if everything is perfect, or change label if all failed */}
          <VStack align="flex-start" p={4} bg="white" borderRadius="lg" shadow="sm" h="full">
            <HStack color="orange.600">
              <Icon as={FaExclamationTriangle} />
              <Text fontSize="xs" fontWeight="bold">
                {totalPercentage === 100 ? "PERFECT SCORE" : "FOCUS AREA"}
              </Text>
            </HStack>
            <Heading size="md" lineClamp={1}>
                {totalPercentage === 100 ? "None!" : weakest.name}
            </Heading>
            <Text fontSize="sm" color="gray.600">
                {totalPercentage === 100 ? "Excellent work" : `${weakest.percentage}% Score`}
            </Text>
          </VStack>
        </Grid>

        {/* Mini Subject Status List */}
        <Flex gap={2} flexWrap="wrap">
          {resultsArray.map((res) => (
            <HStack 
                key={res.id} 
                px={3} 
                py={1} 
                bg={res.passed ? "green.100" : "red.100"} 
                color={res.passed ? "green.800" : "red.800"}
                borderRadius="full" 
                fontSize="xs"
                fontWeight="bold"
                border="1px solid"
                borderColor={res.passed ? "green.200" : "red.200"}
            >
                <Text>{res.name}: {res.percentage}%</Text>
            </HStack>
          ))}
        </Flex>
      </VStack>
    </Box>
  );
};

export default PerformanceAnalytics;