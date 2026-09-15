import { Flex, Button } from "@chakra-ui/react";
import type { SubjectNavigationProps } from "./types";

export const SubjectNavigation = ({
  subjects,
  quizzes,
  currentSubjectIndex,
  completedSubjects,
  onSubjectChange,
}: SubjectNavigationProps) => {
  return (
    <Flex
      align="center"
      justify={{ base: "flex-start", sm: "center" }}
      gap={2}
      m="auto"
      my={4}
      wrap="wrap"
      bg="white"
      p={2.5}
      rounded="xl"
      w="full"
      maxW="5xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="xs"
    >
      {subjects.map((subject, index) => {
        const hasQuizzes = quizzes.some(
          (quiz) => quiz.subject_id === subject.id
        );
        return (
          <Button
            key={subject.id}
            size="sm"
            fontSize="xs"
            w={{ base: "calc(50% - 4px)", sm: "auto" }}
            minW={{ sm: "110px" }}
            px={{ base: 2, sm: 4 }}
            bg={
              currentSubjectIndex === index
                ? "blue.100"
                : completedSubjects.has(index)
                ? "gray.200"
                : "white"
            }
            color={
              currentSubjectIndex === index
                ? "primaryColor"
                : completedSubjects.has(index)
                ? "black"
                : "black"
            }
            variant={currentSubjectIndex === index ? "solid" : "ghost"}
            onClick={() => onSubjectChange(index)}
            disabled={
              (!completedSubjects.has(currentSubjectIndex) &&
                currentSubjectIndex !== index) ||
              !hasQuizzes
            }
            title={!hasQuizzes ? "No quiz available for this subject" : ""}
          >
            {subject.displayName}
            {completedSubjects.has(index) && " ✓"}
            {!hasQuizzes && " (No Quiz)"}
          </Button>
        );
      })}
    </Flex>
  );
};
