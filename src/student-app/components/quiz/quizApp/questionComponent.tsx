import { Box, Heading, Text, Flex, RadioGroup, VStack } from "@chakra-ui/react";
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

  return (
    <Box
      p={{ base: 4, sm: 5, md: 6 }}
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="xs"
      minH="45vh"
      w="full"
      maxW="5xl"
      m="auto"
    >
      <Heading my={2} fontSize="md">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </Heading>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "flex-start" }}
        my={{ base: 4, md: 6 }}
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
              <img
                src={currentQuestion.image_url}
                alt="Question illustration"
                style={{
                  maxHeight: "280px",
                  maxWidth: "100%",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  // Hide broken image silently
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </Box>
          )}
        </Box>

        {/* ── Right: answer options ── */}
        <Box w={{ base: "100%", md: "50%" }}>
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