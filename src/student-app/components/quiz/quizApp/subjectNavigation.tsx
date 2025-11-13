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
    <Flex gap={2} mb={6} wrap="wrap">
      {subjects.map((subject, index) => {
        const hasQuizzes = quizzes.some(
          (quiz) => quiz.subject_id === subject.id
        );
        return (
          <Button
            key={subject.id}
            size="sm"
            bg={
              currentSubjectIndex === index
                ? "primaryColor"
                : completedSubjects.has(index)
                ? "green.400"
                : "primaryColor"
            }
            variant={currentSubjectIndex === index ? "solid" : "outline"}
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
