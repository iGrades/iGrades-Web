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
    <Box mt={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <HStack gap={2} wrap="wrap" justify="center">
          {questions.map((_, index) => {
            const isAnswered = answers[questions[index].id] !== undefined;
            const isCurrent = index === currentQuestionIndex;

            return (
              <Button
                key={index}
                size="sm"
                bg={[
                  isAnswered ? "primaryColor" : "white",
                  isCurrent ? "white" : "primaryColor",
                ]}
                onClick={() => onQuestionSelect(index)}
                minW="30px"
                h="30px"
                p={0}
                border="1px solid"
                borderColor="primaryColor"
                borderRadius="md"
                fontWeight={isCurrent ? "semibold" : "normal"}
                color={isCurrent ? "primaryColor" : "white"}
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
