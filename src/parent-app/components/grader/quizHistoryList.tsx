import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Badge,
  Spinner,
  Icon,
  Circle,
  Button,
  Heading,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { GiNotebook } from "react-icons/gi";
import {
  MdOutlineKeyboardArrowRight,
  MdArrowBack,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import PerformanceChart from "./performanceLineChart";

type QuizHistoryListProps = {
  studentId: string;
};

const getMonthName = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const QuizHistoryList = ({ studentId }: QuizHistoryListProps) => {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

      const { data, error } = await supabase
        .from("attempts")
        .select(`id, started_at, subject_id, score, subjects (name)`)
        .eq("student_id", studentId)
        .eq("status", "completed")
        .gte("started_at", fourMonthsAgo.toISOString())
        .order("started_at", { ascending: false });

      if (!error && data) setAttempts(data);
      setLoading(false);
    };
    fetchHistory();
  }, [studentId]);

  // STATUS SUMMARY CALCULATION
  const statusSummary = useMemo(() => {
    if (attempts.length < 2) return null;

    // Group all scores by month to calculate performance shift
    const monthlyAvgs = attempts.reduce((acc: any, curr) => {
      const monthKey = new Date(curr.started_at).getMonth();
      if (!acc[monthKey]) acc[monthKey] = { sum: 0, count: 0 };
      acc[monthKey].sum += curr.score;
      acc[monthKey].count += 1;
      return acc;
    }, {});

    const months = Object.keys(monthlyAvgs).sort(
      (a, b) => Number(b) - Number(a),
    );
    const latest = monthlyAvgs[months[0]].sum / monthlyAvgs[months[0]].count;
    const previous = monthlyAvgs[months[1]]
      ? monthlyAvgs[months[1]].sum / monthlyAvgs[months[1]].count
      : latest;

    const diff = Math.round(latest - previous);
    return { diff, latest: Math.round(latest) };
  }, [attempts]);

  const subjectGroups = useMemo(() => {
    if (!selectedSubjectId) return [];
    const filtered = attempts.filter((a) => a.subject_id === selectedSubjectId);
    const groups: Record<string, any[]> = {};

    filtered.forEach((attempt) => {
      const monthYear = getMonthName(attempt.started_at);
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(attempt);
    });

    return Object.entries(groups).map(([month, data]) => ({
      month,
      attempts: data,
      average: Math.round(
        data.reduce((acc, curr) => acc + curr.score, 0) / data.length,
      ),
    }));
  }, [attempts, selectedSubjectId]);

  if (loading)
    return (
      <Flex justify="center" p={10}>
        <Spinner color="primaryColor" />
      </Flex>
    );

  if (selectedSubjectId) {
    const subjectName = attempts.find((a) => a.subject_id === selectedSubjectId)
      ?.subjects?.name;
    return (
      <VStack gap={6} w="full" p={2} align="stretch">
        <HStack justify="space-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSubjectId(null)}
          >
            <MdArrowBack /> Back to Dashboard
          </Button>
          <Text
            fontWeight="bold"
            color="primaryColor"
            textTransform="capitalize"
          >
            {subjectName}
          </Text>
        </HStack>

        <PerformanceChart data={subjectGroups} />

        <VStack gap={4}>
          {subjectGroups.map((group, idx) => (
            <Box
              key={idx}
              w="full"
              bg="white"
              rounded="xl"
              border="1px solid"
              borderColor="gray.100"
              overflow="hidden"
            >
              <Flex bg="gray.50" p={3} justify="space-between" align="center">
                <Text fontWeight="bold" fontSize="xs">
                  {group.month}
                </Text>
                <HStack gap={2}>
                  <Text fontSize="11px" fontWeight="bold">
                    Average: {group.average}%
                  </Text>
                  <Badge
                    colorPalette={group.average >= 80
                      ? "green"
                      : group.average >= 70
                        ? "blue"
                        : group.average >= 55
                          ? "yellow"
                          : group.average >= 40
                            ? "orange"
                            : group.average >= 30
                              ? "pink"
                              : "red"}
                    variant="solid"
                    size="sm"
                  >
                    {group.average >= 80
                      ? "A"
                      : group.average >= 70
                        ? "B"
                        : group.average >= 55
                          ? "C"
                          : group.average >= 40
                            ? "D"
                            : group.average >= 30
                              ? "E"
                              : "F"}
                  </Badge>
                </HStack>
              </Flex>
              <VStack align="stretch" p={1} gap={0}>
                {group.attempts.map((attempt: any) => (
                  <Flex
                    key={attempt.id}
                    p={3}
                    justify="space-between"
                    borderBottom="1px solid"
                    borderColor="gray.50"
                    _last={{ borderBottom: "none" }}
                  >
                    <Text fontSize="xs">
                      {new Date(attempt.started_at).toLocaleDateString(
                        undefined,
                        { day: "numeric", month: "short" },
                      )}
                    </Text>
                    <Text fontSize="xs" fontWeight="bold">
                      {attempt.score}%
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>

        {/*Grading system box*/}
        <Box bg="white" p={8} borderRadius="2xl" shadow="sm">
          <VStack align="start" gap={4}>
            <HStack gap={2}>
              <Icon as={FaChartLine} color="primaryColor" />
              <Heading size="md">Grading System Key</Heading>
            </HStack>
            <Text fontSize="xs" color="gray.500" mb={2}>
              Understand your child's performance levels based on the standard academic
              scoring range:
            </Text>

            <Grid templateColumns="repeat(6, 1fr)" gap={2} w="full">
              {[
                {
                  g: "A",
                  range: "80-100",
                  label: "Excellent",
                  color: "green.500",
                },
                { g: "B", range: "70-79", label: "V. Good", color: "blue.500" },
                { g: "C", range: "55-69", label: "Good", color: "yellow.500" },
                { g: "D", range: "40-54", label: "Fair", color: "orange.500" },
                { g: "E", range: "30-39", label: "Poor", color: "pink.500" },
                { g: "F", range: "0-29", label: "Fail", color: "red.500" },
              ].map((item) => (
                <GridItem
                  key={item.g}
                  textAlign="center"
                  p={3}
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="lg"
                >
                  <Text fontWeight="bold" fontSize="lg" color={item.color}>
                    {item.g}
                  </Text>
                  <Text fontSize="10px" fontWeight="bold">
                    {item.range}%
                  </Text>
                  <Text
                    fontSize="9px"
                    color="gray.400"
                    textTransform="uppercase"
                  >
                    {item.label}
                  </Text>
                </GridItem>
              ))}
            </Grid>
          </VStack>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={4} w="full" p={2} align="stretch">
      {/* 4-MONTH STATUS SUMMARY */}
      {statusSummary && (
        <Box
          bg="white"
          p={5}
          rounded="2xl"
          border="2px solid"
          borderColor="blue.50"
        >
          <HStack justify="space-between">
            <VStack align="start" gap={0}>
              <Text
                fontSize="10px"
                fontWeight="bold"
                color="gray.400"
                textTransform="uppercase"
              >
                Performance Trend
              </Text>
              <Text fontSize="sm" fontWeight="600">
                {statusSummary.diff > 0
                  ? `Your child is performing ${statusSummary.diff}% better than last month! 🚀`
                  : statusSummary.diff < 0
                    ? `There's a slight dip of ${Math.abs(statusSummary.diff)}% in performance this month.`
                    : "Performance is consistent with last month."}
              </Text>
            </VStack>
            <Icon
              as={statusSummary.diff >= 0 ? MdTrendingUp : MdTrendingDown}
              color={statusSummary.diff >= 0 ? "green.500" : "orange.500"}
              fontSize="2xl"
            />
          </HStack>
        </Box>
      )}

      <Box bg="primaryColor" p={6} rounded="2xl" color="white" mb={2}>
        <Text fontSize="xs" fontWeight="bold" opacity={0.8}>
          4-MONTH OVERALL AVERAGE
        </Text>
        <Heading size="3xl">
          {Math.round(
            attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) /
              (attempts.length || 1),
          )}
          %
        </Heading>
      </Box>

      <Text fontWeight="bold" fontSize="sm" ml={2}>
        Subject Performance
      </Text>

      {Array.from(new Set(attempts.map((a) => a.subject_id))).map((subId) => {
        const subData = attempts.find((a) => a.subject_id === subId);
        return (
          <Box
            key={subId}
            bg="white"
            p={5}
            rounded="xl"
            border="1px solid"
            borderColor="gray.100"
            cursor="pointer"
            _hover={{ borderColor: "primaryColor", shadow: "sm" }}
            transition="all 0.2s"
            onClick={() => setSelectedSubjectId(subId)}
          >
            <Flex justify="space-between" align="center">
              <HStack gap={4}>
                <Circle size="40px" bg="blue.50" color="primaryColor">
                  <GiNotebook />
                </Circle>
                <Text
                  fontWeight="bold"
                  fontSize="sm"
                  textTransform="capitalize"
                >
                  {subData.subjects.name}
                </Text>
              </HStack>
              <Icon as={MdOutlineKeyboardArrowRight} color="gray.300" />
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
};

export default QuizHistoryList;
