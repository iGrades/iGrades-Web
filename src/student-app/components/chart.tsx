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
        "Maths": 186,
        "Chemistry": 80,
        "Accounting": 120,
        "French": 150,
        month: "June",
      },

      {
        "Maths": 126,
        "Chemistry": 50,
        "Accounting": 90,
        "French": 100,
        month: "July",
      },
      {
        "Maths": 106,
        "Chemistry": 90,
        "Accounting": 150,
        "French": 100,
        month: "August",
      },
      {
        "Maths": 109,
        "Chemistry": 100,
        "Accounting": 120,
        "French": 100,
        month: "September",
      },
    ],
    series: [
      { name: "French", color: "#6EC8EF", stackId: "a" },
      { name: "Accounting", color: "#5271E2", stackId: "a" },
      { name: "Chemistry", color: "#F4B475", stackId: "a" },
      { name: "Maths", color: "#6DD372", stackId: "a" },
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
