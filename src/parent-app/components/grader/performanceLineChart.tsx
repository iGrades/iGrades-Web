"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { GiChart } from "react-icons/gi"

type ChartDataPoint = {
  month: string;
  average: number;
}

const defaultDemoData: ChartDataPoint[] = [
  { month: "January", average: 10 },
  { month: "February", average: 95 },
  { month: "March", average: 87 },
  { month: "May", average: 88 },
  { month: "June", average: 65 },
  { month: "August", average: 90 },
];

const PerformanceChart = ({ data }: { data?: ChartDataPoint[] }) => {
  const sourceData = data && data.length > 0 ? data : defaultDemoData;
  const chartData = [...sourceData]
    .reverse()
    .map(item => ({
      month: item.month.split(' ')[0], 
      score: item.average
    }));

  const lineColor = "#EA580C";

  return (
    <Box 
      bg="white" 
      p={{ base: 3, md: 6 }} 
      rounded="2xl" 
      border="1px solid" 
      borderColor="gray.100"
      w="full"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
    >
      <Flex align="center" gap={2} mb={6}>
        <Box bg="orange.50" p={1.5} borderRadius="lg" border="1px solid" borderColor="orange.200">
          <Icon as={GiChart} color="#EA580C" boxSize="18px" />
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color="gray.900">
            Progress Trend
          </Text>
          <Text fontSize="xs" color="gray.500">
            Performance progression over recent learning periods
          </Text>
        </Box>
      </Flex>

      <Box w="100%" h="260px" position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="perfAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.28} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              dataKey="month"
              tickFormatter={(value) => value ? value.slice(0, 3) : ""}
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                borderRadius: "12px",
                border: "none",
                color: "white",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              }}
              formatter={(val: any) => [`${val}%`, "Average Score"]}
              labelStyle={{ fontWeight: "700", color: "#F8FAFC", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="score"
              name="Average Score"
              stroke={lineColor}
              strokeWidth={2.5}
              fill="url(#perfAreaGradient)"
              dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 6, fill: lineColor, stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default PerformanceChart;