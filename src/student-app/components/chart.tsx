"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Heading, Text } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { courseConfig } from "@/student-app/utils/courseConstants";

interface QuizProgressData {
  month: string;
  [subject: string]: number | string;
}

interface SubjectData {
  name: string;
  color: string;
}

const getSubjectDisplayName = (dbName: string): string =>
  courseConfig[dbName.toLowerCase()]?.displayName || dbName;

const getSubjectColor = (dbName: string): string =>
  courseConfig[dbName.toLowerCase()]?.color || "#718096";

const HomeChart = () => {
  const [quizProgress, setQuizProgress] = useState<QuizProgressData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authdStudent } = useAuthdStudentData();

  useEffect(() => {
    // Guard: wait until student id is available
    if (!authdStudent?.id) {
      setIsLoading(false);
      return;
    }

    const fetchQuizProgress = async () => {
      try {
        setIsLoading(true);

        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

        // Fix 1: fetch subjects inline so the join is never undefined
        const { data: attempts, error } = await supabase
          .from("attempts")
          .select("id, subject_id, score, completed_at, subjects(id, name)")
          .eq("student_id", authdStudent.id)
          .gte("completed_at", fourMonthsAgo.toISOString())
          .eq("status", "completed");

        if (error) {
          console.error("Attempts fetch error:", error);
          setIsLoading(false);
          return;
        }

        // Fix 2: build allStudentSubjects here, inside the effect,
        // so it always uses the current authdStudent value
        const raw = authdStudent.registered_courses ?? "[]";
        const registeredCourses: string[] = Array.isArray(raw) ? raw : JSON.parse(raw);
        const allStudentSubjects: SubjectData[] = registeredCourses.map((dbName) => ({
          name: getSubjectDisplayName(dbName),
          color: getSubjectColor(dbName),
        }));

        // Build the last-4-months skeleton
        const months: string[] = [];
        const monthlyData: Record<string, QuizProgressData> = {};

        for (let i = 3; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleString("en-US", { month: "long" });
          months.push(monthName);
          monthlyData[monthName] = { month: monthName };
          allStudentSubjects.forEach((s) => {
            monthlyData[monthName][s.name] = 0;
          });
        }

        // Fix 3: read subjects from the inline join, not a stitched lookup
        (attempts ?? []).forEach((attempt) => {
          if (!attempt.completed_at || !attempt.subjects) return;

          const monthName = new Date(attempt.completed_at).toLocaleString("en-US", {
            month: "long",
          });

          // subjects is an object from the inline join: { id, name }
          const subjectObj = Array.isArray(attempt.subjects)
            ? attempt.subjects[0]
            : attempt.subjects;

          if (!subjectObj?.name) return;

          const displayName = getSubjectDisplayName(subjectObj.name);
          const score = Number(attempt.score) || 0;

          if (monthlyData[monthName] && displayName in monthlyData[monthName]) {
            const current = monthlyData[monthName][displayName] as number;
            monthlyData[monthName][displayName] = Math.max(current, score);
          }
        });

        setQuizProgress(months.map((m) => monthlyData[m]));
        setSubjects(allStudentSubjects);
      } catch (err) {
        console.error("Chart fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizProgress();
    // Fix 4: depend on registered_courses so the chart re-runs if the
    // student's courses change after initial load
  }, [authdStudent?.id, authdStudent?.registered_courses]);

  const chart = useChart({
    data: quizProgress,
    series: subjects.map((s) => ({
      name: s.name,
      color: s.color,
      stackId: "a",
    })),
  });

  if (isLoading) {
    return (
      <Box bg="white" boxShadow="md" borderRadius="lg" w={{ base: "100%", md: "60%" }} p={4}  h="65vh" textAlign="center">
        <Text fontSize="sm">Loading Quiz Analytics...</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" boxShadow="md" borderRadius="lg" w={{ base: "100%", md: "60%" }} p={4} h="65vh">
      <Heading mb={4} fontSize="md">
        Quiz Analytics (Last 4 Months)
      </Heading>
      <Chart.Root maxH="md" chart={chart}>
        <BarChart data={chart.data}>
          <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
          <XAxis
            dataKey={chart.key("month")}
            tickFormatter={(v) => v.slice(0, 3)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke={chart.color("border.emphasized")}
          />
          <Tooltip
            content={<Chart.Tooltip />}
            cursor={{ fill: chart.color("bg.muted") }}
          />
          <Legend content={<Chart.Legend />} />
          {chart.series.map((s) => (
            <Bar
              key={s.name}
              dataKey={chart.key(s.name)}
              fill={chart.color(s.color)}
              stackId={s.stackId}
              barSize={30}
            />
          ))}
        </BarChart>
      </Chart.Root>
    </Box>
  );
};

export default HomeChart;