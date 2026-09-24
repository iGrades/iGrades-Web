import { Box, Flex, Heading, Text, HStack, Button, Badge, Icon } from "@chakra-ui/react";
import { PiCalendarDotsFill, PiChartLineUpFill, PiFileTextFill, PiArrowRightBold } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { useWeeklyLearningReport } from "@/parent-app/hooks/useWeeklyLearningReport";

type Props = {
  student: any;
  onOpenFullReport: () => void;
};

export const WeeklyReportBannerCard = ({ student, onOpenFullReport }: Props) => {
  const { t } = useTranslation();
  const { report, loading } = useWeeklyLearningReport(student, 0);

  if (loading || !report) {
    return null;
  }

  const studentFirstName = student?.firstname || t("Your child");

  return (
    <Box
      bg="linear-gradient(135deg, #1E56B3 0%, #206CE1 50%, #3B82F6 100%)"
      color="white"
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      boxShadow="0 10px 28px -4px rgba(32, 108, 225, 0.28), 0 4px 10px -2px rgba(32, 108, 225, 0.14)"
      _hover={{
        boxShadow: "0 16px 36px -4px rgba(32, 108, 225, 0.35), 0 6px 14px -2px rgba(32, 108, 225, 0.18)",
        transform: "translateY(-2px)",
      }}
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      mb={6}
      position="relative"
      overflow="hidden"
    >
      {/* Subtle Background Pattern */}
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        w="160px"
        h="160px"
        bg="white"
        opacity="0.06"
        borderRadius="full"
        pointerEvents="none"
      />

      <Flex
        justify="space-between"
        align={{ base: "start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box maxW="2xl">
          <HStack gap={2} mb={1.5}>
            <Badge
              bg="rgba(255, 255, 255, 0.2)"
              color="white"
              size="xs"
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontSize="10px"
              fontWeight="700"
            >
              <Icon as={PiCalendarDotsFill} mr={1} boxSize="11px" />
              {report.weekLabel}
            </Badge>

            {report.hasStudied && report.accuracyDelta !== null && report.accuracyDelta > 0 && (
              <Badge
                bg="#10B981"
                color="white"
                size="xs"
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="10px"
                fontWeight="700"
              >
                <Icon as={PiChartLineUpFill} mr={1} boxSize="11px" />
                +{report.accuracyDelta}% {t("Improved")}
              </Badge>
            )}
          </HStack>

          <Heading size={{ base: "sm", md: "md" }} fontWeight="800" letterSpacing="-0.01em">
            {t("Weekly Learning Report")} {t("for")} {studentFirstName}
          </Heading>

          <Text fontSize="xs" opacity={0.9} mt={1} lineHeight="tall">
            {report.hasStudied
              ? `${report.totalQuestionsAttempted} ${t("questions attempted")} (${report.overallAccuracy}% ${t("accuracy")}) ${t("across")} ${report.totalSessions} ${t("study session")}${report.totalSessions === 1 ? "" : "s"} ${t("this week")}.`
              : `${t("Review")} ${studentFirstName}'s ${t("recent study rhythm, top subject strengths, and recommended practice steps.")}`}
          </Text>
        </Box>

        <Button
          bg="white"
          color="#1E56B3"
          size="sm"
          borderRadius="xl"
          fontWeight="800"
          fontSize="xs"
          px={4}
          py={2}
          onClick={onOpenFullReport}
          _hover={{ bg: "blue.50", transform: "translateY(-1px)" }}
          transition="all 0.2s"
          shadow="md"
        >
          <Icon as={PiFileTextFill} mr={1.5} boxSize="14px" />
          {t("View Full Weekly Report")}
          <Icon as={PiArrowRightBold} ml={1.5} boxSize="14px" />
        </Button>
      </Flex>
    </Box>
  );
};
