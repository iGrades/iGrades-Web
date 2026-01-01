"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { GiChart } from "react-icons/gi"

type ChartDataPoint = {
  month: string;
  average: number;
}

const PerformanceChart = ({ data }: { data: ChartDataPoint[] }) => {
  // 1. Prepare data (Recharts needs chronologically sorted data)
  const chartData = [...data]
    .reverse()
    .map(item => ({
      month: item.month.split(' ')[0], // Just get the Month name
      score: item.average
    }));

  const chart = useChart({
    data: chartData,
    series: [{ name: "score", color: "blue.500" }],
  })

  return (
    <Box bg="white" p={{base: 3, md: 6}} rounded="2xl" border="1px solid" borderColor="gray.100">
      <Flex align="center" gap={2} mb={6}>
        <Icon as={GiChart} color="primaryColor" />
        <Text fontWeight="bold" fontSize="sm">4-Month Progress Trend</Text>
      </Flex>

      <Chart.Root h="300px" chart={chart}>
        <LineChart data={chart.data}>
          <CartesianGrid stroke={chart.color("border")} vertical={false} />
          <XAxis
            axisLine={false}
            dataKey={chart.key("month")}
            stroke={chart.color("fg.muted")}
            fontSize={10}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            stroke={chart.color("fg.muted")}
            fontSize={10}
            tickMargin={10}
          />
          <Tooltip
            animationDuration={100}
            cursor={{ stroke: chart.color("border"), strokeWidth: 1 }}
            content={<Chart.Tooltip />}
          />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              type="monotone" // Makes the line smooth/curvy
              isAnimationActive={true}
              dataKey={chart.key(item.name)}
              stroke={chart.color(item.color)}
              strokeWidth={3}
              dot={{ r: 4, fill: chart.color(item.color) }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </Chart.Root>
    </Box>
  )
}

export default PerformanceChart;