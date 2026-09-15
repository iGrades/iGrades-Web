import {
  Flex,
  Badge,
  Button,
  Image,
  Box,
  Text,
} from "@chakra-ui/react";
import { GoArrowRight } from "react-icons/go";
import type { QuizHeaderProps } from "./types";
import { useStudentData } from "@/student-app/context/dataContext";
import timerImage from "@/assets/timer.png";
import { CheatingProgressBar } from "./CheatingProgressBar";
import { Calculator } from "./calculator";
import logo from "../../../../assets/logo.png";

export const QuizHeader = ({
  currentSubject,
  timeLeft,
  isSubjectCompleted,
  onSubmit,
  isSubmitting,
  mode,
  cheatingScore,
}: QuizHeaderProps) => {
  const { subjectImages } = useStudentData();
  const currentSubjectImage = subjectImages[currentSubject?.dbName] || null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      mt={{ base: 2, md: -4 }}
      mb={4}
      bg="white"
      w="full"
      position="sticky"
      top="0"
      zIndex="1000"
      px={{ base: 2, sm: 4, md: 6 }}
      py={{ base: 2, md: 3 }}
      borderBottom="1px solid"
      borderColor="gray.100"
      boxShadow="xs"
      gap={2}
    >
      {/* Left: Logo & Current Subject */}
      <HStack gap={{ base: 2, md: 3 }} align="center" flexShrink={0}>
        <Box w={{ base: "70px", sm: "85px", md: "110px" }}>
          <Image
            src={logo}
            alt="Logo"
            w="full"
            fit="contain"
          />
        </Box>

        <Box>
          {currentSubjectImage ? (
            <Image
              src={currentSubjectImage}
              alt={currentSubject.displayName}
              boxSize={{ base: "32px", md: "40px" }}
              objectFit="contain"
            />
          ) : (
            <Box
              boxSize={{ base: "32px", md: "40px" }}
              bg="blue.50"
              border="1px solid"
              borderColor="blue.200"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xs" fontWeight="bold" color="blue.700">
                {currentSubject.displayName.charAt(0)}
              </Text>
            </Box>
          )}
        </Box>
      </HStack>

      {/* Center: Proctoring info if exam mode */}
      {mode === "examination" && (
        <Box display={{ base: "none", md: "block" }}>
          <CheatingProgressBar cheatingScore={cheatingScore} />
        </Box>
      )}

      {/* Right: Timer, Calculator, Subject status, Submit Button */}
      <HStack gap={{ base: 1.5, sm: 3 }} align="center" ml="auto">
        {/* display timer only if in examination mode */}
        {mode === "examination" && (
          <Badge
            variant="surface"
            colorPalette="blue"
            px={{ base: 1.5, sm: 2.5 }}
            py={1}
            borderRadius="lg"
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            <Image src={timerImage} alt="timer" height={{ base: "16px", sm: "20px" }} />
            <Text
              color="blue.900"
              fontSize={{ base: "xs", sm: "sm", md: "md" }}
              fontWeight="bold"
              fontFamily="mono"
            >
              {formatTime(timeLeft)}
            </Text>
          </Badge>
        )}

        <Calculator />

        <Badge
          display={{ base: "none", lg: "inline-flex" }}
          colorPalette={isSubjectCompleted ? "green" : "blue"}
          variant="subtle"
          borderRadius="full"
          px={2.5}
        >
          {isSubjectCompleted ? "Completed" : "In Progress"}
        </Badge>

        <Button
          bg="primaryColor"
          size="sm"
          px={{ base: 3, sm: 4, md: 5 }}
          h={{ base: "34px", sm: "38px" }}
          rounded={{ base: "lg", md: "full" }}
          fontWeight="600"
          fontSize={{ base: "xs", sm: "sm" }}
          onClick={onSubmit}
          loading={isSubmitting}
        >
          <Text display={{ base: "none", sm: "inline" }}>Submit Quiz</Text>
          <Text display={{ base: "inline", sm: "none" }}>Submit</Text>
          <GoArrowRight />
        </Button>
      </HStack>
    </Flex>
  );
};
