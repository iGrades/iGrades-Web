"use client";

import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { courseConfig } from "@/student-app/utils/courseConstants";

interface QuizProgressData {
  month: string;
  averageScore: number;
  courseScores: Record<string, number>;
}

interface SubjectData {
  name: string;
  color: string;
}

const getSubjectDisplayName = (dbName: string): string => {
  if (!dbName) return "General";
  return courseConfig[dbName.toLowerCase()]?.displayName || dbName;
};

const getSubjectColor = (dbName: string): string => {
  if (!dbName) return "#718096";
  return courseConfig[dbName.toLowerCase()]?.color || "#718096";
};

const generateInitialMonths = (): QuizProgressData[] => {
  const result: QuizProgressData[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    result.push({
      month: d.toLocaleString("en-US", { month: "long" }),
      averageScore: 0,
      courseScores: {},
    });
  }
  return result;
};

const HomeChart = () => {
  const [quizProgress, setQuizProgress] = useState<QuizProgressData[]>(generateInitialMonths);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [overallAverage, setOverallAverage] = useState(0);
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
        fourMonthsAgo.setDate(1);
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 3);
        fourMonthsAgo.setHours(0, 0, 0, 0);

        const [attemptsRes, quizScoresRes, answersRes] = await Promise.allSettled([
          supabase
            .from("attempts")
            .select("id, subject_id, score, started_at, completed_at, status, subjects(id, name)")
            .eq("student_id", authdStudent.id),
          supabase
            .from("quiz_scores")
            .select("attempt_id, subject_id, score, completed_at")
            .eq("student_id", authdStudent.id),
          supabase
            .from("attempt_answers")
            .select("attempt_id, question_id, selected_option, questions(correct_option)")
            .eq("student_id", authdStudent.id),
        ]);

        const rawAttempts = attemptsRes.status === "fulfilled" ? attemptsRes.value.data || [] : [];
        const rawQuizScores = quizScoresRes.status === "fulfilled" ? quizScoresRes.value.data || [] : [];
        const rawAnswers = answersRes.status === "fulfilled" ? answersRes.value.data || [] : [];

        // Build item answer stats per attempt to heal any 0% placeholder scores
        const answersByAttempt = new Map<string, { total: number; correct: number }>();
        rawAnswers.forEach((ans: any) => {
          if (!ans.attempt_id) return;
          const curr = answersByAttempt.get(ans.attempt_id) || { total: 0, correct: 0 };
          curr.total += 1;
          const isCorrect = ans.selected_option && ans.questions?.correct_option
            ? ans.selected_option.trim().toUpperCase() === ans.questions.correct_option.trim().toUpperCase()
            : false;
          if (isCorrect) curr.correct += 1;
          answersByAttempt.set(ans.attempt_id, curr);
        });

        const quizScoresMap = new Map<string, number>();
        rawQuizScores.forEach((qs: any) => {
          if (qs.attempt_id && qs.score !== null && qs.score !== undefined) {
            quizScoresMap.set(qs.attempt_id, Number(qs.score));
          }
        });

        // Parse registered courses safely
        let registeredCourses: string[] = [];
        const raw = authdStudent.registered_courses;
        if (Array.isArray(raw)) {
          registeredCourses = raw;
        } else if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              registeredCourses = parsed;
            }
          } catch {
            registeredCourses = raw.split(",").map((c) => c.trim()).filter(Boolean);
          }
        }

        const allStudentSubjects: SubjectData[] = registeredCourses.map((dbName) => ({
          name: getSubjectDisplayName(dbName),
          color: getSubjectColor(dbName),
        }));

        // Build the last-4-months skeleton safely with setDate(1)
        const monthSlots: { key: string; name: string; date: Date }[] = [];
        const monthlyData: Record<string, QuizProgressData> = {};

        for (let i = 3; i >= 0; i--) {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() - i);
          const monthName = d.toLocaleString("en-US", { month: "long" });
          const year = d.getFullYear();
          const monthKey = `${year}-${d.getMonth()}`;

          monthSlots.push({ key: monthKey, name: monthName, date: d });
          monthlyData[monthKey] = {
            month: monthName,
            averageScore: 0,
            courseScores: {},
          };

          allStudentSubjects.forEach((s) => {
            monthlyData[monthKey].courseScores[s.name] = 0;
          });
        }

        // Map attempts into month slots
        const monthlyScoresMap: Record<string, Record<string, number[]>> = {};
        monthSlots.forEach((slot) => {
          monthlyScoresMap[slot.key] = {};
        });

        rawAttempts.forEach((attempt: any) => {
          const rawDate = attempt.completed_at || attempt.started_at;
          if (!rawDate) return;

          const attemptDate = new Date(rawDate);
          const aKey = `${attemptDate.getFullYear()}-${attemptDate.getMonth()}`;

          if (!monthlyScoresMap[aKey]) return;

          let score = Number(attempt.score) || 0;
          const qsScore = quizScoresMap.get(attempt.id);
          const ansStats = answersByAttempt.get(attempt.id);

          if (score <= 0 && qsScore !== undefined && qsScore > 0) {
            score = qsScore;
          } else if (score <= 0 && ansStats && ansStats.total > 0) {
            score = Math.round((ansStats.correct / ansStats.total) * 100);
          }

          const subjectObj = Array.isArray(attempt.subjects)
            ? attempt.subjects[0]
            : attempt.subjects;

          const rawSubjectName = subjectObj?.name || attempt.subject_id || "General";
          const displayName = getSubjectDisplayName(rawSubjectName);
          const cleanScore = Math.max(0, Math.min(100, Math.round(score)));

          if (!monthlyScoresMap[aKey][displayName]) {
            monthlyScoresMap[aKey][displayName] = [];
          }
          monthlyScoresMap[aKey][displayName].push(cleanScore);

          if (!allStudentSubjects.some((s) => s.name.toLowerCase() === displayName.toLowerCase())) {
            allStudentSubjects.push({
              name: displayName,
              color: getSubjectColor(rawSubjectName),
            });
          }
        });

        let totalAttemptsCount = 0;
        let cumulativeScoreSum = 0;

        monthSlots.forEach((slot) => {
          const slotScoresMap = monthlyScoresMap[slot.key];
          const courseNames = Object.keys(slotScoresMap);
          const mData = monthlyData[slot.key];

          if (courseNames.length > 0) {
            let monthSum = 0;
            courseNames.forEach((cName) => {
              const scores = slotScoresMap[cName];
              const bestScore = Math.max(...scores);
              mData.courseScores[cName] = bestScore;
              monthSum += bestScore;
              totalAttemptsCount += scores.length;
              cumulativeScoreSum += scores.reduce((a, b) => a + b, 0);
            });
            mData.averageScore = Math.round(monthSum / courseNames.length);
          } else {
            mData.averageScore = 0;
          }
        });

        const finalProgress = monthSlots.map((slot) => monthlyData[slot.key]);
        setQuizProgress(finalProgress);
        setSubjects(allStudentSubjects);
        setTotalAttempts(totalAttemptsCount);
        setOverallAverage(totalAttemptsCount > 0 ? Math.round(cumulativeScoreSum / totalAttemptsCount) : 0);
      } catch (err: any) {
        console.warn("Chart fetch notice:", err?.message || err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizProgress();
  }, [authdStudent?.id, authdStudent?.registered_courses]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = quizProgress.find((item) => item.month === label);
    if (!dataPoint) return null;

    const courseEntries = Object.entries(dataPoint.courseScores || {});
    const activeCourses = courseEntries.filter(([, score]) => score > 0);

    return (
      <Box
        bg="white"
        p={3}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        boxShadow="lg"
        zIndex={100}
        minW="180px"
      >
        <Text fontWeight="bold" fontSize="sm" mb={1} color="gray.800">
          {label}
        </Text>
        <Text fontSize="sm" mb={2} color="#3182CE">
          Average Score: <strong>{payload[0]?.value ?? 0}%</strong>
        </Text>

        <Box borderTop="1px solid" borderColor="gray.100" pt={2} mt={1}>
          <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={1.5}>
            Course Breakdown:
          </Text>
          {activeCourses.length > 0 ? (
            activeCourses.map(([courseName, score]) => {
              const color = getSubjectColor(courseName);
              return (
                <Flex key={courseName} align="center" justify="space-between" gap={3} mb={1}>
                  <Flex align="center" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg={color} flexShrink={0} />
                    <Text fontSize="xs" color="gray.700" noOfLines={1}>
                      {courseName}
                    </Text>
                  </Flex>
                  <Text fontSize="xs" fontWeight="bold" color="gray.800">
                    {score}%
                  </Text>
                </Flex>
              );
            })
          ) : (
            <Text fontSize="xs" color="gray.400" fontStyle="italic">
              No completed quizzes in this month
            </Text>
          )}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box
        bg="white"
        boxShadow="md"
        borderRadius="lg"
        w={{ base: "100%", md: "60%" }}
        p={4}
        h="68.5vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <DancingLogoLoader size="md" text="Loading Quiz Analytics..." minH="260px" />
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      w={{ base: "100%", md: "60%" }}
      p={4}
      h="68.5vh"
      display="flex"
      flexDirection="column"
    >
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        mb={3}
        flexShrink={0}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Heading fontSize="md" color="gray.800">
            Quiz Analytics (Last 4 Months)
          </Heading>
          <Text fontSize="xs" color="gray.500">
            Average monthly performance across completed quizzes
          </Text>
        </Box>
        {totalAttempts > 0 ? (
          <Box px={3} py={1} bg="blue.50" borderRadius="full" border="1px solid" borderColor="blue.200">
            <Text fontSize="xs" fontWeight="semibold" color="blue.700">
              Avg: {overallAverage}% ({totalAttempts} {totalAttempts === 1 ? "quiz" : "quizzes"})
            </Text>
          </Box>
        ) : (
          <Box px={3} py={1} bg="gray.50" borderRadius="full" border="1px solid" borderColor="gray.200">
            <Text fontSize="xs" color="gray.500">
              0 quizzes taken
            </Text>
          </Box>
        )}
      </Flex>

      <Box flex="1" w="100%" minH="260px" position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={quizProgress}
            margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(v) => (v ? v.slice(0, 3) : "")}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#718096", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#718096", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#EDF2F7", opacity: 0.6 }} />
            <Bar
              dataKey="averageScore"
              fill="#3182CE"
              barSize={44}
              radius={[6, 6, 0, 0]}
              minPointSize={6}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {subjects.length > 0 && (
        <Flex wrap="wrap" gap={2} mt={2} pt={2} borderTop="1px solid" borderColor="gray.100" flexShrink={0} justify="center">
          {subjects.slice(0, 6).map((s) => (
            <Flex key={s.name} align="center" gap={1} fontSize="xs" color="gray.600">
              <Box w="6px" h="6px" borderRadius="full" bg={s.color} />
              <Text fontSize="2xs" color="gray.500">{s.name}</Text>
            </Flex>
          ))}
        </Flex>
      )}

      {totalAttempts === 0 && (
        <Text fontSize="xs" color="gray.400" textAlign="center" mt={1} flexShrink={0}>
          Take quizzes in your subjects to grow your monthly performance bars
        </Text>
      )}
    </Box>
  );
};

export default HomeChart;