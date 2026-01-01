import {
  Flex,
  Badge,
  Heading,
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
import logo from "@/assets/logo.png";

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
      mt={{ base: 4, md: -4 }}
      mb={4}
      bg="white"
      w="full"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      {/*logo*/}
      <Box
        display="flex"
        alignItems="center"
        bg="white"
        px={{ base: 3, md: 4, lg: 4 }}
        py={{ base: 7, md: 7, lg: 4.5 }}
        w={{ base: "25%", md: "10%" }}
      >
        <Image
          src={logo}
          alt="Logo"
          w={{ md: "100%", lg: "100%" }}
          fit="cover"
        />
      </Box>

      <Flex justify="space-between" w="90%">
        <Flex
          align="center"
          gap={3}
          w={{ base: "35%", md: "25%", lg: "12%" }}
          ml="8"
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
          {/*<Text fontSize="md" fontWeight="bold" color="gray.600">
            {currentSubject.displayName}
          </Text>*/}
        </Flex>

        <Flex>
          <CheatingProgressBar cheatingScore={cheatingScore} />
        </Flex>

        <Flex
          justify="space-between"
          gap={4}
          align="center"
          w={{ base: "55%", md: "50%" }}
        >
          {/* display timer only if in examination mode */}
          {mode === "examination" && (
            <Badge variant='plain'>
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
          
          <Calculator />

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
            mx="2"
            rounded={{ base: "lg", md: "xl", lg: "3xl" }}
            fontWeight="500"
            onClick={onSubmit}
            loading={isSubmitting}
          >
            Submit Quiz <GoArrowRight />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
