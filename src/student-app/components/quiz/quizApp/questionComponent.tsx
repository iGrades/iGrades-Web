import { Box, Heading, Text, Flex, RadioGroup, VStack, HStack, Progress } from "@chakra-ui/react";
import type { QuestionComponentProps } from "./types";
import { hapticsService } from "@/services/hapticsService";

export const QuestionComponent = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  disabled,
}: QuestionComponentProps) => {
  const hasImage = Boolean(currentQuestion?.image_url);
  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <Box
      p={{ base: 3.5, sm: 5, md: 6 }}
      bg="white"
      borderRadius={{ base: "xl", md: "2xl" }}
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      minH={{ base: "auto", md: "45vh" }}
      w="full"
      maxW="5xl"
      m="auto"
    >
      {/* Top Question Tracker Header */}
      <Box mb={{ base: 3, md: 4 }}>
        <Flex justify="space-between" align="center" mb={1.5}>
          <HStack gap={2}>
            <Heading fontSize={{ base: "sm", md: "md" }} fontWeight="700" color="gray.800">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Heading>
          </HStack>
          <Text fontSize="xs" fontWeight="600" color="primaryColor">
            {Math.round(progressPercent)}%
          </Text>
        </Flex>

        {/* Micro progress bar for pace keeping */}
        <Progress.Root value={progressPercent} size="xs" colorPalette="blue">
          <Progress.Track borderRadius="full" bg="gray.100">
            <Progress.Range borderRadius="full" bg="primaryColor" />
          </Progress.Track>
        </Progress.Root>
      </Box>

      {/* Main Single-Column Responsive Flow */}
      <Box color="on_backgroundColor">
        {/* ── Question Text ── */}
        <Box
          p={{ base: 3.5, md: 4 }}
          bg="#F8FAFC"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.100"
          mb={{ base: 4, md: 5 }}
        >
          <Text
            fontSize={{ base: "15px", md: "16px" }}
            lineHeight={{ base: "1.6", md: "1.7" }}
            fontWeight="500"
            color="gray.900"
          >
            {currentQuestion.question_text}
          </Text>

          {hasImage && (
            <Box mt={3} mb={1} display="flex" justifyContent="center">
              <img
                src={currentQuestion.image_url}
                alt="Question illustration"
                style={{
                  maxHeight: "240px",
                  maxWidth: "100%",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </Box>
          )}
        </Box>

        {/* ── Answer Options (Mobile Touch Cards) ── */}
        <Box w="full">
          <Text fontSize="xs" fontWeight="600" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="0.05em">
            Select one answer option
          </Text>

          <RadioGroup.Root
            value={selectedAnswer}
            onValueChange={(details) => {
              if (details.value) {
                hapticsService.triggerAnswerSelection();
                onAnswerSelect(
                  currentQuestion.id,
                  details.value.toUpperCase()
                );
              }
            }}
            size="sm"
            colorPalette="blue"
            disabled={disabled}
            w="full"
          >
            <VStack align="stretch" gap={{ base: 2.5, md: 3 }} w="full">
              {["A", "B", "C", "D"].map((option) => {
                const isSelected = selectedAnswer === option;
                const optionText = currentQuestion[
                  `option_${option.toLowerCase()}` as keyof typeof currentQuestion
                ] as string;

                if (!optionText && optionText !== "") return null;

                return (
                  <Box
                    key={option}
                    as="label"
                    display="flex"
                    alignItems="center"
                    gap={3.5}
                    p={{ base: 3, sm: 3.5, md: 4 }}
                    minH="54px"
                    borderRadius="xl"
                    cursor={disabled ? "not-allowed" : "pointer"}
                    bg={isSelected ? "blue.50/80" : "white"}
                    border="1.5px solid"
                    borderColor={isSelected ? "primaryColor" : "gray.200"}
                    boxShadow={isSelected ? "0 2px 8px rgba(32, 108, 225, 0.12)" : "xs"}
                    transition="all 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
                    _hover={!disabled ? { borderColor: isSelected ? "primaryColor" : "gray.300", bg: isSelected ? "blue.50" : "gray.50" } : {}}
                    _active={!disabled ? { transform: "scale(0.99)" } : {}}
                    opacity={disabled ? 0.6 : 1}
                  >
                    <RadioGroup.Item value={option} style={{ display: "none" }}>
                      <RadioGroup.ItemHiddenInput />
                    </RadioGroup.Item>

                    {/* Option Badge Circle */}
                    <Flex
                      align="center"
                      justify="center"
                      w="32px"
                      h="32px"
                      minW="32px"
                      borderRadius="full"
                      bg={isSelected ? "primaryColor" : "gray.100"}
                      color={isSelected ? "white" : "gray.700"}
                      fontWeight="bold"
                      fontSize="sm"
                      transition="background-color 0.15s ease"
                    >
                      {option}
                    </Flex>

                    {/* Option Text */}
                    <Text
                      fontSize={{ base: "sm", md: "15px" }}
                      fontWeight={isSelected ? "600" : "400"}
                      color={isSelected ? "gray.900" : "gray.700"}
                      lineHeight="1.45"
                      flex={1}
                    >
                      {optionText}
                    </Text>

                    {/* Radio visual indicator on right */}
                    <Box
                      w="18px"
                      h="18px"
                      borderRadius="full"
                      border="2px solid"
                      borderColor={isSelected ? "primaryColor" : "gray.300"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      {isSelected && (
                        <Box w="8px" h="8px" borderRadius="full" bg="primaryColor" />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          </RadioGroup.Root>
        </Box>
      </Box>
    </Box>
  );
};