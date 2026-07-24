"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { GiChart } from "react-icons/gi"

type ChartDataPoint = {
  month: string;
  average: number;
}

const PerformanceChart = ({ data }: { data: ChartDataPoint[] }) => {
  const chartData = [...data]
    .reverse()
    .map(item => ({
      month: item.month.split(' ')[0], 
      score: item.average
    }));

  const chart = useChart({
    data: chartData,
    series: [{ name: "score", color: "blue.500" }],
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

      <Chart.Root h={{ base: "220px", md: "300px" }} w="full" chart={chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart.data} margin={{ left: -20, right: 10 }}> 
            <CartesianGrid stroke={chart.color("border")} vertical={false} />
            <XAxis
              axisLine={false}
              dataKey={chart.key("month")}
              stroke={chart.color("fg.muted")}
              fontSize={10}
              tickMargin={10}
              interval={0} 
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              stroke={chart.color("fg.muted")}
              fontSize={10}
              tickMargin={10}
              hide={false} 
            />
            <Tooltip
              animationDuration={100}
              cursor={{ stroke: chart.color("border"), strokeWidth: 1 }}
              content={<Chart.Tooltip />}
            />
            {chart.series.map((item) => (
              <Line
                key={item.name}
                type="monotone"
                isAnimationActive={true}
                dataKey={chart.key(item.name)}
                stroke={chart.color(item.color)}
                strokeWidth={3}
                dot={{ r: 4, fill: chart.color(item.color) }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Chart.Root>
    </Box>
  )
}

export default PerformanceChart;