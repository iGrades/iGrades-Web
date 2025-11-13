

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
import ProgressBar from "./progress";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { RiCompassesLine } from "react-icons/ri";

interface CourseProgress {
  title: string;
  progress: number;
  totalVideos: number;
  watchedVideos: number;
  dbCourseName: string; // Add this to track the original course name
}

// interface VideoProgress {
//   video_id: string;
//   progress: number;
//   completed: boolean;
//   last_watched: string;
// }

const Analytics = () => {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const { authdStudent } = useAuthdStudentData();

  // Number of courses to show initially
  const INITIAL_COURSES_TO_SHOW = 3;

  // Use the same courseConfig mapping for consistency
  const courseConfig: Record<string, { displayName: string; color: string }> = {
    // JUNIOR SECONDARY COURSES
    juniorMath: { displayName: "Mathematics", color: "#F26946" },
    juniorEng: { displayName: "English", color: "#4ECDC4" },
    basicScience: { displayName: "Basic Science", color: "#45B7D1" },
    basicTech: { displayName: "Basic Technology", color: "#F9A826" },
    socialStudies: { displayName: "Social Studies", color: "#E84855" },
    civicEdu: { displayName: "Civic Education", color: "#7D70BA" },
    businessStudies: { displayName: "Business Studies", color: "#2A9D8F" },
    homeEconomics: { displayName: "Home Economics", color: "#E76F51" },
    juniorAgric: { displayName: "Agricultural Science", color: "#2A9D8F" },
    physicalEdu: { displayName: "Physical Education", color: "#E63946" },
    juniorComp: { displayName: "Computer Studies", color: "#3A86FF" },
    creativeArts: { displayName: "Creative Arts", color: "#8338EC" },
    music: { displayName: "Music", color: "#FB5607" },

    // SENIOR SECONDARY COURSES
    seniorMath: { displayName: "General Mathematics", color: "#FF6B6B" },
    seniorEng: { displayName: "English", color: "#4ECDC4" },
    physics: { displayName: "Physics", color: "#F06595" },
    chemistry: { displayName: "Chemistry", color: "#339AF0" },
    biology: { displayName: "Biology", color: "#51CF66" },
    furtherMath: { displayName: "Further Mathematics", color: "#FF922B" },
    economics: { displayName: "Economics", color: "#CC5DE8" },
    accounting: { displayName: "Accounting", color: "#20C997" },
    commerce: { displayName: "Commerce", color: "#FDA7DF" },
    government: { displayName: "Government", color: "#D980FA" },
    literature: { displayName: "Literature", color: "#B53471" },
    history: { displayName: "History", color: "#EE5A24" },
    geography: { displayName: "Geography", color: "#A3CB38" },
    fineArts: { displayName: "Fine Arts", color: "#FFC312" },
    seniorComp: { displayName: "Computer Science", color: "#1289A7" },
    french: { displayName: "French", color: "#6F1E51" },
  };

  // Helper function to get course color
  const getCourseColor = (dbCourseName: string): string => {
    return courseConfig[dbCourseName]?.color || "#F26946"; // Fallback color
  };

  useEffect(() => {
    const fetchVideoProgress = async () => {
      if (!authdStudent?.id) return;

      try {
        setIsLoading(true);

        // Get student's registered courses
        const registeredCourses = getStudentCoursesArray();
        if (registeredCourses.length === 0) {
          setCourses([]);
          return;
        }

        // Get all video progress for this student
        const { data: videoProgress, error: progressError } = await supabase
          .from("video_progress")
          .select("*")
          .eq("student_id", authdStudent.id);

        if (progressError) {
          console.error("Error fetching video progress:", progressError);
          // If table doesn't exist, initialize with zero progress
          initializeWithZeroProgress(registeredCourses);
          return;
        }

        // Get all videos with their topics and subjects
        const { data: allVideos, error: videosError } = await supabase
          .from("resources")
          .select(
            `
            id,
            title,
            topic_id,
            topics (
              id,
              name,
              subject_id,
              subjects (
                id,
                name
              )
            )
          `
          )
          .eq("type", "video");

        if (videosError) {
          console.error("Error fetching videos:", videosError);
          initializeWithZeroProgress(registeredCourses);
          return;
        }

        // Calculate progress for each course
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

  // Helper function to convert registered_courses to an array (same as before)
  const getStudentCoursesArray = (): string[] => {
    const registeredCourses = authdStudent?.registered_courses;

    if (!registeredCourses) return [];

    if (Array.isArray(registeredCourses)) {
      return registeredCourses;
    }

    if (typeof registeredCourses === "string") {
      try {
        const parsed = JSON.parse(registeredCourses);
        return Array.isArray(parsed) ? parsed : [registeredCourses];
      } catch {
        return (registeredCourses as string)
          .split(",")
          .map((course: string) => course.trim());
      }
    }

    return [String(registeredCourses)];
  };

  // Initialize with zero progress if no data found
  const initializeWithZeroProgress = (registeredCourses: string[]) => {
    const zeroProgressCourses = registeredCourses.map((dbCourseName) => {
      const displayName =
        courseConfig[dbCourseName]?.displayName || dbCourseName;
      return {
        title: displayName,
        progress: 0,
        totalVideos: 0,
        watchedVideos: 0,
        dbCourseName, // Store the original course name for color lookup
      };
    });
    setCourses(zeroProgressCourses);
  };

  // Calculate progress for each course
  const calculateCourseProgress = async (
    registeredCourses: string[],
    allVideos: any[],
    videoProgress: any[]
  ): Promise<CourseProgress[]> => {
    const courseProgress: CourseProgress[] = [];

    for (const dbCourseName of registeredCourses) {
      const displayName =
        courseConfig[dbCourseName]?.displayName || dbCourseName;

      try {
        // Get subject ID for this course
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", dbCourseName)
          .single();

        if (subjectError || !subjectData) {
          console.log(`No subject found for: ${dbCourseName}`);
          courseProgress.push({
            title: displayName,
            progress: 0,
            totalVideos: 0,
            watchedVideos: 0,
            dbCourseName, // Store the original course name for color lookup
          });
          continue;
        }

        // Get topics for this subject
        const { data: topics, error: topicsError } = await supabase
          .from("topics")
          .select("id")
          .eq("subject_id", subjectData.id);

        if (topicsError || !topics || topics.length === 0) {
          courseProgress.push({
            title: displayName,
            progress: 0,
            totalVideos: 0,
            watchedVideos: 0,
            dbCourseName, // Store the original course name for color lookup
          });
          continue;
        }

       

        // Count total videos for this subject
        const subjectVideos = allVideos.filter(
          (video) => video.topics?.subject_id === subjectData.id
        );
        const totalVideos = subjectVideos.length;

        if (totalVideos === 0) {
          courseProgress.push({
            title: displayName,
            progress: 0,
            totalVideos: 0,
            watchedVideos: 0,
            dbCourseName, // Store the original course name for color lookup
          });
          continue;
        }

        // Count watched videos (progress > 80% or completed)
        const watchedVideos = subjectVideos.filter((video) => {
          const progress = videoProgress.find((vp) => vp.video_id === video.id);
          return progress && (progress.completed || progress.progress >= 80);
        }).length;

        const progress = Math.round((watchedVideos / totalVideos) * 100);

        courseProgress.push({
          title: displayName,
          progress,
          totalVideos,
          watchedVideos,
          dbCourseName, // Store the original course name for color lookup
        });
      } catch (error) {
        console.error(`Error calculating progress for ${dbCourseName}:`, error);
        courseProgress.push({
          title: displayName,
          progress: 0,
          totalVideos: 0,
          watchedVideos: 0,
          dbCourseName, // Store the original course name for color lookup
        });
      }
    }

    return courseProgress;
  };

  // Sort courses by progress (highest first) for better visibility
  const sortedCourses = [...courses].sort((a, b) => b.progress - a.progress);

  // Determine which courses to show
  const coursesToShow = showAllCourses
    ? sortedCourses
    : sortedCourses.slice(0, INITIAL_COURSES_TO_SHOW);

  // Check if there are more courses to show
  const hasMoreCourses = sortedCourses.length > INITIAL_COURSES_TO_SHOW;

  if (isLoading) {
    return (
      <Box
        bg="white"
        boxShadow="md"
        borderRadius="lg"
        w="40%"
        ml={{ md: 5 }}
        my={{ md: 5 }}
        p={4}
      >
        <Heading as="h2" mb={4} fontSize="sm">
          Learning Analytics
        </Heading>
        <Flex direction="column" gap={3}>
          {[1, 2, 3].map((_, idx) => (
            <Box key={idx}>
              <Text
                bg="gray.200"
                height="4"
                width="20"
                mb={2}
                borderRadius="sm"
              />
              <ProgressBar
                value={0}
                size="sm"
                hasStripe={false}
                isAnimated={false}
                mb={4}
                text=""
              />
            </Box>
          ))}
        </Flex>
      </Box>
    );
  }

  if (courses.length === 0) {
    return (
      <Box
        bg="white"
        boxShadow="md"
        borderRadius="lg"
        w="40%"
        ml={{ md: 5 }}
        my={{ md: 5 }}
        p={4}
      >
        <Heading as="h2" mb={4} fontSize="md">
          Learning Analytics
        </Heading>
        <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
          No courses registered or no video data available.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      w="40%"
      ml={{ md: 5 }}
      my={{ md: 5 }}
      p={4}
    >
      <Heading as="h2" mb={4} fontSize="md">
        Learning Analytics
      </Heading>

      {/* Visible Courses */}
      {coursesToShow.map((course, idx) => (
        <Box
          key={idx}
          opacity={showAllCourses || idx < INITIAL_COURSES_TO_SHOW ? 1 : 0}
          transform={
            showAllCourses || idx < INITIAL_COURSES_TO_SHOW
              ? "translateY(0)"
              : "translateY(-10px)"
          }
          transition="all 0.3s ease"
          px={2}
          my={8}
        >
          <Flex justify="space-between" align="center" mb={5}>
            <HStack>
              <Icon
                color="white"
                bg={getCourseColor(course.dbCourseName)}
                h={8}
                w={8}
                p={2}
                rounded="lg"
              >
                <RiCompassesLine />
              </Icon>
              <Text fontSize="xs" fontWeight="medium">
                {course.title}
              </Text>
            </HStack>

            <Text fontSize="xs">{course.progress}%</Text>
          </Flex>
          <Progress.Root
            value={course.progress}
            maxW="sm"
            colorPalette="cyan"
            size="xs"
          >
            <HStack gap="5">
              <Progress.Track flex="1">
                <Progress.Range />
              </Progress.Track>
            </HStack>
          </Progress.Root>
        </Box>
      ))}

      {/* Show More/Less Button */}
      {hasMoreCourses && (
        <Flex justify="center" mt={2}>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowAllCourses(!showAllCourses)}
            color="blue.600"
            fontWeight="normal"
            fontSize="sm"
          >
            {showAllCourses ? "View less" : `View all`}
            {showAllCourses ? <LuChevronUp /> : <LuChevronDown />}
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default Analytics;
