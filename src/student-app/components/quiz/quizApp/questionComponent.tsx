import { Box, Heading, Text, Flex, RadioGroup, VStack, Image } from "@chakra-ui/react";
import type { QuestionComponentProps } from "./types";

export const QuestionComponent = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}: QuestionComponentProps) => {
  const hasImage = Boolean(currentQuestion?.image_url);
  
  console.log("question data:", JSON.stringify(currentQuestion, null, 2));

  return (
    <Box p={6} bg="white" borderRadius="lg" minH="50vh" w="80%" m="auto">
      <Heading my={2} fontSize="md">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </Heading>

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "flex-start" }}
        my={6}
        px={{ base: 0, md: 4 }}
        color="on_backgroundColor"
        gap={6}
      >
        {/* ── Left: question text + optional image ── */}
        <Box flex={1}>
          <Text fontSize="sm" my={4}>
            {currentQuestion.question_text}
          </Text>

          {hasImage && (
            <Box mt={4} mb={2}>
              <Image
                src={currentQuestion.image_url}
                alt="Question illustration"
                maxH="280px"
                maxW="100%"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                objectFit="contain"
                // Show a subtle loading placeholder while the image fetches
                fallback={
                  <Box
                    h="120px"
                    bg="gray.100"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xs" color="gray.400">Loading image…</Text>
                  </Box>
                }
              />
            </Box>
          )}
        </Box>

        {/* ── Right: answer options ── */}
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
            disabled={disabled}
          >
            <VStack align="stretch" gap={6}>
              {["A", "B", "C", "D"].map((option) => (
                <RadioGroup.Item
                  key={option}
                  value={option}
                  bg="textFieldColor"
                  p={4}
                  rounded="md"
                  cursor={disabled ? "not-allowed" : "pointer"}
                  opacity={disabled ? 0.6 : 1}
                >
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemControl cursor={disabled ? "not-allowed" : "pointer"} />
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