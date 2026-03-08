"use client";

import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  HStack,
  Progress,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { RiCompassesLine } from "react-icons/ri";
import { courseConfig } from "@/student-app/utils/courseConstants";

interface CourseProgress {
  title: string;
  progress: number;
  totalVideos: number;
  watchedVideos: number;
  dbCourseName: string;
}

const Analytics = () => {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const { authdStudent } = useAuthdStudentData();

  const INITIAL_COURSES_TO_SHOW = 3;

  const getCourseColor = (dbCourseName: string): string =>
    courseConfig[dbCourseName.toLowerCase()]?.color || "#718096";

  // Fix 2 & 3: derive everything inside the effect so there are no stale closures,
  // and depend on registered_courses so the effect re-runs if it loads late.
  useEffect(() => {
    if (!authdStudent?.id) return;

    // Fix 2: parse registered_courses inside the effect
    const raw = authdStudent.registered_courses ?? "[]";
    const registeredCourses: string[] = Array.isArray(raw)
      ? raw
      : (() => {
          try { return JSON.parse(raw as string); }
          catch { return (raw as string).split(",").map((c) => c.trim()); }
        })();

    if (registeredCourses.length === 0) {
      setCourses([]);
      setIsLoading(false);
      return;
    }

    const initZero = () =>
      registeredCourses.map((dbName) => ({
        title: courseConfig[dbName.toLowerCase()]?.displayName || dbName,
        progress: 0,
        totalVideos: 0,
        watchedVideos: 0,
        dbCourseName: dbName,
      }));

    const fetchVideoProgress = async () => {
      try {
        setIsLoading(true);

        // Fix 1: fetch all subjects in ONE query instead of N sequential calls
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, name")
          .in("name", registeredCourses);

        if (subjectsError || !subjectsData?.length) {
          setCourses(initZero());
          return;
        }

        const subjectIdByName = Object.fromEntries(
          subjectsData.map((s) => [s.name, s.id])
        );
        const allSubjectIds = subjectsData.map((s) => s.id);

        // Fix 1: single videos query for all subjects at once
        const [{ data: allVideos, error: videosError }, { data: videoProgress, error: progressError }] =
          await Promise.all([
            supabase
              .from("resources")
              .select("id, topics(subject_id)")
              .eq("type", "video")
              .in("topics.subject_id", allSubjectIds),
            supabase
              .from("video_progress")
              .select("video_id, completed, progress")
              .eq("student_id", authdStudent.id),
          ]);

        if (videosError || progressError) {
          setCourses(initZero());
          return;
        }

        const progressMap = Object.fromEntries(
          (videoProgress ?? []).map((vp) => [vp.video_id, vp])
        );

        const courseProgress: CourseProgress[] = registeredCourses.map((dbName) => {
          const config = courseConfig[dbName.toLowerCase()];
          const subjectId = subjectIdByName[dbName];

          if (!subjectId) {
            return {
              title: config?.displayName || dbName,
              progress: 0, totalVideos: 0, watchedVideos: 0, dbCourseName: dbName,
            };
          }

          const subjectVideos = (allVideos ?? []).filter(
            (v) => v.topics?.subject_id === subjectId
          );
          const totalVideos = subjectVideos.length;

          if (totalVideos === 0) {
            return {
              title: config?.displayName || dbName,
              progress: 0, totalVideos: 0, watchedVideos: 0, dbCourseName: dbName,
            };
          }

          const watchedCount = subjectVideos.filter((v) => {
            const p = progressMap[v.id];
            return p && (p.completed || p.progress >= 80);
          }).length;

          return {
            title: config?.displayName || dbName,
            progress: Math.round((watchedCount / totalVideos) * 100),
            totalVideos,
            watchedVideos: watchedCount,
            dbCourseName: dbName,
          };
        });

        setCourses(courseProgress);
      } catch (error) {
        console.error("Error in fetchVideoProgress:", error);
        setCourses(initZero());
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoProgress();
  // Fix 3: also depend on registered_courses so the effect re-runs if it loads late
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authdStudent?.id, authdStudent?.registered_courses]);

  const sortedCourses = [...courses].sort((a, b) => b.progress - a.progress);
  const coursesToShow = showAllCourses
    ? sortedCourses
    : sortedCourses.slice(0, INITIAL_COURSES_TO_SHOW);
  const hasMoreCourses = sortedCourses.length > INITIAL_COURSES_TO_SHOW;

  if (isLoading || courses.length === 0) {
    return (
      <Box
        bg="white"
        boxShadow="md"
        borderRadius="lg"
        w={{ base: "100%", md: "40%" }}
        h="65vh"
        p={4}
        ml={{ md: 5 }}
      >
        <Heading as="h2" mb={4} fontSize="md">Learning Analytics</Heading>
        {isLoading ? (
          <Text fontSize="xs">Loading statistics...</Text>
        ) : (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
            No course data available.
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      w={{ base: "100%", md: "40%" }}
      my={{ base: 5, md: 0 }}
      ml={{ md: 5 }}
      p={4}
      h="65vh"
      display="flex"
      flexDirection="column"
    >
      {/* Fix 4: heading stays fixed, only the list scrolls */}
      <Heading as="h2" mb={4} fontSize="md" flexShrink={0}>
        Learning Analytics
      </Heading>

      <Box overflowY="auto" flex={1}>
        {coursesToShow.map((course, idx) => (
          <Box key={idx} px={2} my={{ base: 8, md: 5, lg: 8 }}>
            <Flex justify="space-between" align="center" mb={3}>
              <HStack>
                <Icon
                  color="white"
                  bg={getCourseColor(course.dbCourseName)}
                  h={8} w={8} p={2} rounded="lg"
                >
                  <RiCompassesLine />
                </Icon>
                <Text fontSize="xs" fontWeight="medium" textTransform="capitalize">
                  {course.title}
                </Text>
              </HStack>
              <Text fontSize="xs">{course.progress}%</Text>
            </Flex>
            <Progress.Root value={course.progress} colorPalette="cyan" size="xs">
              <Progress.Track flex="1">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Box>
        ))}

        {hasMoreCourses && (
          <Flex justify="center" mt={2}>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowAllCourses(!showAllCourses)}
              color="blue.600"
            >
              {showAllCourses ? "View less" : "View all"}
              {showAllCourses ? <LuChevronUp /> : <LuChevronDown />}
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default Analytics;