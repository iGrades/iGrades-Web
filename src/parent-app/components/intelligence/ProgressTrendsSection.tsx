import { Box, Flex, Heading, Text, Grid, HStack, Badge, Icon } from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiActivity } from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { StudentIntelligence } from "@/parent-app/hooks/useParentIntelligence";

type Props = {
  intelligence: StudentIntelligence;
};

export const ProgressTrendsSection = ({ intelligence }: Props) => {
  const { trendHistory, subjects, overallTrend, overallTrendDiff } = intelligence;

  const activeSubjects = subjects.filter((s) => s.sessionsCount > 0);

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)" mb={6}>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <HStack gap={2.5}>
          <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.200">
            <Icon as={FiActivity} color="#206CE1" boxSize="18px" />
          </Box>
          <Box>
            <Heading size={{ base: "sm", md: "md" }} color="gray.900" fontWeight="800">
              Score Progress Over Time
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              Track how your child's test scores are improving over time.
            </Text>
          </Box>
        </HStack>

        <HStack gap={2}>
          <Badge
            colorPalette={overallTrend === "up" ? "green" : overallTrend === "down" ? "red" : "blue"}
            variant="subtle"
            size="sm"
            borderRadius="full"
            px={2.5}
          >
            {overallTrend === "up"
              ? `Overall Trend: +${overallTrendDiff}% Improving`
              : overallTrend === "down"
              ? `Overall Trend: ${overallTrendDiff}% Needs Review`
              : "Overall Trend: Steady Progress"}
          </Badge>
        </HStack>
      </Flex>

      {/* Main Trend Line Chart */}
      {trendHistory.length > 0 ? (
        <Box h="240px" w="100%" mb={5}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#206CE1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#206CE1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="period"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  fontSize: "12px",
                }}
                formatter={(val: any) => [`${val}%`, "Average Score"]}
                labelStyle={{ fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="averageScore"
                stroke="#206CE1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGradient)"
                activeDot={{ r: 6, fill: "#206CE1", stroke: "#FFFFFF", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box p={8} textAlign="center" bg="gray.50" borderRadius="xl" mb={5}>
          <Text fontSize="xs" color="gray.500">
            Take practice quizzes to see how scores improve over time.
          </Text>
        </Box>
      )}

      {/* Subject Trend Comparison Chips */}
      {activeSubjects.length > 0 && (
        <Box pt={3} borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={3}>
            Subject by Subject Progress
          </Text>
          <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={3}>
            {activeSubjects.map((sub) => {
              const trendIcon = sub.trend === "up" ? FiTrendingUp : sub.trend === "down" ? FiTrendingDown : FiMinus;
              const trendCol = sub.trend === "up" ? "green.600" : sub.trend === "down" ? "red.600" : "gray.600";
              const bgCol = sub.trend === "up" ? "green.50/30" : sub.trend === "down" ? "red.50/30" : "gray.50/80";
              const borderCol = sub.trend === "up" ? "green.200" : sub.trend === "down" ? "red.200" : "gray.200";

              return (
                <Box key={sub.subjectId} p={3} borderRadius="xl" border="1px solid" borderColor={borderCol} bg={bgCol}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" fontWeight="700" color="gray.800" textTransform="capitalize">
                      {sub.subjectName}
                    </Text>
                    <HStack gap={1} color={trendCol} fontSize="xs" fontWeight="700">
                      <Icon as={trendIcon} />
                      <Text>
                        {sub.trend === "up"
                          ? `+${sub.trendDiff}%`
                          : sub.trend === "down"
                          ? `${sub.trendDiff}%`
                          : "Stable"}
                      </Text>
                    </HStack>
                  </Flex>
                  <HStack justify="space-between" mt={2} fontSize="11px" color="gray.600">
                    <Text>
                      {sub.previousAccuracy !== null ? `Earlier: ${sub.previousAccuracy}%` : "First score"}
                    </Text>
                    <Text fontWeight="700" color="gray.900">
                      Latest: {sub.accuracy}%
                    </Text>
                  </HStack>
                </Box>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};
