import { Box, Flex, Button, HStack, Heading, Text } from "@chakra-ui/react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import type { QuizNavigationProps } from "./types";

export const QuizNavigation = ({
  questions,
  currentQuestionIndex,
  answers,
  isSubjectCompleted,
  onQuestionSelect,
  onPrevious,
  onNext,
}: QuizNavigationProps) => {
  const isLastQuestionInSubject = currentQuestionIndex === questions.length - 1;

  return (
    <Box m="auto" mt={6} w="80%">
      <Flex justify="space-between" gap={8} align="center" mb={4}>
        <HStack gap={2} wrap="wrap" justify="start" w="55%">
          {questions.map((_, index) => {
            const isAnswered = answers[questions[index].id] !== undefined;
            const isCurrent = index === currentQuestionIndex;

            // --- logic fir color conditionals ---
            let bg = "white";
            let color = "on_backgroundColor";
            let border = "none";

            if (isAnswered && isCurrent) {
              // if isAnswered && isCurrent, bg: primaryColor, border: none, color: white
              bg = "primaryColor";
              color = "white";
              border = "none";
            } else if (isCurrent) {
              // if isCurrent, bg: white, border: 1px solid primaryColor, color: primaryColor
              bg = "white";
              color = "primaryColor";
              border = "1px solid";
            } else if (isAnswered) {
              // if isAnswered, bg: primaryColor, color: white, border: none
              bg = "primaryColor";
              color = "white";
              border = "none";
            } else {
              // if !isAnswered or !isCurrent (Default)
              bg = "white";
              color = "on_backgroundColor";
              border = "none";
            }

            return (
              <Button
                key={index}
                size="sm"
                bg={bg}
                color={color}
                border={border}
                borderColor="primaryColor" // Only visible if border is "1px solid"
                onClick={() => onQuestionSelect(index)}
                fontWeight={isCurrent ? "semibold" : "normal"}
                minW="30px"
                h="30px"
                p={0}
                borderRadius="md"
                _hover={{ opacity: 0.8 }}
              >
                <Heading fontSize="xs">{index + 1}</Heading>
              </Button>
            );
          })}
        </HStack>

        <Flex w="45%" justify="space-between">
          <Button
            variant="outline"
            border="1px solid"
            borderColor="primaryColor"
            rounded="3xl"
            w="40%"
            p={3}
            color="primaryColor"
            fontWeight={500}
            fontSize="xs"
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
          >
            <GoArrowLeft />
            <Text display={{ base: "none", md: "inline" }}>Prev</Text>
          </Button>
          <Button
            variant="outline"
            border="1px solid"
            borderColor="primaryColor"
            rounded="3xl"
            w="40%"
            p={3}
            color="primaryColor"
            fontWeight={500}
            fontSize="xs"
            onClick={onNext}
            disabled={isSubjectCompleted}
          >
            <Text display={{ base: "none", md: "inline" }}>
              {isLastQuestionInSubject ? "Completed" : "Next"}
            </Text>
            <GoArrowRight />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
