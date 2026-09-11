"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
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

  const chart = useChart({
    data: chartData,
    series: [{ name: "score", color: "teal.solid" }],
  })

  return (
    <Box 
      bg="white" 
      p={{ base: 3, md: 6 }} 
      rounded="2xl" 
      border="1px solid" 
      borderColor="gray.100"
      w="full"
    >
      <Flex align="center" gap={2} mb={6}>
        <Icon as={GiChart} color="primaryColor" />
        <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>
          4-Month Progress Trend
        </Text>
      </Flex>

      <Chart.Root maxH="sm" minH="260px" chart={chart}>
        <LineChart data={chart.data} responsive>
          <CartesianGrid stroke={chart.color("border")} vertical={false} />
          <XAxis
            axisLine={false}
            dataKey={chart.key("month")}
            tickFormatter={(value) => value.slice(0, 3)}
            stroke={chart.color("border")}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            stroke={chart.color("border")}
          />
          <Tooltip
            animationDuration={100}
            cursor={false}
            content={<Chart.Tooltip />}
          />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              stroke={chart.color(item.color)}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </Chart.Root>
    </Box>
  )
}

export default PerformanceChart;