import { useState } from "react";
import { Box, Flex, Heading, Text, VStack, HStack, Icon, Badge, Button } from "@chakra-ui/react";
import {
  PiClockCounterClockwiseFill,
  PiCalendarDotsFill,
  PiExamFill,
  PiPlayCircleFill,
  PiFireFill,
  PiCaretDownBold,
  PiCaretUpBold,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const RecentActivitySection = ({ intelligence }: Props) => {
  const { t } = useTranslation();
  const { recentActivities, lastActiveDate, studyStreakDays } = intelligence;
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedActivities = isExpanded ? recentActivities : recentActivities.slice(0, 4);

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)">
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <HStack gap={2.5}>
          <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200" boxShadow="0 2px 6px rgba(32, 108, 225, 0.12)">
            <Icon as={PiClockCounterClockwiseFill} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
              {t("Recent Activity")}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("A quick list of the latest quizzes taken and lessons watched.")}
            </Text>
          </Box>
        </HStack>

        <HStack gap={2}>
          {lastActiveDate && (
            <Badge colorPalette="gray" variant="surface" size="sm" borderRadius="full">
              <Icon as={PiCalendarDotsFill} mr={1} color="#206CE1" /> {t("Active")}: {lastActiveDate}
            </Badge>
          )}
          <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full">
            <Icon as={PiFireFill} mr={1} color="orange.500" />
            {studyStreakDays} {t("Day Streak")}
          </Badge>
          {recentActivities.length > 4 && (
            <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
              {isExpanded ? `${recentActivities.length} ${t("total")}` : `4 ${t("of")} ${recentActivities.length}`}
            </Badge>
          )}
        </HStack>
      </Flex>

      {recentActivities.length === 0 ? (
        <Box p={6} textAlign="center" bg="gray.50" borderRadius="xl">
          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            {t("No quizzes or video lessons recorded yet. Completed activities will show up here as your child studies.")}
          </Text>
        </Box>
      ) : (
        <>
          <VStack align="stretch" gap={3}>
            {displayedActivities.map((act) => {
              const isQuiz = act.type === "quiz";
              const icon = isQuiz ? PiExamFill : PiPlayCircleFill;
              const iconColor = isQuiz ? "teal.600" : "purple.600";
              const iconBg = isQuiz ? "teal.50" : "purple.50";
              const iconBorder = isQuiz ? "teal.200" : "purple.200";

              return (
                <Box
                  key={act.id}
                  p={3.5}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  bg="white"
                  _hover={{ bg: "gray.50/80", borderColor: "blue.100" }}
                  transition="all 0.15s"
                >
                  <Flex justify="space-between" align="center" gap={3}>
                    <HStack gap={3}>
                      <Box bg={iconBg} p={2} borderRadius="lg" border="1px solid" borderColor={iconBorder} boxShadow="0 1px 4px rgba(0,0,0,0.06)">
                        <Icon as={icon} color={iconColor} boxSize="16px" />
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="700" color="gray.900">
                          {act.title}
                        </Text>
                        <Text fontSize="11px" color="gray.500" mt={0.5}>
                          {act.subtitle}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack gap={2.5}>
                      {act.score !== undefined && (
                        <Badge
                          colorPalette={act.score >= 75 ? "green" : act.score >= 50 ? "blue" : "orange"}
                          variant="solid"
                          size="sm"
                          borderRadius="md"
                        >
                          {act.score}%
                        </Badge>
                      )}
                      <Text fontSize="11px" color="gray.400" fontWeight="600" whiteSpace="nowrap">
                        {act.formattedDate}
                      </Text>
                    </HStack>
                  </Flex>
                </Box>
              );
            })}
          </VStack>

          {recentActivities.length > 4 && (
            <Flex justify="center" mt={4} pt={3} borderTop="1px solid" borderColor="gray.100">
              <Button
                variant="subtle"
                size="xs"
                colorPalette="blue"
                borderRadius="full"
                px={4}
                py={1.5}
                fontWeight="600"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <HStack gap={1.5}>
                  <Text>
                    {isExpanded
                      ? t("Show fewer activities")
                      : `${t("View all activities")} (${recentActivities.length})`}
                  </Text>
                  <Icon as={isExpanded ? PiCaretUpBold : PiCaretDownBold} boxSize="13px" />
                </HStack>
              </Button>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};
