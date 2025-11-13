// "use client";

// import { Chart, useChart } from "@chakra-ui/charts";
// import { Box } from "@chakra-ui/react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Legend,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// const HomeChart = () => {
//   const chart = useChart({
//     data: [
//       {
//         "Maths": 186,
//         "Chemistry": 80,
//         "Accounting": 120,
//         "French": 150,
//         month: "June",
//       },

//       {
//         "Maths": 126,
//         "Chemistry": 50,
//         "Accounting": 90,
//         "French": 100,
//         month: "July",
//       },
//       {
//         "Maths": 106,
//         "Chemistry": 90,
//         "Accounting": 150,
//         "French": 100,
//         month: "August",
//       },
//       {
//         "Maths": 109,
//         "Chemistry": 100,
//         "Accounting": 120,
//         "French": 100,
//         month: "September",
//       },
//     ],
//     series: [
//       { name: "French", color: "#6EC8EF", stackId: "a" },
//       { name: "Accounting", color: "#5271E2", stackId: "a" },
//       { name: "Chemistry", color: "#F4B475", stackId: "a" },
//       { name: "Maths", color: "#6DD372", stackId: "a" },
//     ],
//   });

//   return (
//     <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
//     <Chart.Root maxH="md" chart={chart}>
//       <BarChart data={chart.data}>
//         <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
//         <XAxis
//           axisLine={false}
//           tickLine={false}
//           dataKey={chart.key("month")}
//           tickFormatter={(value) => value.slice(0, 3)}
//         />
//         <YAxis
//           stroke={chart.color("border.emphasized")}
//           tickFormatter={chart.formatNumber()}
//         />
//         <Tooltip
//           cursor={{ fill: chart.color("bg.muted") }}
//           animationDuration={100}
//           content={<Chart.Tooltip />}
//         />
//         <Legend content={<Chart.Legend />} />
//         {chart.series.map((item) => (
//           <Bar
//             isAnimationActive={false}
//             key={item.name}
//             barSize={30}
//             dataKey={chart.key(item.name)}
//             fill={chart.color(item.color)}
//             stroke={chart.color(item.color)}
//             stackId={item.stackId}
//           />
//         ))}
//       </BarChart>
//     </Chart.Root>
//     </Box>
//   );
// };
// export default HomeChart;

"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Box, Text, Flex, Heading } from "@chakra-ui/react";
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
// import { useStudentData } from "@/student-app/context/dataContext";

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
  // const { subjects: studentSubjects } = useStudentData();

  // Use the same courseConfig mapping as in SubjectsList
  const courseConfig: Record<string, { displayName: string; color: string }> = {
    // JUNIOR SECONDARY COURSES
    juniorMath: {
      displayName: "Mathematics",
      color: "#F26946",
    },
    juniorEng: { displayName: "English", color: "#4ECDC4" },
    basicScience: {
      displayName: "Basic Science",
      color: "#45B7D1",
    },
    basicTech: {
      displayName: "Basic Technology",
      color: "#F9A826",
    },
    socialStudies: {
      displayName: "Social Studies",
      color: "#E84855",
    },
    civicEdu: {
      displayName: "Civic Education",
      color: "#7D70BA",
    },
    businessStudies: {
      displayName: "Business Studies",
      color: "#2A9D8F",
    },
    homeEconomics: {
      displayName: "Home Economics",
      color: "#E76F51",
    },
    juniorAgric: {
      displayName: "Agricultural Science",
      color: "#2A9D8F",
    },
    physicalEdu: {
      displayName: "Physical Education",
      color: "#E63946",
    },
    juniorComp: {
      displayName: "Computer Studies",
      color: "#3A86FF",
    },
    creativeArts: {
      displayName: "Creative Arts",
      color: "#8338EC",
    },
    music: { displayName: "Music", color: "#FB5607" },

    // SENIOR SECONDARY COURSES
    seniorMath: {
      displayName: "General Mathematics",
      color: "#FF6B6B",
    },
    seniorEng: { displayName: "English", color: "#4ECDC4" },
    physics: { displayName: "Physics", color: "#F06595" },
    chemistry: {
      displayName: "Chemistry",
      color: "#339AF0",
    },
    biology: { displayName: "Biology", color: "#51CF66" },
    furtherMath: {
      displayName: "Further Mathematics",
      color: "#FF922B",
    },
    economics: {
      displayName: "Economics",
      color: "#CC5DE8",
    },
    accounting: {
      displayName: "Accounting",
      color: "#20C997",
    },
    commerce: { displayName: "Commerce", color: "#FDA7DF" },
    government: {
      displayName: "Government",
      color: "#D980FA",
    },
    literature: {
      displayName: "Literature",
      color: "#B53471",
    },
    history: { displayName: "History", color: "#EE5A24" },
    geography: {
      displayName: "Geography",
      color: "#A3CB38",
    },
    fineArts: { displayName: "Fine Arts", color: "#FFC312" },
    seniorComp: {
      displayName: "Computer Science",
      color: "#1289A7",
    },
    french: { displayName: "French", color: "#6F1E51" },
  };

  // Fetch quiz progress data
  useEffect(() => {
    const fetchQuizProgress = async () => {
      if (!authdStudent?.id) return;

      try {
        setIsLoading(true);

        // Get quiz attempts for the last 4 months
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

        // First, get all attempts
        const { data: attempts, error } = await supabase
          .from("attempts")
          .select("id, subject_id, score, completed_at")
          .eq("student_id", authdStudent.id)
          .gte("completed_at", fourMonthsAgo.toISOString())
          .eq("status", "completed")
          .order("completed_at", { ascending: true });

        if (error) {
          console.error("Error fetching attempts:", error);
          return;
        }

        // Then get subject names separately
        const subjectIds = [
          ...new Set(
            attempts.map((attempt) => attempt.subject_id).filter(Boolean)
          ),
        ];

        let subjectsData: any[] = [];
        if (subjectIds.length > 0) {
          const { data, error: subjectsError } = await supabase
            .from("subjects")
            .select("id, name") // Only get id and name columns
            .in("id", subjectIds);

          if (subjectsError) {
            console.error("Error fetching subjects:", subjectsError);
            return;
          }
          subjectsData = data || [];
        }

        console.log("Attempts:", attempts);
        console.log("Subjects data:", subjectsData);

        // Combine attempts with subject names
        const attemptsWithSubjects = attempts.map((attempt) => {
          const subject = subjectsData.find((s) => s.id === attempt.subject_id);
          return {
            ...attempt,
            subjects: subject,
          };
        });

        const { processedData, uniqueSubjects } =
          processQuizProgress(attemptsWithSubjects);
        setQuizProgress(processedData);
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error("Error in fetchQuizProgress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizProgress();
  }, [authdStudent?.id]);

  // Convert database name to display name using courseConfig
  const getSubjectDisplayName = (dbName: string): string => {
    return courseConfig[dbName]?.displayName || dbName;
  };

  // Get color for a subject
  const getSubjectColor = (dbName: string): string => {
    return courseConfig[dbName]?.color || "#718096"; // Default gray
  };

  // Get all subjects the student offers
  const getAllStudentSubjects = (): SubjectData[] => {
    // Helper function to convert registered_courses to an array (same as SubjectsList)
    const getStudentCoursesArray = () => {
      const registeredCourses = authdStudent?.registered_courses;

      if (!registeredCourses) return [];

      // If it's already an array, return it
      if (Array.isArray(registeredCourses)) {
        return registeredCourses;
      }

      // If it's a string, try to parse it as JSON or split by commas
      if (typeof registeredCourses === "string") {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(registeredCourses);
          return Array.isArray(parsed) ? parsed : [registeredCourses];
        } catch {
          // If JSON parsing fails, try splitting by commas
          return (registeredCourses as string)
            .split(",")
            .map((course: string) => course.trim());
        }
      }

      // If it's some other type, convert to array
      return [String(registeredCourses)];
    };

    const registeredCoursesArray = getStudentCoursesArray();

    return registeredCoursesArray.map((dbCourseName) => {
      const displayName = getSubjectDisplayName(dbCourseName);
      const color = getSubjectColor(dbCourseName);

      return {
        name: displayName,
        color: color,
      };
    });
  };

  // Process quiz attempts into chart data
  const processQuizProgress = (attempts: any[]) => {
    const monthlyData: Record<string, QuizProgressData> = {};

    // Get all student subjects
    const allStudentSubjects = getAllStudentSubjects();

    // Initialize last 4 months
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString("default", { month: "long" });
      months.push(monthName);

      monthlyData[monthName] = { month: monthName };

      // Initialize all subjects with 0
      allStudentSubjects.forEach((subject) => {
        monthlyData[monthName][subject.name] = 0;
      });
    }

    // Fill with actual data
    attempts.forEach((attempt) => {
      if (!attempt.completed_at || !attempt.subjects) return;

      const attemptDate = new Date(attempt.completed_at);
      const monthName = attemptDate.toLocaleString("default", {
        month: "long",
      });
      const dbSubjectName = attempt.subjects.name; // This is the database name
      const displayName = getSubjectDisplayName(dbSubjectName);
      const score = attempt.score || 0;

      if (monthlyData[monthName] && displayName in monthlyData[monthName]) {
        monthlyData[monthName][displayName] = score;
      }
    });

    const processedData = months.map((month) => monthlyData[month]);

    return {
      processedData,
      uniqueSubjects: allStudentSubjects,
    };
  };

  const chart = useChart({
    data: quizProgress.length > 0 ? quizProgress : [],
    series: subjects.map((subject) => ({
      name: subject.name,
      color: subject.color,
      stackId: "a",
    })),
  });

  if (isLoading) {
    return (
      <Box bg="white" boxShadow="md" borderRadius="lg" w="60%" my={5} p={4}>
        <Flex align="center" justify="center" h="200px">
          <Text>Loading quiz progress...</Text>
        </Flex>
      </Box>
    );
  }

  if (quizProgress.length === 0 || subjects.length === 0) {
    return (
      <Box bg="white" boxShadow="md" borderRadius="lg" w="60%" my={5} p={4}>
        <Flex
          align="center"
          justify="center"
          h="200px"
          direction="column"
          gap={3}
        >
          <Text fontSize="lg" fontWeight="medium" color="gray.600">
            No Quiz Data Available
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Complete some quizzes to see your progress chart here.
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="white" boxShadow="md" borderRadius="lg" w="60%" my={5} p={4}>
       <Heading as="h2" mb={4} fontSize="md">
        Quiz Analytics
      </Heading>
      <Chart.Root maxH="md" chart={chart}>
        <BarChart data={chart.data}>
          <CartesianGrid
            stroke={chart.color("border.muted")}
            vertical={false}
          />
          <XAxis
            axisLine={false}
            tickLine={false}
            dataKey={chart.key("month")}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            stroke={chart.color("border.emphasized")}
            tickFormatter={chart.formatNumber()}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: chart.color("bg.muted") }}
            animationDuration={100}
            content={<Chart.Tooltip />}
            formatter={(value: number) => [`${value}%`, "Score"]}
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