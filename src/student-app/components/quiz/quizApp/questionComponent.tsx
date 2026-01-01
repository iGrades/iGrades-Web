import { Box, Heading, Text, Flex, RadioGroup, VStack } from "@chakra-ui/react";
import type { QuestionComponentProps } from "./types";

export const QuestionComponent = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}: QuestionComponentProps) => {
  return (
    <Box p={6} bg="white" borderRadius="lg" minH="50vh" w='80%' m='auto'>
      <Heading my={2} fontSize="md">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </Heading>

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        my={6}
        px={{ base: 0, md: 4 }}
        color="on_backgroundColor"
      >
        <Box>
          <Text fontSize="sm" my={10}>
            {currentQuestion.question_text}
          </Text>
        </Box>

        <Box w={{ base: "95%", md: "50%" }}>
          <Heading my={2} fontSize="md">
            Select only one answer
          </Heading>
          <RadioGroup.Root
            value={selectedAnswer}
            onValueChange={(details) =>
              onAnswerSelect(
                currentQuestion.id,
                details.value ? details.value.toUpperCase() : ""
              )
            }
            size="sm"
            colorPalette="blue"
          >
            <VStack align="stretch" gap={6}>
              {["A", "B", "C", "D"].map((option) => (
                <RadioGroup.Item
                  key={option}
                  value={option}
                  bg="textFieldColor"
                  p={4}
                  rounded="md"
                  cursor="pointer"
                >
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemControl cursor="pointer" />
                  <RadioGroup.Label>
                    {
                      currentQuestion[
                        `option_${option.toLowerCase()}` as keyof typeof currentQuestion
                      ] as string
                    }
                  </RadioGroup.Label>
                </RadioGroup.Item>
              ))}
            </VStack>
          </RadioGroup.Root>
        </Box>
      </Flex>
    </Box>
  );
};
