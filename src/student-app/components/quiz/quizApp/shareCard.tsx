import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Circle,
  Image,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { FaAward, FaBookOpen, FaCalendarAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import logo from "@/assets/logo.png"; 
import type { QuizResults, QuizAttemptProps } from "./types";

interface ShareCardProps {
  quizResults: QuizResults;
  quizData: QuizAttemptProps["quizData"];
  studentName: string;
}

export const ShareCard = ({ quizResults, quizData, studentName}: ShareCardProps) => {
  
  // Find top subjects for the "Strengths" section
  const topSubjects = Object.entries(quizResults.subjectResults)
    .map(([id, result]) => {
      const subject = quizData.subjects.find((s) => s.id === id);
      return { name: subject?.displayName, ...result };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2);

  return (
    <Box
      id="quiz-report-card" // We will use this ID later to "capture" the image
      w="350px"
      bgGradient="linear(to-br, blue.600, purple.700)"
      p={6}
      borderRadius="2xl"
      color="white"
      boxShadow="2xl"
      position="relative"
      overflow="hidden"
      // bg='primaryColor'
      bg='blue.900'
    >
      {/* Decorative Background Elements */}
      <Circle size="200px" bg="whiteAlpha.100" position="absolute" top="-50px" right="-50px" />
      <Circle size="150px" bg="whiteAlpha.100" position="absolute" bottom="-30px" left="-40px" />

      <VStack gap={6} align="stretch" zIndex={1} position="relative">
        {/* Header: Logo & Branding */}
        <Flex justify="space-between" align="center">
          <Image src={logo} alt="Logo" h="30px" filter="brightness(0) invert(1)" />
          {/*<Image src={logo} alt="Logo" h="30px" />*/}
          <HStack gap={1} color="green.300">
            <Icon as={MdVerified} />
            <Text fontSize="xs" fontWeight="bold">OFFICIAL RESULT</Text>
          </HStack>
        </Flex>

        {/* Student Profile */}
        <VStack gap={1}>
          <Text fontSize="sm" color="blue.100" textTransform="uppercase" letterSpacing="widest">
            Quiz Certificate
          </Text>
          <Heading size="lg" textAlign="center">{ studentName}</Heading>
        </VStack>

        <Box divideX="2px" divideColor="whiteAlpha.300">
          
        </Box>

        {/* Main Score Section */}
        <Flex direction="column" align="center" py={4}>
          <Box position="relative">
             {/* Large Grade Display */}
            <Circle 
              size="120px" 
              border="8px solid" 
              borderColor="whiteAlpha.400" 
              bg="white" 
              color="blue.700"
              shadow="xl"
            >
              <Heading size="4xl">{quizResults.overallGrade}</Heading>
            </Circle>
            <Icon 
              as={FaAward} 
              position="absolute" 
              bottom="-5px" 
              right="-5px" 
              boxSize={10} 
              color="yellow.400" 
            />
          </Box>
          <VStack mt={4} gap={0}>
            <Heading size="md">{quizResults.overallGradeLabel}</Heading>
            <Text fontSize="xs" opacity={0.8}>Performance Rating</Text>
          </VStack>
        </Flex>

        {/* Strengths Section */}
        <Box bg="whiteAlpha.200" p={4} borderRadius="xl">
          <Text fontSize="xs" fontWeight="bold" mb={3} textTransform="uppercase">
            Core Strengths
          </Text>
          <VStack align="stretch" gap={3}>
            {topSubjects.map((subject, idx) => (
              <HStack key={idx} justify="space-between">
                <HStack>
                  <Icon as={FaBookOpen} boxSize={3} color="blue.200" />
                  <Text fontSize="sm" fontWeight="medium">{subject.name}</Text>
                </HStack>
                <Badge bg="blue.400" color="white" rounded="full" px={2}>
                  {subject.grade}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Footer Info */}
        <Flex justify="space-between" align="center" fontSize="10px" pt={2}>
          <HStack>
            <Icon as={FaCalendarAlt} />
            <Text>{new Date(quizResults.timestamp).toLocaleDateString()}</Text>
          </HStack>
          <Text fontWeight="bold">www.igrades.com</Text>
        </Flex>
      </VStack>
    </Box>
  );
};

// Helper component for Badge
const Badge = (props: any) => (
  <Box fontSize="10px" fontWeight="bold" {...props} />
);