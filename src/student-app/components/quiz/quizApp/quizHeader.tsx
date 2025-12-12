import { Flex, Badge, Heading, Button, Image, Box, Text } from "@chakra-ui/react";
import { GoArrowRight } from "react-icons/go";
import type { QuizHeaderProps } from "./types";
import { useStudentData } from "@/student-app/context/dataContext";
import timerImage from "@/assets/timer.png";

export const QuizHeader = ({
  currentSubject,
  timeLeft,
  isSubjectCompleted,
  onSubmit,
  isSubmitting,
  mode,
}: QuizHeaderProps) => {
  const { subjectImages } = useStudentData();
  const currentSubjectImage = subjectImages[currentSubject?.dbName] || null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Flex justify="space-between" align="center" mt={{ base: 4, md: 0 }} mb={6}>
      <Flex
        align="center"
        gap={3}
        w={{ base: "35%", md: "25%", lg: "20%" }}
      >
        {currentSubjectImage ? (
          <Image src={currentSubjectImage} alt={currentSubject.displayName} />
        ) : (
          <Box
            boxSize="50px"
            bg="gray.200"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" fontWeight="bold" color="gray.600">
              {currentSubject.displayName.charAt(0)}
            </Text>
          </Box>
        )}
      </Flex>

      <Flex
        justify="space-between"
        gap={4}
        align="center"
        w={{ base: "55%", md: "50%" }}
      >
        {/* display timer only if in examination mode */}
        {mode === "examination" && (
          <Badge>
            <Image src={timerImage} alt="timer" height="25px" />
            <Heading
              color="on_backgroundColor"
              fontSize="2xl"
              fontWeight="semibold"
            >
              {formatTime(timeLeft)}
            </Heading>
          </Badge>
        )}

        <Badge
          display={{ base: "none", md: "block" }}
          colorScheme={isSubjectCompleted ? "green" : "blue"}
        >
          {isSubjectCompleted ? "Completed" : "In Progress"}
        </Badge>
        <Button
          bg="primaryColor"
          size="sm"
          w={{ base: 28, md: 36, lg: 48 }}
          p={{ base: 5, md: 5, lg: 6 }}
          rounded={{ base: "lg", md: "xl", lg: "3xl" }}
          fontWeight="500"
          onClick={onSubmit}
          loading={isSubmitting}
        >
          Submit <GoArrowRight />
        </Button>
      </Flex>
    </Flex>
  );
};
