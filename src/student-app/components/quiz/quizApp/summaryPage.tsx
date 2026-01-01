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
import { IoClose, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
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
                    <Heading size="md" mb={4} p={3} bg="gray.50" borderRadius="md">{subject.displayName}</Heading>
                    <VStack align="stretch" gap={6}>
                      {subjectQuestions.map((question, idx) => {
                        const userPick = studentAnswers[question.id];
                        const isCorrect = userPick === question.correct_option;

                        return (
                          <Box key={question.id} p={5} borderWidth="1px" borderRadius="lg" bg={userPick ? (isCorrect ? "green.50" : "red.50") : "gray.50"}>
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="bold">Question {idx + 1}</Text>
                              {!userPick ? <Badge>Skipped</Badge> : isCorrect ? <Icon as={IoCheckmarkCircle} color="green.500"/> : <Icon as={IoCloseCircle} color="red.500"/>}
                            </HStack>
                            <Text mb={4}>{question.question_text}</Text>
                            
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