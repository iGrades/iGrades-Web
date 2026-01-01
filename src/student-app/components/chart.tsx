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
// 1. Import the centralized configuration
import { courseConfig } from "@/student-app/utils/courseConstants";

interface QuizProgressData {
  month: string;
  [subject: string]: number | string;
}

interface SubjectData {
  name: string;
  color: string;
}

const HomeChart = () => {
  const [quizProgress, setQuizProgress] = useState<QuizProgressData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authdStudent } = useAuthdStudentData();

  // 2. Simplified Helper Functions using global config
  const getSubjectDisplayName = (dbName: string): string => 
    courseConfig[dbName.toLowerCase()]?.displayName || dbName;

  const getSubjectColor = (dbName: string): string => 
    courseConfig[dbName.toLowerCase()]?.color || "#718096";

  const getAllStudentSubjects = (): SubjectData[] => {
    const registeredCourses = authdStudent?.registered_courses;
    if (!registeredCourses) return [];
    
    let coursesArray: string[] = [];
    if (Array.isArray(registeredCourses)) {
      coursesArray = registeredCourses;
    } else if (typeof registeredCourses === "string") {
      try {
        const parsed = JSON.parse(registeredCourses);
        coursesArray = Array.isArray(parsed) ? parsed : [registeredCourses];
      } catch {
        coursesArray = registeredCourses.split(",").map((c: string) => c.trim());
      }
    } else {
      coursesArray = [String(registeredCourses)];
    }

    return coursesArray.map((dbName) => ({
      name: getSubjectDisplayName(dbName),
      color: getSubjectColor(dbName),
    }));
  };
  
  const processQuizProgress = (attempts: any[]) => {
    const monthlyData: Record<string, QuizProgressData> = {};
    const allStudentSubjects = getAllStudentSubjects();
    const months: string[] = [];
  
    // Initialize last 4 months
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString("en-US", { month: "long" });
      months.push(monthName);
      
      monthlyData[monthName] = { month: monthName };
      allStudentSubjects.forEach((subject) => {
        monthlyData[monthName][subject.name] = 0;
      });
    }
  
    attempts.forEach((attempt) => {
      if (!attempt.completed_at || !attempt.subjects) return;
  
      const attemptDate = new Date(attempt.completed_at);
      const monthName = attemptDate.toLocaleString("en-US", { month: "long" });
      
      // dbName is now the simplified ID (e.g. "math")
      const dbSubjectName = attempt.subjects.name; 
      const displayName = getSubjectDisplayName(dbSubjectName);
      const score = Number(attempt.score) || 0;
  
      if (monthlyData[monthName] && displayName in monthlyData[monthName]) {
        const currentVal = monthlyData[monthName][displayName] as number;
        // Keep the highest score for that month
        monthlyData[monthName][displayName] = Math.max(currentVal, score);
      }
    });
  
    return {
      processedData: months.map((m) => monthlyData[m]),
      uniqueSubjects: allStudentSubjects,
    };
  };
  
  useEffect(() => {
    const fetchQuizProgress = async () => {
      if (!authdStudent?.id) return;
  
      try {
        setIsLoading(true);
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
  
        const { data: attempts, error } = await supabase
          .from("attempts")
          .select("id, subject_id, score, completed_at")
          .eq("student_id", authdStudent.id)
          .gte("completed_at", fourMonthsAgo.toISOString())
          .eq("status", "completed");
  
        if (error || !attempts || attempts.length === 0) {
          setIsLoading(false);
          return;
        }
  
        const subjectIds = [...new Set(attempts.map((a) => a.subject_id))];
        const { data: subjectsData } = await supabase
          .from("subjects")
          .select("id, name")
          .in("id", subjectIds);
  
        const attemptsWithSubjects = attempts.map((attempt) => ({
          ...attempt,
          subjects: subjectsData?.find((s) => s.id === attempt.subject_id),
        }));
  
        const { processedData, uniqueSubjects } = processQuizProgress(attemptsWithSubjects);
        
        setQuizProgress(processedData);
        setSubjects(uniqueSubjects);
      } catch (err) {
        console.error("Chart Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchQuizProgress();
  }, [authdStudent?.id]);

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
      <Box bg="white" boxShadow="md" borderRadius="lg" w={{ base: "100%", md: "60%" }} p={4} textAlign="center">
        <Text fontSize="sm">Loading Quiz Analytics...</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" boxShadow="md" borderRadius="lg" w={{ base: "100%", md: "60%" }} p={4}>
      <Heading mb={4} fontSize="md">Quiz Analytics (Last 4 Months)</Heading>
      <Chart.Root maxH="md" chart={chart}>
        <BarChart data={chart.data}>
          <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
          <XAxis 
            dataKey={chart.key("month")} 
            tickFormatter={(v) => v.slice(0, 3)} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke={chart.color("border.emphasized")} />
          <Tooltip content={<Chart.Tooltip />} cursor={{ fill: chart.color("bg.muted") }} />
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