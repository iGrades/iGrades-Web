"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Box } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const HomeChart = () => {
  const chart = useChart({
    data: [
      {
        "Option 1": 186,
        "Option 2": 80,
        "Option 3": 120,
        "Option 4": 150,
        month: "January",
      },

      {
        "Option 1": 126,
        "Option 2": 50,
        "Option 3": 90,
        "Option 4": 100,
        month: "February",
      },
      {
        "Option 1": 106,
        "Option 2": 90,
        "Option 3": 150,
        "Option 4": 100,
        month: "March",
      },
      {
        "Option 1": 109,
        "Option 2": 100,
        "Option 3": 120,
        "Option 4": 100,
        month: "April",
      },
      {
        "Option 1": 160,
        "Option 2": 90,
        "Option 3": 110,
        "Option 4": 80,
        month: "May",
      },
      {
        "Option 1": 87,
        "Option 2": 100,
        "Option 3": 150,
        "Option 4": 80,
        month: "June",
      },
      {
        "Option 1": 113,
        "Option 2": 70,
        "Option 3": 250,
        "Option 4": 100,
        month: "July",
      },
      {
        "Option 1": 100,
        "Option 2": 100,
        "Option 3": 150,
        "Option 4": 200,
        month: "August",
      },
      {
        "Option 1": 106,
        "Option 2": 90,
        "Option 3": 150,
        "Option 4": 100,
        month: "September",
      },
      {
        "Option 1": 91,
        "Option 2": 64,
        "Option 3": 110,
        "Option 4": 150,
        month: "October",
      },
      {
        "Option 1": 183,
        "Option 2": 190,
        "Option 3": 200,
        "Option 4": 70,
        month: "November",
      },
      {
        "Option 1": 200,
        "Option 2": 30,
        "Option 3": 15,
        "Option 4": 145,
        month: "December",
      },
    ],
    series: [
      { name: "Option 1", color: "#6EC8EF", stackId: "a" },
      { name: "Option 2", color: "#5271E2", stackId: "a" },
      { name: "Option 3", color: "#F4B475", stackId: "a" },
      { name: "Option 4", color: "#6DD372", stackId: "a" },
    ],
  });

  return (
    <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
    <Chart.Root maxH="md" chart={chart}>
      <BarChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey={chart.key("month")}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          stroke={chart.color("border.emphasized")}
          tickFormatter={chart.formatNumber()}
        />
        <Tooltip
          cursor={{ fill: chart.color("bg.muted") }}
          animationDuration={100}
          content={<Chart.Tooltip />}
        />
        <Legend content={<Chart.Legend />} />
        {chart.series.map((item) => (
          <Bar
            isAnimationActive={false}
            key={item.name}
            barSize={30}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            stroke={chart.color(item.color)}
            stackId={item.stackId}
          />
        ))}
      </BarChart>
    </Chart.Root>
    </Box>
  );
};
export default HomeChart;
