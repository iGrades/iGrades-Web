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
    <Flex align='center' justify='space-around' gap={2} m='auto' my={4} wrap="wrap" bg='white' p={2} rounded='lg' w='80%' >
      {subjects.map((subject, index) => {
        const hasQuizzes = quizzes.some(
          (quiz) => quiz.subject_id === subject.id
        );
        return (
          <Button
            key={subject.id}
            size="sm"
            fontSize='xs'
            w='20%'
            bg={
              currentSubjectIndex === index
                ? "blue.100"
                : completedSubjects.has(index)
                ? "gray.200"
                : "white"
            }
            color={ currentSubjectIndex === index
              ? "primaryColor"
              : completedSubjects.has(index)
              ? "black"
              : "black"}
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
