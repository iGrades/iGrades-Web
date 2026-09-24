import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  Icon,
  Badge,
} from "@chakra-ui/react";
import {
  PiFileTextFill,
  PiPrinterFill,
  PiArrowsClockwiseBold,
  PiCalendarBlankFill,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import AvatarComp from "@/components/avatar";
import { useWeeklyLearningReport } from "@/parent-app/hooks/useWeeklyLearningReport";
import { ExecutiveSummaryCards } from "./ExecutiveSummaryCards";
import { WeeklyOverviewMetrics } from "./WeeklyOverviewMetrics";
import { WeeklySubjectPerformance } from "./WeeklySubjectPerformance";
import { WeeklyTopicInsights } from "./WeeklyTopicInsights";
import { WeeklyRecommendations } from "./WeeklyRecommendations";

type Props = {
  student: any;
  onClose?: () => void;
};

export const WeeklyLearningReportView = ({ student, onClose }: Props) => {
  const { t } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = This Week, 1 = Last Week, etc.
  const { report, loading, refreshReport } = useWeeklyLearningReport(student, weekOffset);

  const studentFirstName = student?.firstname || "Your child";
  const studentFullName = `${student?.firstname || ""} ${student?.lastname || ""}`.trim() || "Student";
  const studentClass = student?.class || "Student";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      border="none"
      boxShadow="0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)"
      p={{ base: 4, md: 6 }}
      mb={8}
      position="relative"
    >
      {/* Top Header Strip */}
      <Flex
        justify="space-between"
        align={{ base: "start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={3}
        pb={4}
        mb={5}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Flex align="center" gap={3}>
          <AvatarComp
            username={studentFullName}
            profileImage={student?.profile_image}
          />
          <Box>
            <Flex align="center" gap={2}>
              <Box bg="blue.50" p={1.5} borderRadius="lg" boxShadow="0 1px 4px rgba(32, 108, 225, 0.15)">
                <Icon as={PiFileTextFill} color="#206CE1" boxSize="18px" />
              </Box>
              <Heading size="md" color="gray.900" fontWeight="800">
                {t("Weekly Learning Report")}
              </Heading>
              <Badge colorPalette="blue" variant="solid" size="sm" borderRadius="full">
                {t("iGrades Intelligence")}
              </Badge>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Prepared for")} <strong>{studentFullName}</strong> ({studentClass})
            </Text>
          </Box>
        </Flex>

        {/* Controls: Week Selector & Actions */}
        <HStack gap={2} wrap="wrap">
          {/* Week Selector Pills */}
          <HStack
            bg="white"
            p={1}
            borderRadius="full"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
          >
            <Button
              size="xs"
              variant={weekOffset === 0 ? "solid" : "ghost"}
              bg={weekOffset === 0 ? "#206CE1" : "transparent"}
              color={weekOffset === 0 ? "white" : "gray.700"}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              px={2.5}
              onClick={() => setWeekOffset(0)}
            >
              {t("This Week")}
            </Button>

            <Button
              size="xs"
              variant={weekOffset === 1 ? "solid" : "ghost"}
              bg={weekOffset === 1 ? "#206CE1" : "transparent"}
              color={weekOffset === 1 ? "white" : "gray.700"}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              px={2.5}
              onClick={() => setWeekOffset(1)}
            >
              {t("Last Week")}
            </Button>

            <Button
              size="xs"
              variant={weekOffset === 2 ? "solid" : "ghost"}
              bg={weekOffset === 2 ? "#206CE1" : "transparent"}
              color={weekOffset === 2 ? "white" : "gray.700"}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              px={2.5}
              onClick={() => setWeekOffset(2)}
            >
              {t("2 Weeks Ago")}
            </Button>
          </HStack>

          <Button
            size="xs"
            variant="outline"
            colorPalette="gray"
            borderRadius="full"
            onClick={refreshReport}
            title={t("Refresh Data")}
          >
            <Icon as={PiArrowsClockwiseBold} />
          </Button>

          <Button
            size="xs"
            variant="outline"
            colorPalette="blue"
            borderRadius="full"
            onClick={handlePrint}
            fontSize="11px"
            fontWeight="600"
          >
            <Icon as={PiPrinterFill} mr={1} boxSize="13px" /> {t("Print Report")}
          </Button>

          {onClose && (
            <Button
              size="xs"
              variant="subtle"
              colorPalette="gray"
              borderRadius="full"
              onClick={onClose}
              fontSize="11px"
            >
              {t("Close")}
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Date Range Subheader Banner */}
      {report && (
        <Flex
          bg="blue.50/70"
          p={3.5}
          borderRadius="2xl"
          border="none"
          boxShadow="0 4px 14px -2px rgba(32, 108, 225, 0.12)"
          justify="space-between"
          align="center"
          mb={5}
          wrap="wrap"
          gap={2}
        >
          <HStack gap={2}>
            <Icon as={PiCalendarBlankFill} color="#206CE1" boxSize="16px" />
            <Text fontSize="xs" fontWeight="700" color="#1E56B3">
              {t("Reporting Period")}: {report.weekLabel}
            </Text>
          </HStack>
          <Text fontSize="11px" color="blue.800" fontWeight="500">
            {report.studyStatusSummary}
          </Text>
        </Flex>
      )}

      {/* Main Content Body */}
      {loading ? (
        <Flex justify="center" align="center" minH="240px">
          <DancingLogoLoader size="md" text={t("Compiling weekly parent learning report...")} />
        </Flex>
      ) : !report ? (
        <Box p={8} textAlign="center" bg="gray.50" borderRadius="xl">
          <Text fontSize="sm" color="gray.500">
            {t("Unable to generate weekly report at this time.")}
          </Text>
        </Box>
      ) : (
        <Box>
          {/* 1. Quick Executive Answers for Parents */}
          <ExecutiveSummaryCards
            executiveAnswers={report.executiveAnswers}
            studentFirstName={studentFirstName}
          />

          {/* 2. Quantitative Learning Activity & Progress Comparison */}
          <WeeklyOverviewMetrics report={report} />

          {/* 3. Subject Performance Breakdown */}
          <WeeklySubjectPerformance
            subjects={report.subjects}
            strongestSubject={report.strongestSubject}
            mostImprovedSubject={report.mostImprovedSubject}
            needsAttentionSubject={report.needsAttentionSubject}
          />

          {/* 4. Granular Topic Insights */}
          <WeeklyTopicInsights
            improvedTopics={report.improvedTopics}
            topicsRequiringPractice={report.topicsRequiringPractice}
            topicsWithRepeatedMistakes={report.topicsWithRepeatedMistakes}
          />

          {/* 5. Recommended Actions for Parents */}
          <WeeklyRecommendations
            recommendations={report.recommendations}
            studentFirstName={studentFirstName}
          />
        </Box>
      )}
    </Box>
  );
};
