"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Heading, Text } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  averageScore: number;
  courseScores: Record<string, number>; // Store individual scores for tooltip
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
    if (!authdStudent?.id) {
      setIsLoading(false);
      return;
    }

    const fetchQuizProgress = async () => {
      try {
        setIsLoading(true);

        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

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
          monthlyData[monthName] = { 
            month: monthName, 
            averageScore: 0,
            courseScores: {} 
          };
          
          // Initialize course scores for this month
          allStudentSubjects.forEach((s) => {
            monthlyData[monthName].courseScores[s.name] = 0;
          });
        }

        // Collect all scores per course per month
        (attempts ?? []).forEach((attempt) => {
          if (!attempt.completed_at || !attempt.subjects) return;

          const monthName = new Date(attempt.completed_at).toLocaleString("en-US", {
            month: "long",
          });

          const subjectObj = Array.isArray(attempt.subjects)
            ? attempt.subjects[0]
            : attempt.subjects;

          if (!subjectObj?.name) return;

          const displayName = getSubjectDisplayName(subjectObj.name);
          const score = Number(attempt.score) || 0;

          if (monthlyData[monthName] && displayName in monthlyData[monthName].courseScores) {
            // Take the maximum score for each course in that month (best attempt)
            const current = monthlyData[monthName].courseScores[displayName];
            monthlyData[monthName].courseScores[displayName] = Math.max(current, score);
          }
        });

        // Calculate average for each month (only include courses with score > 0)
        months.forEach((month) => {
          const monthData = monthlyData[month];
          const scores = Object.values(monthData.courseScores).filter(score => score > 0);
          
          if (scores.length > 0) {
            const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            monthData.averageScore = Math.round(average);
          } else {
            monthData.averageScore = 0;
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
  }, [authdStudent?.id, authdStudent?.registered_courses]);

  const chart = useChart({
    data: quizProgress,
    series: [{
      name: "averageScore",
      color: "#3182CE", // Blue color for the average bar
    }],
  });

  // Custom tooltip to show individual course scores
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const dataPoint = quizProgress.find(item => item.month === label);
    if (!dataPoint) return null;

    return (
      <Box bg="white" p={3} border="1px solid" borderColor="gray.200" borderRadius="md" boxShadow="lg">
        <Text fontWeight="bold" mb={2}>{label}</Text>
        <Text fontSize="sm" mb={2}>
          Average Score: <strong>{payload[0].value}%</strong>
        </Text>
        <Box borderTop="1px solid" borderColor="gray.200" pt={2} mt={1}>
          <Text fontSize="xs" fontWeight="semibold" mb={1}>Course Breakdown:</Text>
          {subjects.map((subject) => {
            const score = dataPoint.courseScores[subject.name];
            if (score > 0) {
              return (
                <Text key={subject.name} fontSize="xs" mb={0.5}>
                  <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "2px", backgroundColor: subject.color, marginRight: "6px" }}></span>
                  {subject.name}: <strong>{score}%</strong>
                </Text>
              );
            }
            return null;
          })}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box bg="white" boxShadow="md" borderRadius="lg" w={{ base: "100%", md: "60%" }} p={4} h="65vh" textAlign="center">
        <Text fontSize="sm">Loading Quiz Analytics...</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" boxShadow="md" borderRadius="lg" w={{ base: "100%", md: "60%" }} p={4} h="68.5vh">
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: chart.color("bg.muted") }} />
          <Bar
            dataKey={chart.key("averageScore")}
            fill={chart.color("#3182CE")}
            barSize={50}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </Chart.Root>
    </Box>
  );
};

export default HomeChart;