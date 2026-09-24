import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FiMinus } from "react-icons/fi";
import {
  PiChartLineUpFill,
  PiTrendDownBold,
  PiTrophyFill,
  PiCheckCircleFill,
  PiPulseFill,
  PiTargetBold,
} from "react-icons/pi";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";
import { courseConfig } from "@/student-app/utils/courseConstants";

type Props = {
  intelligence: StudentIntelligence;
};

const getSubjectColor = (name?: string): string => {
  if (!name || name === "all") return "#0D9488";
  const key = name.toLowerCase().trim();
  return courseConfig[key]?.color || "#0D9488";
};

export const ProgressTrendsSection = ({ intelligence }: Props) => {
  const { t } = useTranslation();
  const { trendHistory = [], subjects = [], overallTrend, overallTrendDiff } = intelligence;

  // Selected subject filter ("all" or subject name / id)
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  // View mode: "attempt" (individual quiz points) or "daily" (daily averages)
  const [viewMode, setViewMode] = useState<"attempt" | "daily">("attempt");
  // Benchmark reference lines toggle
  const [showBenchmarks, setShowBenchmarks] = useState<boolean>(true);

  // Active subjects with at least one recorded session
  const activeSubjects = useMemo(() => {
    return subjects.filter((s) => s.sessionsCount > 0);
  }, [subjects]);

  // Filter raw points by selected subject
  const subjectFilteredPoints = useMemo(() => {
    if (selectedSubject === "all") {
      return trendHistory;
    }
    return trendHistory.filter((pt) => {
      const pSubName = (pt.subjectName || "").toLowerCase().trim();
      const pSubId = pt.subjectId;
      const target = selectedSubject.toLowerCase().trim();
      return pSubId === selectedSubject || pSubName === target;
    });
  }, [trendHistory, selectedSubject]);

  // Aggregate points if "daily" view mode is chosen
  const chartData = useMemo(() => {
    if (viewMode === "attempt") {
      return subjectFilteredPoints.map((pt, idx) => {
        const rawScore = typeof pt.score === "number" ? pt.score : pt.averageScore ?? 0;
        const prevScore = idx > 0
          ? (typeof subjectFilteredPoints[idx - 1].score === "number"
              ? subjectFilteredPoints[idx - 1].score
              : subjectFilteredPoints[idx - 1].averageScore ?? 0)
          : null;
        const delta = prevScore !== null ? rawScore - prevScore : 0;

        return {
          id: pt.id || `pt-${idx}`,
          displayLabel: pt.period || pt.dateLabel || `Quiz ${idx + 1}`,
          fullDate: pt.fullDate || pt.dateLabel || pt.period,
          dateLabel: pt.dateLabel || pt.period,
          timeLabel: pt.timeLabel,
          score: rawScore,
          delta,
          subjectName: pt.subjectName || "All Subjects",
          grade: pt.grade || (rawScore >= 70 ? "A" : rawScore >= 50 ? "C" : "F"),
          gradeLabel: pt.gradeLabel || (rawScore >= 70 ? "Proficient" : rawScore >= 50 ? "Passing" : "Needs Review"),
          totalQuestions: pt.totalQuestions,
          attemptIndex: idx + 1,
        };
      });
    }

    // Daily average aggregation
    const dayMap = new Map<string, { totalScore: number; count: number; dateStr: string; fullDate: string }>();
    subjectFilteredPoints.forEach((pt) => {
      const key = pt.dateLabel || pt.period || "Day";
      const s = typeof pt.score === "number" ? pt.score : pt.averageScore ?? 0;
      const curr = dayMap.get(key) || { totalScore: 0, count: 0, dateStr: key, fullDate: pt.fullDate || key };
      curr.totalScore += s;
      curr.count += 1;
      dayMap.set(key, curr);
    });

    const dailyPoints: any[] = [];
    let prevAvg: number | null = null;
    let idx = 0;
    dayMap.forEach((val, key) => {
      const avg = Math.round(val.totalScore / val.count);
      const delta = prevAvg !== null ? avg - prevAvg : 0;
      prevAvg = avg;
      idx += 1;
      dailyPoints.push({
        id: `day-${key}`,
        displayLabel: key,
        fullDate: val.fullDate,
        dateLabel: key,
        score: avg,
        delta,
        subjectName: selectedSubject === "all" ? "All Subjects" : selectedSubject,
        grade: avg >= 70 ? "A" : avg >= 50 ? "C" : "F",
        gradeLabel: avg >= 70 ? "Proficient" : avg >= 50 ? "Passing" : "Needs Review",
        quizzesCount: val.count,
        attemptIndex: idx,
      });
    });

    return dailyPoints;
  }, [subjectFilteredPoints, viewMode, selectedSubject]);

  // Compute summary statistics for the active view
  const stats = useMemo(() => {
    const total = chartData.length;
    if (total === 0) {
      return {
        totalAttempts: 0,
        latestScore: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        overallChange: 0,
        trendDirection: "stable" as "up" | "down" | "stable",
      };
    }

    const scores = chartData.map((d) => d.score);
    const latestScore = scores[scores.length - 1];
    const firstScore = scores[0];
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const overallChange = total >= 2 ? latestScore - firstScore : 0;
    const trendDirection = overallChange > 2 ? "up" : overallChange < -2 ? "down" : "stable";

    return {
      totalAttempts: total,
      latestScore,
      averageScore,
      highestScore,
      lowestScore,
      overallChange,
      trendDirection,
    };
  }, [chartData]);

  // Dynamic stroke color based on chosen subject
  const activeHexColor = useMemo(() => {
    if (selectedSubject === "all") return "#0D9488";
    return getSubjectColor(selectedSubject);
  }, [selectedSubject]);
  const activeColor = activeHexColor;

  // Modern tooltip matching the sleek admin chart style
  const CustomTrendsTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0]?.payload;
    if (!pt) return null;

    return (
      <Box
        bg="#0F172A"
        p={3}
        borderRadius="12px"
        border="none"
        color="white"
        fontSize="12px"
        boxShadow="0 10px 25px -5px rgba(0,0,0,0.3)"
        minW="160px"
      >
        <Text fontWeight="700" fontSize="13px" color="white" mb={0.5}>
          {pt.displayLabel}
        </Text>
        <Text fontSize="11px" color="#94A3B8" mb={2}>
          {pt.fullDate || pt.dateLabel}
        </Text>
        <Flex align="center" justify="space-between" mb={1.5}>
          <Text fontSize="12px" color="#CBD5E1">{t("Score")}:</Text>
          <Text fontSize="13px" fontWeight="800" color={activeHexColor}>
            {pt.score}%
          </Text>
        </Flex>
        {pt.subjectName && (
          <Flex align="center" justify="space-between" mb={1.5}>
            <Text fontSize="11px" color="#94A3B8">{t("Subject")}:</Text>
            <Text fontSize="11px" fontWeight="600" color="#E2E8F0">
              {pt.subjectName}
            </Text>
          </Flex>
        )}
        {pt.grade && (
          <Flex align="center" justify="space-between" pt={1.5} borderTop="1px solid rgba(255,255,255,0.1)">
            <Text fontSize="11px" color="#94A3B8">{t("Performance")}:</Text>
            <Text
              fontSize="11px"
              fontWeight="700"
              color={pt.score >= 70 ? "#34D399" : pt.score >= 50 ? "#FBBF24" : "#F87171"}
            >
              {t("Grade")} {pt.grade} ({pt.gradeLabel})
            </Text>
          </Flex>
        )}
        {pt.delta !== 0 && (
          <Text
            fontSize="10px"
            fontWeight="600"
            color={pt.delta > 0 ? "#34D399" : "#F87171"}
            mt={1.5}
          >
            {pt.delta > 0 ? `+${pt.delta}% from previous` : `${pt.delta}% from previous`}
          </Text>
        )}
      </Box>
    );
  };

  return (
    <Box
      bg="white"
      p={{ base: 4, md: 6 }}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
      mb={6}
    >
      {/* Header with Title and Global Trajectory */}
      <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} mb={4} wrap="wrap" gap={3}>
        <HStack gap={2.5}>
          <Box bg="teal.50" p={2} borderRadius="xl" border="1px solid" borderColor="teal.200" boxShadow="0 2px 6px rgba(13, 148, 136, 0.15)">
            <Icon as={PiChartLineUpFill} color="#0D9488" boxSize="18px" />
          </Box>
          <Box>
            <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
              {t("Score Progress Over Time")}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {t("Chronological score progression across practice tests and exams.")}
            </Text>
          </Box>
        </HStack>

        <HStack gap={2} wrap="wrap">
          {stats.totalAttempts >= 2 && (
            <Badge
              colorPalette={stats.trendDirection === "up" ? "green" : stats.trendDirection === "down" ? "red" : "blue"}
              variant="subtle"
              size="sm"
              borderRadius="full"
              px={2.5}
              py={1}
            >
              <HStack gap={1}>
                <Icon as={stats.trendDirection === "up" ? PiChartLineUpFill : stats.trendDirection === "down" ? PiTrendDownBold : FiMinus} />
                <Text>
                  {stats.trendDirection === "up"
                    ? `+${stats.overallChange}% ${t("Overall Improvement")}`
                    : stats.trendDirection === "down"
                    ? `${stats.overallChange}% ${t("Change")}`
                    : t("Steady Progress")}
                </Text>
              </HStack>
            </Badge>
          )}

          <Badge
            colorPalette={overallTrend === "up" ? "green" : overallTrend === "down" ? "red" : "blue"}
            variant="surface"
            size="sm"
            borderRadius="full"
            px={2.5}
            py={1}
          >
            {overallTrend === "up"
              ? `${t("Overall Trend")}: +${overallTrendDiff}%`
              : overallTrend === "down"
              ? `${t("Overall Trend")}: ${overallTrendDiff}%`
              : `${t("Overall Trend")}: ${t("Steady")}`}
          </Badge>
        </HStack>
      </Flex>

      {/* Summary Stat Metric Cards Strip */}
      {chartData.length > 0 && (
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }}
          gap={2.5}
          p={3}
          bg="gray.50/80"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.100"
          mb={4}
        >
          <Box px={2}>
            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Latest Score")}
            </Text>
            <HStack align="baseline" gap={1.5} mt={0.5}>
              <Text fontSize="lg" fontWeight="900" color="gray.900">
                {stats.latestScore}%
              </Text>
              {stats.totalAttempts >= 2 && (
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  color={stats.overallChange >= 0 ? "green.600" : "red.600"}
                >
                  {stats.overallChange >= 0 ? `+${stats.overallChange}%` : `${stats.overallChange}%`}
                </Text>
              )}
            </HStack>
          </Box>

          <Box px={2}>
            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Average Score")}
            </Text>
            <Text fontSize="lg" fontWeight="900" color="gray.900" mt={0.5}>
              {stats.averageScore}%
            </Text>
          </Box>

          <Box px={2}>
            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Highest Score")}
            </Text>
            <HStack align="baseline" gap={1} mt={0.5}>
              <Text fontSize="lg" fontWeight="900" color="green.700">
                {stats.highestScore}%
              </Text>
              <Icon as={PiTrophyFill} color="green.600" boxSize="13px" />
            </HStack>
          </Box>

          <Box px={2}>
            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Quizzes Plotted")}
            </Text>
            <Text fontSize="lg" fontWeight="900" color="gray.900" mt={0.5}>
              {stats.totalAttempts} {stats.totalAttempts === 1 ? t("Quiz") : t("Quizzes")}
            </Text>
          </Box>
        </Grid>
      )}

      {/* Controls: Subject Filter Pills and View Mode Toggle */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={2.5}
        mb={3.5}
        pb={2.5}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        {/* Subject Filter Pills */}
        <HStack gap={1.5} wrap="wrap" flex="1">
          <Box
            as="button"
            onClick={() => setSelectedSubject("all")}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="700"
            transition="all 0.15s ease"
            cursor="pointer"
            bg={selectedSubject === "all" ? "#206CE1" : "gray.100"}
            color={selectedSubject === "all" ? "white" : "gray.700"}
            _hover={{ bg: selectedSubject === "all" ? "#1956B8" : "gray.200" }}
          >
            {t("All Subjects")} ({trendHistory.length})
          </Box>

          {activeSubjects.map((sub) => {
            const isSelected =
              selectedSubject.toLowerCase() === sub.subjectName.toLowerCase() ||
              selectedSubject === sub.subjectId;
            const subColor = getSubjectColor(sub.subjectName);

            return (
              <Box
                as="button"
                key={sub.subjectId}
                onClick={() => setSelectedSubject(sub.subjectName)}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="700"
                transition="all 0.15s ease"
                cursor="pointer"
                bg={isSelected ? subColor : "gray.50"}
                color={isSelected ? "white" : "gray.700"}
                border="1px solid"
                borderColor={isSelected ? subColor : "gray.200"}
                _hover={{ bg: isSelected ? subColor : "gray.100" }}
              >
                <HStack gap={1.5}>
                  <Box w="6px" h="6px" borderRadius="full" bg={isSelected ? "white" : subColor} />
                  <Text textTransform="capitalize">
                    {sub.subjectName} ({sub.sessionsCount})
                  </Text>
                </HStack>
              </Box>
            );
          })}
        </HStack>

        {/* View Mode & Benchmarks Controls */}
        <HStack gap={2}>
          <HStack
            bg="gray.100"
            p="2px"
            borderRadius="lg"
            fontSize="11px"
            fontWeight="700"
          >
            <Box
              as="button"
              px={2.5}
              py={1}
              borderRadius="md"
              cursor="pointer"
              bg={viewMode === "attempt" ? "white" : "transparent"}
              color={viewMode === "attempt" ? "gray.900" : "gray.500"}
              boxShadow={viewMode === "attempt" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
              onClick={() => setViewMode("attempt")}
            >
              {t("Every Quiz")}
            </Box>
            <Box
              as="button"
              px={2.5}
              py={1}
              borderRadius="md"
              cursor="pointer"
              bg={viewMode === "daily" ? "white" : "transparent"}
              color={viewMode === "daily" ? "gray.900" : "gray.500"}
              boxShadow={viewMode === "daily" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
              onClick={() => setViewMode("daily")}
            >
              {t("Daily Average")}
            </Box>
          </HStack>

          <Box
            as="button"
            onClick={() => setShowBenchmarks(!showBenchmarks)}
            px={2.5}
            py={1}
            borderRadius="lg"
            fontSize="11px"
            fontWeight="600"
            border="1px solid"
            borderColor={showBenchmarks ? "green.300" : "gray.200"}
            bg={showBenchmarks ? "green.50" : "white"}
            color={showBenchmarks ? "green.700" : "gray.600"}
            cursor="pointer"
            _hover={{ bg: showBenchmarks ? "green.100" : "gray.50" }}
          >
            <HStack gap={1}>
              <Icon as={PiTargetBold} boxSize="12px" />
              <Text display={{ base: "none", sm: "inline" }}>{t("Benchmarks")}</Text>
            </HStack>
          </Box>
        </HStack>
      </Flex>

      {/* Score Trajectory Area Chart */}
      {chartData.length > 0 ? (
        <Box position="relative">
          <Box w="100%" h={{ base: "260px", md: "300px" }} position="relative" mb={3}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeHexColor} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={activeHexColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  dataKey="displayLabel"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />

                {/* Benchmark Guide Reference Lines */}
                {showBenchmarks && (
                  <ReferenceLine
                    y={70}
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Target 70%",
                      fill: "#059669",
                      fontSize: 10,
                      fontWeight: 700,
                      position: "insideTopRight",
                      offset: 8,
                    }}
                  />
                )}

                {showBenchmarks && (
                  <ReferenceLine
                    y={50}
                    stroke="#F59E0B"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: "Pass 50%",
                      fill: "#D97706",
                      fontSize: 10,
                      fontWeight: 600,
                      position: "insideBottomRight",
                      offset: 4,
                    }}
                  />
                )}

                {/* If only 1 point exists, draw a baseline guideline to give it clear visual presence */}
                {chartData.length === 1 && (
                  <ReferenceLine
                    y={chartData[0].score}
                    stroke={activeHexColor}
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                )}

                <Tooltip content={<CustomTrendsTooltip />} />

                <Area
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke={activeHexColor}
                  strokeWidth={2.5}
                  fill="url(#scoreAreaGradient)"
                  dot={{ r: 4, fill: activeHexColor, strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6, fill: activeHexColor, stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Single Quiz Informative Banner */}
          {chartData.length === 1 && (
            <HStack
              bg="blue.50"
              p={3}
              borderRadius="xl"
              border="1px solid"
              borderColor="blue.200"
              gap={2}
              mb={3}
            >
              <Icon as={PiCheckCircleFill} color="#206CE1" boxSize="16px" flexShrink={0} />
              <Text fontSize="xs" color="blue.900" fontWeight="600">
                First quiz attempt recorded ({chartData[0].score}% in {chartData[0].subjectName}). As more practice tests are taken, the score progression curve will connect here in real-time!
              </Text>
            </HStack>
          )}

          {/* Legend Strip */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={2} px={1} mb={4} fontSize="11px" color="gray.500">
            <HStack gap={4} wrap="wrap">
              <HStack gap={1.5}>
                <Box w="12px" h="3px" bg={activeColor} borderRadius="full" />
                <Text fontWeight="600" color="gray.700">
                  {selectedSubject === "all" ? t("Quiz Score Progress") : `${selectedSubject} ${t("Trend")}`}
                </Text>
              </HStack>

              {showBenchmarks && (
                <>
                  <HStack gap={1.5}>
                    <Box w="12px" h="1px" borderTop="2px dashed #10B981" />
                    <Text color="emerald.700">{t("Mastery Target")} (70%)</Text>
                  </HStack>
                  <HStack gap={1.5}>
                    <Box w="12px" h="1px" borderTop="2px dashed #F59E0B" />
                    <Text color="amber.700">{t("Passing Mark")} (50%)</Text>
                  </HStack>
                </>
              )}
            </HStack>

            <Text fontSize="10px" color="gray.400">
              {t("Hover over points to inspect details")}
            </Text>
          </Flex>
        </Box>
      ) : (
        <Box p={8} textAlign="center" bg="gray.50" borderRadius="xl" mb={5}>
          <Icon as={PiPulseFill} color="gray.400" boxSize="28px" mb={2} />
          <Heading size="xs" color="gray.700" fontWeight="700" mb={1}>
            {t("No Quiz Data for")} {selectedSubject === "all" ? t("this student") : selectedSubject}
          </Heading>
          <Text fontSize="xs" color="gray.500" maxW="420px" mx="auto">
            {selectedSubject === "all"
              ? t("When your child takes quizzes, their score progression line will appear here.")
              : `${t("No completed quizzes recorded in")} ${selectedSubject} ${t("yet. Select All Subjects or take a practice quiz.")}`}
          </Text>
          {selectedSubject !== "all" && (
            <Box
              as="button"
              mt={3}
              onClick={() => setSelectedSubject("all")}
              px={3}
              py={1.5}
              bg="#206CE1"
              color="white"
              borderRadius="lg"
              fontSize="xs"
              fontWeight="700"
              cursor="pointer"
              _hover={{ bg: "#1956B8" }}
            >
              {t("Back to All Subjects")}
            </Box>
          )}
        </Box>
      )}

      {/* Subject by Subject Trend Cards */}
      {activeSubjects.length > 0 && (
        <Box pt={4} borderTop="1px solid" borderColor="gray.100">
          <Flex justify="space-between" align="center" mb={3}>
            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
              {t("Subject Trajectory Breakdown")}
            </Text>
            <Text fontSize="10px" color="gray.400">
              {t("Click a card to filter trend graph")}
            </Text>
          </Flex>

          <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={3}>
            {activeSubjects.map((sub) => {
              const trendIcon = sub.trend === "up" ? PiChartLineUpFill : sub.trend === "down" ? PiTrendDownBold : FiMinus;
              const trendCol = sub.trend === "up" ? "green.600" : sub.trend === "down" ? "red.600" : "gray.600";
              const subColor = getSubjectColor(sub.subjectName);
              const isSelected =
                selectedSubject.toLowerCase() === sub.subjectName.toLowerCase() ||
                selectedSubject === sub.subjectId;

              return (
                <Box
                  as="button"
                  key={sub.subjectId}
                  onClick={() => setSelectedSubject(isSelected ? "all" : sub.subjectName)}
                  p={3.5}
                  borderRadius="xl"
                  border="1.5px solid"
                  borderColor={isSelected ? subColor : "gray.200"}
                  bg={isSelected ? `${subColor}0D` : "white"}
                  boxShadow={isSelected ? `0 2px 8px ${subColor}25` : "0 1px 3px rgba(0,0,0,0.02)"}
                  textAlign="left"
                  cursor="pointer"
                  transition="all 0.15s ease"
                  _hover={{ borderColor: subColor, transform: "translateY(-1px)" }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack gap={2}>
                      <Box w="8px" h="8px" borderRadius="full" bg={subColor} />
                      <Text fontSize="xs" fontWeight="800" color="gray.900" textTransform="capitalize">
                        {sub.subjectName}
                      </Text>
                    </HStack>
                    <HStack gap={1} color={trendCol} fontSize="xs" fontWeight="800">
                      <Icon as={trendIcon} boxSize="13px" />
                      <Text>
                        {sub.trend === "up"
                          ? `+${sub.trendDiff}%`
                          : sub.trend === "down"
                          ? `${sub.trendDiff}%`
                          : t("Steady")}
                      </Text>
                    </HStack>
                  </Flex>

                  <HStack justify="space-between" mt={2.5} fontSize="11px" color="gray.600">
                    <Text>
                      {sub.previousAccuracy !== null ? `${t("Earlier")}: ${sub.previousAccuracy}%` : t("1st attempt")}
                    </Text>
                    <Text fontWeight="800" color="gray.900">
                      {t("Latest")}: {sub.accuracy}%
                    </Text>
                  </HStack>

                  <Flex justify="space-between" align="center" mt={2} pt={2} borderTop="1px solid" borderColor="gray.100" fontSize="10px" color="gray.500">
                    <Text>{sub.sessionsCount} {sub.sessionsCount === 1 ? t("Quiz") : t("Quizzes")}</Text>
                    <Badge colorPalette={sub.accuracy >= 70 ? "green" : sub.accuracy >= 50 ? "yellow" : "red"} variant="subtle" size="sm" borderRadius="full">
                      {t("Grade")} {sub.grade}
                    </Badge>
                  </Flex>
                </Box>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProgressTrendsSection;

