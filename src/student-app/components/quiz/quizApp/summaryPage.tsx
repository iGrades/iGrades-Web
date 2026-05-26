import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Separator,
  ScrollArea,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { IoClose, IoCheckmarkCircle, IoCloseCircle, IoInformationCircle } from "react-icons/io5";
import type { QuizResults, QuizAttemptProps } from "./types";
import PerformanceAnalytics from "./performanceAnalytics";

interface SummaryPageProps {
  quizResults: QuizResults;
  quizData: QuizAttemptProps["quizData"];
  onClose: () => void;
}

const SummaryPage = ({ quizResults, quizData, onClose }: SummaryPageProps) => {
  const studentAnswers = quizResults.studentAnswers || {};

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="white"
      zIndex={2000}
      p={{ base: 4, md: 10 }}
    >
      <VStack h="full" align="stretch" gap={6}>
        <Flex justify="space-between" align="center">
          <VStack align="flex-start" gap={1}>
            <Heading size="lg">Review Summary</Heading>
            <Text fontSize="sm" color="gray.600">Reviewing your choices vs correct answers</Text>
          </VStack>
          <Button variant="ghost" onClick={onClose} size="lg"><IoClose size={24} /></Button>
        </Flex>

        <Separator />

        <ScrollArea.Root h="full">
          <ScrollArea.Viewport>
            <VStack align="stretch" gap={10} pb={20}>
              <PerformanceAnalytics quizResults={quizResults} quizData={quizData} />
              <Separator />

              {quizData.subjects.map((subject) => {
                const subjectQuestions = quizData.questions.filter(q => q.subject_id === subject.id);
                const result = quizResults.subjectResults[subject.id];
                if (!result) return null;

                return (
                  <Box key={subject.id}>
                    <Heading size="md" mb={4} p={3} bg="gray.50" borderRadius="md">
                      {subject.displayName}
                    </Heading>
                    <VStack align="stretch" gap={6}>
                      {subjectQuestions.map((question, idx) => {
                        const userPick = studentAnswers[question.id];
                        const isCorrect = userPick === question.correct_option;

                        return (
                          <Box
                            key={question.id} p={5} borderWidth="1px" borderRadius="lg"
                            bg={userPick ? (isCorrect ? "green.50" : "red.50") : "gray.50"}
                          >
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="bold">Question {idx + 1}</Text>
                              {!userPick
                                ? <Badge>Skipped</Badge>
                                : isCorrect
                                  ? <Icon as={IoCheckmarkCircle} color="green.500" />
                                  : <Icon as={IoCloseCircle} color="red.500" />
                              }
                            </HStack>

                            <Text mb={4}>{question.question_text}</Text>

                            {/* ── Question image ── */}
                            {question.image_url && (
                              <Box mb={4}>
                                <img
                                  src={question.image_url}
                                  alt="Question illustration"
                                  style={{
                                    maxHeight: "220px", maxWidth: "100%",
                                    borderRadius: "8px", border: "1px solid #E2E8F0",
                                    objectFit: "contain", display: "block",
                                  }}
                                />
                              </Box>
                            )}

                            {/* ── Options ── */}
                            <VStack align="stretch" gap={2}>
                              {["A", "B", "C", "D"].map(opt => {
                                const optionText = question[`option_${opt.toLowerCase()}` as keyof typeof question] as string;
                                const isUserChoice = userPick === opt;
                                const isCorrectChoice = question.correct_option === opt;

                                return (
                                  <HStack
                                    key={opt} p={3} borderRadius="md" borderWidth="1px"
                                    borderColor={isCorrectChoice ? "green.500" : isUserChoice ? "red.500" : "gray.200"}
                                    bg={isCorrectChoice ? "green.100" : isUserChoice ? "red.100" : "white"}
                                  >
                                    <Text fontWeight="bold" w="25px">{opt}.</Text>
                                    <Text flex={1}>{optionText}</Text>
                                    {isCorrectChoice && <Badge colorPalette="green">Correct</Badge>}
                                    {isUserChoice && !isCorrect && <Badge colorPalette="red">Your Choice</Badge>}
                                  </HStack>
                                );
                              })}
                            </VStack>

                            {/* ── Answer explanation ── */}
                            {question.answer_explanation && (
                              <HStack
                                mt={4} p={4}
                                bg="blue.50" borderRadius="lg"
                                border="1px solid" borderColor="blue.200"
                                align="flex-start" gap={3}
                              >
                                <Icon
                                  as={IoInformationCircle}
                                  color="blue.500"
                                  boxSize={5}
                                  flexShrink={0}
                                  mt={0.5}
                                />
                                <Box>
                                  <Text
                                    fontSize="xs" fontWeight="700"
                                    color="blue.700" textTransform="uppercase"
                                    letterSpacing="0.05em" mb={1}
                                  >
                                    Explanation
                                  </Text>
                                  <Text fontSize="sm" color="blue.900" lineHeight="1.75">
                                    {question.answer_explanation}
                                  </Text>
                                </Box>
                              </HStack>
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                );
              })}
            </VStack>
          </ScrollArea.Viewport>
        </ScrollArea.Root>
      </VStack>
    </Box>
  );
};

export default SummaryPage;