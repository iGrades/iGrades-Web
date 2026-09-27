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
  Button,
} from "@chakra-ui/react";
import { FaTrophy, FaChartLine, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { PiShootingStarDuotone } from "react-icons/pi";
import type { QuizResults, QuizAttemptProps } from "./types";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LockedBadge } from "@/components/subscription/LockedBadge";

interface PerformanceAnalyticsProps {
  quizResults: QuizResults;
  quizData: QuizAttemptProps["quizData"];
}

const PerformanceAnalytics = ({ quizResults, quizData }: PerformanceAnalyticsProps) => {
  const {
    effectivePlan,
    verifyAnalytics,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  const isDetailedAllowed = verifyAnalytics("detailed_breakdown").allowed;

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
    return b.correct - a.correct;
  });

  const strongest = sortedResults[0];
  const weakest = sortedResults[sortedResults.length - 1];

  // 2. Logic to handle "All Failed" or "All Same" scenarios
  const allSame = resultsArray.every(r => r.percentage === resultsArray[0].percentage);
  const totalCorrect = resultsArray.reduce((acc, curr) => acc + curr.correct, 0);
  const totalQuestions = resultsArray.reduce((acc, curr) => acc + curr.total, 0);
  const totalPercentage = Math.round((totalCorrect / totalQuestions) * 100);

  const handleDetailedUpgradeClick = () => {
    promptUpgrade(
      "Detailed Performance Breakdown",
      "standard",
      "Detailed performance breakdown and subject/topic strengths & weaknesses require a Standard or Premium subscription. Upgrade to Standard (₦15,000) to see full diagnostic analytics."
    );
  };

  const handleDeepUpgradeClick = () => {
    promptUpgrade(
      "Deep Learning Analytics",
      "premium",
      "Deep longitudinal performance analytics, advanced AI error analysis, and learning intelligence require a Premium (₦25,000) subscription."
    );
  };

  return (
    <Box w="full" bg="blue.50" p={6} borderRadius="xl" border="1px solid" borderColor="blue.100">
      <VStack align="stretch" gap={6}>
        <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} wrap="wrap" gap={2}>
          <HStack gap={3}>
            <Icon as={FaChartLine} color="blue.600" boxSize={5} />
            <Heading size="md" color="blue.800">Performance Analytics</Heading>
          </HStack>

          <HStack gap={2}>
            {effectivePlan === "basic" && (
              <Button
                size="xs"
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1852B2" }}
                onClick={handleDetailedUpgradeClick}
              >
                <PiShootingStarDuotone style={{ marginRight: "4px" }} /> Unlock Standard Plan
              </Button>
            )}
            {effectivePlan === "standard" && (
              <Button
                size="xs"
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1852B2" }}
                onClick={handleDeepUpgradeClick}
              >
                <PiShootingStarDuotone style={{ marginRight: "4px" }} /> Unlock Premium Plan
              </Button>
            )}
            {effectivePlan === "premium" && (
              <HStack gap={1} fontSize="xs" fontWeight="bold" color="#1E56B3" bg="blue.50" px={2.5} py={0.5} borderRadius="full">
                <PiShootingStarDuotone />
                <Text as="span">Deep AI Intelligence Active</Text>
              </HStack>
            )}
          </HStack>
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {/* Overall Performance - Always available for Basic, Standard & Premium */}
          <VStack align="flex-start" p={4} bg="white" borderRadius="lg" shadow="sm" h="full">
            <Text fontSize="xs" fontWeight="bold" color="gray.500">OVERALL ACCURACY</Text>
            <Heading size="xl" color="blue.600">{totalPercentage}%</Heading>
            <Progress.Root value={totalPercentage} colorPalette="blue" size="sm" w="full" mt={2}>
               <Progress.Track> <Progress.Range /></Progress.Track>
            </Progress.Root>
            <Text fontSize="10px" color="gray.500" mt={1}>
              {totalCorrect} of {totalQuestions} total questions correct
            </Text>
          </VStack>

          {/* Strongest Subject - Standard / Premium Feature */}
          <VStack
            align="flex-start"
            p={4}
            bg="white"
            borderRadius="lg"
            shadow="sm"
            h="full"
            position="relative"
            cursor={!isDetailedAllowed ? "pointer" : "default"}
            onClick={!isDetailedAllowed ? handleDetailedUpgradeClick : undefined}
          >
            <Flex w="full" justify="space-between" align="center">
              <HStack color="green.600">
                <Icon as={allSame && totalPercentage < 50 ? FaInfoCircle : FaTrophy} />
                <Text fontSize="xs" fontWeight="bold">
                  {allSame ? "CONSISTENT AREA" : "STRONGEST AREA"}
                </Text>
              </HStack>
              {!isDetailedAllowed && <LockedBadge requiredPlan="standard" label="Standard" size="xs" />}
            </Flex>

            {isDetailedAllowed ? (
              <>
                <Heading size="md" lineClamp={1}>{strongest ? strongest.name : "N/A"}</Heading>
                <Text fontSize="sm" color="gray.600">
                  {allSame ? "Uniform performance" : `${strongest ? strongest.percentage : 0}% Score`}
                </Text>
              </>
            ) : (
              <VStack align="flex-start" gap={1} mt={1}>
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Subject Strength Diagnostic
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Upgrade to Standard to view your highest performing topic and accuracy breakdown.
                </Text>
              </VStack>
            )}
          </VStack>

          {/* Improvement Area - Standard / Premium Feature */}
          <VStack
            align="flex-start"
            p={4}
            bg="white"
            borderRadius="lg"
            shadow="sm"
            h="full"
            position="relative"
            cursor={!isDetailedAllowed ? "pointer" : "default"}
            onClick={!isDetailedAllowed ? handleDetailedUpgradeClick : undefined}
          >
            <Flex w="full" justify="space-between" align="center">
              <HStack color="orange.600">
                <Icon as={FaExclamationTriangle} />
                <Text fontSize="xs" fontWeight="bold">
                  {totalPercentage === 100 ? "PERFECT SCORE" : "FOCUS AREA"}
                </Text>
              </HStack>
              {!isDetailedAllowed && <LockedBadge requiredPlan="standard" label="Standard" size="xs" />}
            </Flex>

            {isDetailedAllowed ? (
              <>
                <Heading size="md" lineClamp={1}>
                  {totalPercentage === 100 ? "None!" : weakest ? weakest.name : "N/A"}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {totalPercentage === 100 ? "Excellent work" : `${weakest ? weakest.percentage : 0}% Score`}
                </Text>
              </>
            ) : (
              <VStack align="flex-start" gap={1} mt={1}>
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Topic Weakness Diagnostic
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Upgrade to Standard to identify weak syllabus areas needing targeted practice.
                </Text>
              </VStack>
            )}
          </VStack>
        </Grid>

        {/* Mini Subject Status List */}
        {isDetailedAllowed ? (
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
        ) : (
          <Flex
            p={3}
            bg="white"
            borderRadius="lg"
            border="1px dashed"
            borderColor="orange.200"
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={2}
          >
            <Text fontSize="xs" color="gray.600">
              <strong>Detailed Performance Breakdown:</strong> Subject-by-subject strengths & weaknesses are locked on Basic.
            </Text>
            <Button
              size="xs"
              bg="#206CE1"
              color="white"
              _hover={{ bg: "#1852B2" }}
              onClick={handleDetailedUpgradeClick}
            >
              <PiShootingStarDuotone style={{ marginRight: "4px" }} /> Unlock Standard Plan (₦15,000)
            </Button>
          </Flex>
        )}
      </VStack>

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </Box>
  );
};

export default PerformanceAnalytics;