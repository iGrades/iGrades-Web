import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, HStack, Button, Badge, Icon, IconButton } from "@chakra-ui/react";
import {
  PiCalendarDotsFill,
  PiChartLineUpFill,
  PiArrowRightBold,
  PiXBold,
} from "react-icons/pi";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { useWeeklyLearningReport } from "@/parent-app/hooks/useWeeklyLearningReport";
import { useStudentsData } from "@/parent-app/context/studentsDataContext";
import { useNavigationStore } from "@/store/usenavigationStore";

export const WeeklyReportPopupBanner = () => {
  const { t } = useTranslation();
  const { studentsData } = useStudentsData();
  const setCurrentParentPage = useNavigationStore((s) => s.setCurrentParentPage);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const primaryStudent = studentsData && studentsData.length > 0 ? studentsData[0] : null;
  const { report, loading } = useWeeklyLearningReport(primaryStudent, 0);

  // Trigger popup 5 seconds after parent arrives/signs in, and auto-dismiss after 5 seconds
  useEffect(() => {
    // Check if dismissed in this session
    const dismissedSession = sessionStorage.getItem("weekly_report_popup_dismissed");
    if (dismissedSession) {
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const showTimer = setTimeout(() => {
      setIsVisible(true);
      // Auto-dismiss 5 seconds after appearing
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setIsDismissed(true);
      }, 5000);
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("weekly_report_popup_dismissed", "true");
  };

  const handleViewReport = () => {
    handleDismiss();
    setCurrentParentPage("weekly_report");
  };

  const currentParentPage = useNavigationStore((s) => s.currentParentPage);

  if (!isVisible || isDismissed || loading || !report || !primaryStudent || currentParentPage === "weekly_report") {
    return null;
  }

  const studentFirstName = primaryStudent?.firstname || t("Your child");

  return (
    <Box
      position="fixed"
      bottom={{ base: "72px", md: "24px" }}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1500}
      w={{ base: "calc(100% - 24px)", sm: "92%", md: "780px", lg: "860px" }}
      maxW="95vw"
      animation="slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
    >
      <Box
        bg="linear-gradient(135deg, #1E56B3 0%, #206CE1 50%, #3B82F6 100%)"
        color="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        boxShadow="0 20px 45px -8px rgba(32, 108, 225, 0.45), 0 8px 18px -4px rgba(32, 108, 225, 0.25)"
        position="relative"
        overflow="hidden"
        border="1px solid"
        borderColor="white/20"
      >
        {/* Close Button */}
        <IconButton
          aria-label="Close weekly report popup"
          variant="ghost"
          size="xs"
          position="absolute"
          top={3}
          right={3}
          color="white/80"
          _hover={{ bg: "white/20", color: "white" }}
          borderRadius="full"
          onClick={handleDismiss}
          zIndex={2}
        >
          <Icon as={PiXBold} boxSize="13px" />
        </IconButton>

        {/* Subtle Background Pattern */}
        <Box
          position="absolute"
          top="-20px"
          right="-20px"
          w="160px"
          h="160px"
          bg="white"
          opacity="0.07"
          borderRadius="full"
          pointerEvents="none"
        />

        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          pr={{ base: 6, md: 8 }}
        >
          <Box maxW="2xl">
            <HStack gap={2} mb={1.5} flexWrap="wrap">
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

            <Text fontSize="xs" opacity={0.92} mt={1} lineHeight="tall">
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
            py={2.5}
            onClick={handleViewReport}
            _hover={{ bg: "blue.50", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            shadow="md"
            flexShrink={0}
          >
            <Icon as={BsFileEarmarkBarGraphFill} mr={1.5} boxSize="14px" />
            {t("View Weekly Report")}
            <Icon as={PiArrowRightBold} ml={1.5} boxSize="14px" />
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
