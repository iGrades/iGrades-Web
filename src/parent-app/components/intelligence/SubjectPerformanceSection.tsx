import { useState, useMemo } from "react";
import { Box, Flex, Heading, Text, HStack, Badge, Icon, VStack, Button } from "@chakra-ui/react";
import { FiMinus } from "react-icons/fi";
import {
  PiBookOpenTextFill,
  PiChartLineUpFill,
  PiTrendDownBold,
  PiClockFill,
  PiCaretDownBold,
  PiCaretUpBold,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import type { SubjectIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { filterRegisteredSubjects } from "@/utils/subjectMatching";

type Props = {
  subjects: SubjectIntelligence[];
  onSelectSubject?: (subjectId: string) => void;
  registeredCourses?: string[] | string | null;
};

export const SubjectPerformanceSection = ({ subjects, onSelectSubject, registeredCourses }: Props) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedSubjects = useMemo(() => {
    if (registeredCourses !== undefined && registeredCourses !== null) {
      return filterRegisteredSubjects(subjects, registeredCourses);
    }
    return subjects;
  }, [subjects, registeredCourses]);

  const visibleSubjects = isExpanded ? displayedSubjects : displayedSubjects.slice(0, 5);

  const getStatusBadge = (status: SubjectIntelligence["status"]) => {
    const badgeStyle = {
      fontSize: "8px",
      lineHeight: "10px",
      h: "14px",
      px: "4px",
      py: "0px",
      borderRadius: "full",
      fontWeight: "700" as const,
    };
    switch (status) {
      case "strong":
        return <Badge colorPalette="green" variant="solid" size="2xs" {...badgeStyle}>{t("Strong")}</Badge>;
      case "good":
        return <Badge colorPalette="blue" variant="subtle" size="2xs" {...badgeStyle}>{t("On Track")}</Badge>;
      case "fair":
        return <Badge colorPalette="yellow" variant="subtle" size="2xs" {...badgeStyle}>{t("Fair")}</Badge>;
      case "needs_attention":
        return <Badge colorPalette="orange" variant="subtle" size="2xs" {...badgeStyle}>{t("Practice")}</Badge>;
      default:
        return <Badge colorPalette="gray" variant="surface" size="2xs" {...badgeStyle}>{t("New")}</Badge>;
    }
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 75) return "#10B981"; // green
    if (accuracy >= 60) return "#206CE1"; // brand blue
    if (accuracy >= 45) return "#F59E0B"; // amber
    return "#EF4444"; // red
  };

  return (
    <Box
      bg={{ base: "white", _dark: "#121212" }}
      p={{ base: 4.5, md: 6 }}
      borderRadius="2xl"
      border="1px solid"
      borderColor={{ base: "gray.100", _dark: "#262626" }}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.04)"
      mb={6}
    >
      {/* Header: Subject Performance text and subjects count tag */}
      <Flex justify="space-between" align="center" mb={3.5} wrap="nowrap" gap={2}>
        <HStack gap={2} flexShrink={0} minW={0} align="center">
          <Icon as={PiBookOpenTextFill} color="#206CE1" boxSize="24px" flexShrink={0} />
          <Heading
            size={{ base: "md", md: "lg" }}
            color="gray.900"
            fontWeight="800"
            whiteSpace="nowrap"
            lineHeight="normal"
          >
            {t("Subject Performance")}
          </Heading>
        </HStack>
        <Badge
          colorPalette="gray"
          variant="surface"
          size="sm"
          fontSize="11px"
          h="20px"
          lineHeight="1"
          borderRadius="full"
          px={2.5}
          py={0.5}
          flexShrink={0}
          whiteSpace="nowrap"
        >
          {displayedSubjects.length} {displayedSubjects.length === 1 ? t("Subject") : t("Subjects")}
        </Badge>
      </Flex>

      {displayedSubjects.length === 0 ? (
        <Box p={5} textAlign="center" bg="gray.50" borderRadius="xl">
          <Text fontSize="sm" color="gray.500">
            {t("No subjects registered yet. Add subjects to view detailed scores and progress.")}
          </Text>
        </Box>
      ) : (
        <>
          {/* One Subject Per Line - Expanded and Highly Legible */}
          <VStack gap={2.5} align="stretch" w="full">
            {visibleSubjects.map((sub) => {
              const trendIcon = sub.trend === "up" ? PiChartLineUpFill : sub.trend === "down" ? PiTrendDownBold : FiMinus;
              const trendColor = sub.trend === "up" ? "green.600" : sub.trend === "down" ? "red.600" : "gray.500";
              const trendText =
                sub.trend === "up"
                  ? `+${sub.trendDiff}%`
                  : sub.trend === "down"
                  ? `${sub.trendDiff}%`
                  : sub.trend === "stable"
                  ? t("Stable")
                  : t("New");

              return (
                <Flex
                  key={sub.subjectId}
                  align="center"
                  justify="space-between"
                  px={{ base: 3.5, md: 4 }}
                  py={3}
                  bg={{ base: "gray.50/50", _dark: "#1A1A1A" }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={{ base: "gray.100", _dark: "#262626" }}
                  onClick={() => onSelectSubject?.(sub.subjectId)}
                  cursor={onSelectSubject ? "pointer" : "default"}
                  _hover={
                    onSelectSubject
                      ? {
                          borderColor: "blue.300",
                          bg: "blue.50/20",
                          transform: "translateY(-1px)",
                          boxShadow: "0 2px 8px rgba(32, 108, 225, 0.08)",
                        }
                      : {}
                  }
                  transition="all 0.15s ease"
                  wrap="nowrap"
                  gap={{ base: 2.5, md: 3.5 }}
                  minH="46px"
                >
                  {/* Left: Subject Name & Status Badge */}
                  <HStack gap={2} minW={0} flex={{ base: "1 1 auto", sm: "0 0 190px", md: "0 0 230px" }}>
                    <Text
                      fontSize="14px"
                      fontWeight="700"
                      color="gray.900"
                      textTransform="capitalize"
                      truncate
                      whiteSpace="nowrap"
                      title={sub.subjectName}
                    >
                      {sub.subjectName}
                    </Text>
                    <Box flexShrink={0}>{getStatusBadge(sub.status)}</Box>
                  </HStack>

                  {/* Mid-Left: Tests & Questions count */}
                  <Text
                    fontSize="12px"
                    color="gray.500"
                    flexShrink={0}
                    display={{ base: "none", sm: "block" }}
                    w={{ sm: "85px", md: "105px" }}
                    truncate
                  >
                    {sub.sessionsCount} {t("tests")} • {sub.questionsAttempted} {t("Qs")}
                  </Text>

                  {/* Center: Slim Progress Bar */}
                  <Box
                    flex="1"
                    maxW={{ base: "70px", sm: "120px", md: "180px" }}
                    minW={{ base: "45px", sm: "70px" }}
                    bg="gray.200/80"
                    h="6px"
                    borderRadius="full"
                    overflow="hidden"
                    flexShrink={1}
                  >
                    <Box
                      w={`${Math.min(100, Math.max(0, sub.sessionsCount > 0 ? sub.accuracy : 0))}%`}
                      h="100%"
                      bg={getProgressColor(sub.accuracy)}
                      borderRadius="full"
                    />
                  </Box>

                  {/* Score & Grade Badge */}
                  <HStack gap={1.5} align="center" flexShrink={0} minW="60px" justify="flex-end">
                    <Text fontSize="14px" fontWeight="800" color="gray.900">
                      {sub.sessionsCount > 0 ? `${sub.accuracy}%` : "—"}
                    </Text>
                    {sub.sessionsCount > 0 && (
                      <Badge
                        colorPalette={
                          sub.accuracy >= 80
                            ? "green"
                            : sub.accuracy >= 65
                            ? "blue"
                            : sub.accuracy >= 50
                            ? "yellow"
                            : "orange"
                        }
                        size="xs"
                        variant="solid"
                        borderRadius="sm"
                        px={1.5}
                        fontSize="10px"
                        fontWeight="700"
                      >
                        {sub.grade || (sub.accuracy >= 75 ? "A" : sub.accuracy >= 60 ? "B" : sub.accuracy >= 45 ? "C" : "D")}
                      </Badge>
                    )}
                  </HStack>

                  {/* Right: Trend Indicator */}
                  <HStack
                    gap={1}
                    color={trendColor}
                    fontWeight="700"
                    fontSize="11.5px"
                    flexShrink={0}
                    minW={{ base: "48px", md: "58px" }}
                    justify="flex-end"
                  >
                    <Icon as={trendIcon} boxSize="10px" />
                    <Text>{trendText}</Text>
                  </HStack>

                  {/* Rightmost: Last Activity (Desktop/Tablet) */}
                  <Box display={{ base: "none", md: "block" }} flexShrink={0} w="70px" textAlign="right">
                    {sub.lastActivity ? (
                      <HStack gap={1} color="gray.400" fontSize="10px" justify="flex-end">
                        <Icon as={PiClockFill} boxSize="10px" />
                        <Text truncate>{sub.lastActivity}</Text>
                      </HStack>
                    ) : (
                      <Text color="gray.400" fontSize="10px" fontStyle="italic">
                        {t("Not started")}
                      </Text>
                    )}
                  </Box>
                </Flex>
              );
            })}
          </VStack>

          {displayedSubjects.length > 5 && (
            <Flex justify="center" mt={2}>
              <Button
                variant="subtle"
                size="xs"
                colorPalette="blue"
                borderRadius="full"
                px={2.5}
                py={0.5}
                h="22px"
                fontSize="10px"
                fontWeight="600"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <HStack gap={1}>
                  <Text>
                    {isExpanded
                      ? t("Show fewer subjects")
                      : `${t("View all")} ${displayedSubjects.length} ${t("subjects")}`}
                  </Text>
                  <Icon as={isExpanded ? PiCaretUpBold : PiCaretDownBold} boxSize="10px" />
                </HStack>
              </Button>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default SubjectPerformanceSection;
