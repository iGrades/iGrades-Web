import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  Card,
  CardBody,
  Stack,
  Icon,
} from "@chakra-ui/react";
import { HiClipboardList } from "react-icons/hi";
import { LuArrowDownToLine } from "react-icons/lu";
import { FiUpload } from "react-icons/fi";
import { TbClipboardList } from "react-icons/tb";
import { RiErrorWarningFill } from "react-icons/ri";
import { FaCircleCheck } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import type { ResultsPageProps } from "./types";
import { useNavigate } from "react-router-dom";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import resultWobble from "@/assets/result_wobble.png";
import resultCourseBg from "@/assets/result_text_bg.png";

export const ResultsPage = ({
  quizResults,
  quizData,
}: ResultsPageProps) => {
  const navigate = useNavigate()
  const { authdStudent } = useAuthdStudentData();
  // Calculate overall score and total questions
  const totalCorrect = Object.values(quizResults.subjectResults).reduce(
    (acc, result) => acc + result.correct,
    0
  );
  const totalQuestions = Object.values(quizResults.subjectResults).reduce(
    (acc, result) => acc + result.total,
    0
  );
  const overallScore = totalCorrect; 

  // Format date
  const formattedDate = new Date(quizResults.timestamp)
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })
    .replace(",", "");

  return (
    <Box
      p={6}
      borderRadius="md"
      boxShadow="md"
      bg="white"
      w={{ base: "100%", lg: "80%" }}
      m="auto"
      minH="85vh"
    >
      {/* <Heading size="xl" textAlign="center" mb={8} color="blue.600">
        Quiz Results
      </Heading> */}

      <Flex
        direction={{ base: "column", lg: "row" }}
        justify="space-around"
        align="center"
        gap={6}
      >
        {/* Left Side: Results Summary Card */}
        <Card.Root
          bgImage={`url(${resultWobble})`}
          bgSize="contain"
          mt={8}
          w={{ base: "100%", md: "55%", lg: "35%" }}
          border="none"
          borderRadius="3xl"
          position="relative"
          overflow="hidden"
        >
          <CardBody p={6} mb={7}>
            <Stack gap={12} fontSize="sm">
              <Flex direction="column" align="center" justify="center" gap={4}>
                <Icon
                  as={
                    quizResults.overallPassed
                      ? FaCircleCheck
                      : RiErrorWarningFill
                  }
                  boxSize={10}
                  color={quizResults.overallPassed ? "green.500" : "red.500"}
                />
                <Heading size="lg">
                  {quizResults.overallPassed
                    ? "Congrats, you passed!"
                    : "Try Again"}
                </Heading>
              </Flex>

              <Stack gap={4} color="on_backgroundColor" textAlign="right">
                <Flex justify="space-between">
                  <Text>Total Score</Text>
                  <Text>{overallScore}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Total Questions</Text>
                  <Text>{totalQuestions}</Text>
                </Flex>
                {quizData.subjects.map((subject) => {
                  const result = quizResults.subjectResults[subject.id];
                  if (!result) return null;

                  return (
                    <Flex key={subject.id} justify="space-between">
                      <Text>{subject.displayName}</Text>
                      <Text>
                        {result.correct}/{result.total}
                      </Text>
                    </Flex>
                  );
                })}
                <Flex justify="space-between">
                  <Text>Status</Text>
                  <Text color={quizResults.overallPassed ? "#4BD37B" : "red"}>
                    {quizResults.overallPassed ? "* Passed" : "* Failed"}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Date & Time</Text>
                  <Text w="30%" fontSize={"11px"}>
                    {formattedDate}
                  </Text>
                </Flex>
              </Stack>
            </Stack>
          </CardBody>
          <Flex
            align="center"
            justify="center"
            gap={2}
            bgImage={`url(${resultCourseBg})`}
            bgSize="cover"
            height="16"
            color="white"
            fontSize="sm"
            mt="-9"
          >
            <HiClipboardList /> Quiz Summary
          </Flex>
        </Card.Root>

        {/* Right Side: Greeting and Note */}
        <Box
          w={{ base: "100%", md: "85%", lg: "55%" }}
          p={{ base: 0, lg: 6 }}
          my={{ base: 10, lg: 0 }}
        >
          <Stack gap={6} w="80%">
            <Heading size="2xl" fontWeight="400">
              Hi, {authdStudent?.firstname} {authdStudent?.lastname} 👋
            </Heading>

            <Box my={2} fontSize="sm">
              <Text fontWeight="600" color="on_backgroundColor" mb={2}>
                Please Note:
              </Text>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem
                ipsum dolor sit amet, consectetur adipiscing elit. Adipiscing
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                consectetur adipiscing.
              </Text>
            </Box>

            <Flex flexWrap="wrap" justify="flex-start" align="center" gap={4}>
              <Button bg="primaryColor" fontSize="xs" p={5} rounded="3xl">
                {" "}
                <LuArrowDownToLine /> Download
              </Button>
              <Button
                bg="#F187291A"
                color="secondaryColor"
                fontSize="xs"
                p={5}
                rounded="3xl"
              >
                <FiUpload /> Share
              </Button>
              <Button
                bg="#1FBA791A"
                color="greenOthers"
                fontSize="xs"
                p={5}
                rounded="3xl"
              >
                <TbClipboardList /> Quiz Report
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Flex>
      {/* Back to Dashboard Button */}
      <Flex justify="flex-end" mt={10}>
        <Button
          variant="outline"
          bg='primaryColor'
          color='white'
          size="sm"
          fontSize='xs'
          onClick={() => navigate("/student-dashboard")}
        >
          <IoArrowBack /> Go to Dashboard
        </Button>
      </Flex>
    </Box>
  );
};
