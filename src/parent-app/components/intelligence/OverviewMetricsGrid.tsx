import { Grid, GridItem, Box, Flex, Text, Icon } from "@chakra-ui/react";
import { PiGraduationCapFill, PiFlameFill } from "react-icons/pi";
import { MdAssignmentTurnedIn, MdPlayLesson } from "react-icons/md";
import { useTranslation } from "react-i18next";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const OverviewMetricsGrid = ({ intelligence }: Props) => {
  const { t } = useTranslation();
  const {
    overallAccuracy,
    overallGrade,
    totalQuestionsAnswered,
    totalPracticeSessions,
    totalVideosWatched,
    studyStreakDays,
    learningStatus,
  } = intelligence;

  // Extract clean grade letter (e.g. "A", "B", "C")
  const gradeLetter = (overallGrade || "A").replace(/grade/i, "").trim() || "A";

  // Dedicated engaging font color per grade letter
  const getGradeLetterColor = (letter: string) => {
    const char = letter.trim().toUpperCase()[0];
    if (char === "A") return "#10B981"; // Vibrant Emerald
    if (char === "B") return "#2563EB"; // Royal Blue
    if (char === "C") return "#F59E0B"; // Warm Gold/Amber
    if (char === "D") return "#EA580C"; // Deep Orange
    return "#EF4444"; // Crimson Red
  };

  return (
    <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={3.5} mb={6}>
      {/* 1. Average Score Card */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 3.5, md: 4 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{
            borderColor: "blue.200",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(32, 108, 225, 0.08)",
          }}
          transition="all 0.2s"
        >
          {/* Single-line header with compact icon */}
          <Flex justify="space-between" align="center" gap={2} mb={2}>
            <Text
              fontSize={{ base: "11px", sm: "11.5px" }}
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.04em"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              flex="1"
            >
              {t("Average Score")}
            </Text>
            <Icon as={PiGraduationCapFill} color="#206CE1" boxSize="18px" flexShrink={0} />
          </Flex>

          {/* Prominent numbers & engaging grade letter on the right side of the box */}
          <Box>
            <Flex justify="space-between" align="center">
              <Text
                fontSize={{ base: "19px", sm: "20px", md: "21px" }}
                color="gray.900"
                fontWeight="normal"
                lineHeight="1"
              >
                {overallAccuracy}%
              </Text>
              <Text
                fontSize={{ base: "13px", sm: "14px" }}
                fontWeight="800"
                color={getGradeLetterColor(gradeLetter)}
                fontFamily="'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif"
                letterSpacing="0.02em"
                lineHeight="1"
                textAlign="right"
                title={`Grade ${gradeLetter}`}
                aria-label={`Grade ${gradeLetter}`}
              >
                {gradeLetter}
              </Text>
            </Flex>
            <Text
              fontSize="11px"
              color="gray.500"
              mt={1.5}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {t("Across all quiz attempts")}
            </Text>
          </Box>
        </Box>
      </GridItem>

      {/* 2. Questions Solved Card (Practice Sessions) */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 3.5, md: 4 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{
            borderColor: "teal.200",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(20, 184, 166, 0.08)",
          }}
          transition="all 0.2s"
        >
          {/* Single-line header with clean icon */}
          <Flex justify="space-between" align="center" gap={2} mb={2}>
            <Text
              fontSize={{ base: "11px", sm: "11.5px" }}
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.04em"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              flex="1"
            >
              {t("Questions Solved")}
            </Text>
            <Icon as={MdAssignmentTurnedIn} color="teal.600" boxSize="18px" flexShrink={0} />
          </Flex>

          {/* Clean numbers & single-line subtitle */}
          <Box>
            <Text
              fontSize={{ base: "19px", sm: "20px", md: "21px" }}
              color="gray.900"
              fontWeight="normal"
              lineHeight="1"
            >
              {totalQuestionsAnswered}
            </Text>
            <Text
              fontSize="11px"
              color="gray.500"
              mt={1.5}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {t("Across")} {totalPracticeSessions} {t("practice test")}{totalPracticeSessions === 1 ? "" : "s"}
            </Text>
          </Box>
        </Box>
      </GridItem>

      {/* 3. Video Lessons Card */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 3.5, md: 4 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{
            borderColor: "purple.200",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(168, 85, 247, 0.08)",
          }}
          transition="all 0.2s"
        >
          {/* Single-line header with clean icon */}
          <Flex justify="space-between" align="center" gap={2} mb={2}>
            <Text
              fontSize={{ base: "11px", sm: "11.5px" }}
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.04em"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              flex="1"
            >
              {t("Video Lessons")}
            </Text>
            <Icon as={MdPlayLesson} color="purple.600" boxSize="18px" flexShrink={0} />
          </Flex>

          {/* Clean numbers & single-line subtitle */}
          <Box>
            <Text
              fontSize={{ base: "19px", sm: "20px", md: "21px" }}
              color="gray.900"
              fontWeight="normal"
              lineHeight="1"
            >
              {totalVideosWatched}
            </Text>
            <Text
              fontSize="11px"
              color="gray.500"
              mt={1.5}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {t("Completed topics")}
            </Text>
          </Box>
        </Box>
      </GridItem>

      {/* 4. Study Streak Card */}
      <GridItem>
        <Box
          bg="white"
          p={{ base: 3.5, md: 4 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          _hover={{
            borderColor: "orange.200",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.08)",
          }}
          transition="all 0.2s"
        >
          {/* Single-line header with clean icon */}
          <Flex justify="space-between" align="center" gap={2} mb={2}>
            <Text
              fontSize={{ base: "11px", sm: "11.5px" }}
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.04em"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              flex="1"
            >
              {t("Study Streak")}
            </Text>
            <Icon as={PiFlameFill} color="orange.500" boxSize="18px" flexShrink={0} />
          </Flex>

          {/* Clean numbers & single-line subtitle */}
          <Box>
            <Flex align="baseline" gap={1.5}>
              <Text
                fontSize={{ base: "19px", sm: "20px", md: "21px" }}
                color="gray.900"
                fontWeight="normal"
                lineHeight="1"
              >
                {studyStreakDays}
              </Text>
              <Text fontSize="12px" fontWeight="normal" color="orange.600">
                {t("Days")}
              </Text>
            </Flex>
            <Text
              fontSize="11px"
              color="gray.500"
              mt={1.5}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {t("Status")}: {learningStatus}
            </Text>
          </Box>
        </Box>
      </GridItem>
    </Grid>
  );
};
