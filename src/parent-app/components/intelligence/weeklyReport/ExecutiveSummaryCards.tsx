import { Grid, Box, Flex, Text, Heading, Icon, Badge } from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiAlertCircle,
  FiCompass,
} from "react-icons/fi";
import type { WeeklyReportData } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  executiveAnswers: WeeklyReportData["executiveAnswers"];
  studentFirstName: string;
};

export const ExecutiveSummaryCards = ({ executiveAnswers, studentFirstName }: Props) => {
  const cards = [
    {
      id: "didStudy",
      question: `1. Did ${studentFirstName} study?`,
      answer: executiveAnswers.didStudy.answer,
      detail: executiveAnswers.didStudy.detail,
      isPositive: executiveAnswers.didStudy.isPositive,
      icon: FiCheckCircle,
      accentColor: executiveAnswers.didStudy.isPositive ? "#10B981" : "#F59E0B",
      bgLight: executiveAnswers.didStudy.isPositive ? "green.50" : "orange.50",
    },
    {
      id: "studyVolume",
      question: "2. How much did they study?",
      answer: executiveAnswers.studyVolume.answer,
      detail: executiveAnswers.studyVolume.detail,
      isPositive: executiveAnswers.studyVolume.isPositive,
      icon: FiClock,
      accentColor: "#206CE1",
      bgLight: "blue.50",
    },
    {
      id: "improvement",
      question: "3. Did performance improve?",
      answer: executiveAnswers.improvement.answer,
      detail: executiveAnswers.improvement.detail,
      isPositive: executiveAnswers.improvement.isPositive,
      icon: FiTrendingUp,
      accentColor: executiveAnswers.improvement.isPositive ? "#10B981" : "#6366F1",
      bgLight: executiveAnswers.improvement.isPositive ? "green.50" : "purple.50",
    },
    {
      id: "doingWell",
      question: "4. What are they doing well?",
      answer: executiveAnswers.doingWell.answer,
      detail: executiveAnswers.doingWell.detail,
      isPositive: executiveAnswers.doingWell.isPositive,
      icon: FiAward,
      accentColor: "#F59E0B",
      bgLight: "yellow.50",
    },
    {
      id: "struggling",
      question: "5. What needs attention?",
      answer: executiveAnswers.struggling.answer,
      detail: executiveAnswers.struggling.detail,
      isPositive: executiveAnswers.struggling.isPositive,
      icon: FiAlertCircle,
      accentColor: executiveAnswers.struggling.isPositive ? "#10B981" : "#EF4444",
      bgLight: executiveAnswers.struggling.isPositive ? "green.50" : "red.50",
    },
    {
      id: "nextFocus",
      question: "6. What to focus on next?",
      answer: executiveAnswers.nextFocus.answer,
      detail: executiveAnswers.nextFocus.detail,
      isPositive: true,
      icon: FiCompass,
      accentColor: "#0D9488",
      bgLight: "teal.50",
    },
  ];

  return (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={3.5}>
        <Box>
          <Heading size="sm" color="gray.900" fontWeight="800">
            Weekly Executive Summary
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            Key insights answering essential questions about your child's weekly learning routine.
          </Text>
        </Box>
        <Badge colorPalette="blue" variant="subtle" size="sm" px={2.5} py={0.5} borderRadius="full">
          6 Core Answers
        </Badge>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
        {cards.map((card) => {
          return (
            <Box
              key={card.id}
              bg="white"
              p={5}
              borderRadius="2xl"
              border="none"
              boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.07), 0 2px 6px -1px rgba(15, 23, 42, 0.04)"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              position="relative"
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: "0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(32, 108, 225, 0.08)",
              }}
              transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <Box>
                <Flex justify="space-between" align="start" mb={2.5}>
                  <Text fontSize="11px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.04em">
                    {card.question}
                  </Text>
                  <Box bg={card.bgLight} p={2} borderRadius="xl" boxShadow="0 2px 6px rgba(0, 0, 0, 0.04)">
                    <Icon as={card.icon} color={card.accentColor} boxSize="16px" />
                  </Box>
                </Flex>

                <Text fontSize="sm" fontWeight="800" color="gray.900" lineHeight="snug" mb={1.5}>
                  {card.answer}
                </Text>

                <Text fontSize="xs" color="gray.600" lineHeight="normal">
                  {card.detail}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};
