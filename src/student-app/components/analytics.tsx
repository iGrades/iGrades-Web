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
// import ProgressBar from "./progress";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { RiCompassesLine } from "react-icons/ri";
// Import the central configuration
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

  // Helper function to get course color from central config
  const getCourseColor = (dbCourseName: string): string => {
    return courseConfig[dbCourseName.toLowerCase()]?.color || "#718096";
  };

  useEffect(() => {
    const fetchVideoProgress = async () => {
      if (!authdStudent?.id) return;

      try {
        setIsLoading(true);

        const registeredCourses = getStudentCoursesArray();
        if (registeredCourses.length === 0) {
          setCourses([]);
          return;
        }

        // Fetch progress data
        const { data: videoProgress, error: progressError } = await supabase
          .from("video_progress")
          .select("*")
          .eq("student_id", authdStudent.id);

        if (progressError) {
          console.error("Error fetching video progress:", progressError);
          initializeWithZeroProgress(registeredCourses);
          return;
        }

        // Fetch all videos with nested subject info
        const { data: allVideos, error: videosError } = await supabase
          .from("resources")
          .select(`
            id,
            topic_id,
            topics (
              subject_id,
              subjects (
                name
              )
            )
          `)
          .eq("type", "video");

        if (videosError) {
          initializeWithZeroProgress(registeredCourses);
          return;
        }

        const courseProgress = await calculateCourseProgress(
          registeredCourses,
          allVideos || [],
          videoProgress || []
        );

        setCourses(courseProgress);
      } catch (error) {
        console.error("Error in fetchVideoProgress:", error);
        initializeWithZeroProgress(getStudentCoursesArray());
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoProgress();
  }, [authdStudent?.id]);

  const getStudentCoursesArray = (): string[] => {
    const registered = authdStudent?.registered_courses;
    if (!registered) return [];
    if (Array.isArray(registered)) return registered;
    try {
      const parsed = JSON.parse(registered as string);
      return Array.isArray(parsed) ? parsed : [registered as string];
    } catch {
      return (registered as string).split(",").map(c => c.trim());
    }
  };

  const initializeWithZeroProgress = (registeredCourses: string[]) => {
    const zeroProgress = registeredCourses.map((dbName) => ({
      title: courseConfig[dbName.toLowerCase()]?.displayName || dbName,
      progress: 0,
      totalVideos: 0,
      watchedVideos: 0,
      dbCourseName: dbName,
    }));
    setCourses(zeroProgress);
  };

  const calculateCourseProgress = async (
    registeredCourses: string[],
    allVideos: any[],
    videoProgress: any[]
  ): Promise<CourseProgress[]> => {
    const progressList: CourseProgress[] = [];

    for (const dbName of registeredCourses) {
      const config = courseConfig[dbName.toLowerCase()] || { displayName: dbName };
      
      try {
        // Find subject by the simplified name (id)
        const { data: subjectData } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", dbName)
          .single();

        if (!subjectData) {
          progressList.push({
            title: config.displayName,
            progress: 0, totalVideos: 0, watchedVideos: 0, dbCourseName: dbName,
          });
          continue;
        }

        const subjectVideos = allVideos.filter(
          (v) => v.topics?.subject_id === subjectData.id
        );
        
        const totalVideos = subjectVideos.length;
        if (totalVideos === 0) {
          progressList.push({
            title: config.displayName,
            progress: 0, totalVideos: 0, watchedVideos: 0, dbCourseName: dbName,
          });
          continue;
        }

        const watchedCount = subjectVideos.filter((v) => {
          const p = videoProgress.find((vp) => vp.video_id === v.id);
          return p && (p.completed || p.progress >= 80);
        }).length;

        progressList.push({
          title: config.displayName,
          progress: Math.round((watchedCount / totalVideos) * 100),
          totalVideos,
          watchedVideos: watchedCount,
          dbCourseName: dbName,
        });
      } catch {
        // Fallback for individual error
      }
    }
    return progressList;
  };

  const sortedCourses = [...courses].sort((a, b) => b.progress - a.progress);
  const coursesToShow = showAllCourses ? sortedCourses : sortedCourses.slice(0, INITIAL_COURSES_TO_SHOW);
  const hasMoreCourses = sortedCourses.length > INITIAL_COURSES_TO_SHOW;

  if (isLoading || courses.length === 0) {
    return (
      <Box bg="white" boxShadow="md" borderRadius="lg" w={{ base: "100%", md: "40%" }} h={{ md: '49vh', lg: '62vh' }} p={4} ml={{ md: 5 }}>
        <Heading as="h2" mb={4} fontSize="md">Learning Analytics</Heading>
        {isLoading ? <Text fontSize="xs">Loading statistics...</Text> : <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>No course data available.</Text>}
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
      h={{ md: '49vh', lg: '62vh' }}
      overflowY='scroll'
    >
      <Heading as="h2" mb={4} fontSize="md">Learning Analytics</Heading>

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
              <Text fontSize="xs" fontWeight="medium" textTransform='capitalize'>{course.title}</Text>
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
          <Button variant="ghost" size="xs" onClick={() => setShowAllCourses(!showAllCourses)} color="blue.600">
            {showAllCourses ? "View less" : `View all`}
            {showAllCourses ? <LuChevronUp /> : <LuChevronDown />}
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default Analytics;