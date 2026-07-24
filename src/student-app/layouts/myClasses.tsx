"use client";

import { useMemo, useEffect, useState } from "react";
import { Box, Flex, Text, Image, Heading } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "../context/studentDataContext";
import { useTranslation } from "react-i18next";
import childrenBox_ico from "../../assets/childrenBox_ico.png";
import activeChildrenBox_ico from "../../assets/activeChildrenBox_ico.png";

interface CourseProgress {
  subject: string;
  lastActivity: string;
}

const MyClasses = () => {
  const { authdStudent } = useAuthdStudentData();
  const { t } = useTranslation();
  const [activeClassesCount, setActiveClassesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<CourseProgress[]>([]);

  // Helper function to convert registered_courses to a normalized array safely
  const getStudentCoursesArray = (): string[] => {
    const registeredCourses = authdStudent?.registered_courses;
    if (!registeredCourses) return [];

    if (Array.isArray(registeredCourses)) {
      return registeredCourses.map(c => String(c).toLowerCase().trim());
    }

    if (typeof registeredCourses === "string") {
      try {
        const parsed = JSON.parse(registeredCourses as any);
        if (Array.isArray(parsed)) {
          return parsed.map(c => String(c).toLowerCase().trim());
        }
        return [String(registeredCourses).toLowerCase().trim()];
      } catch {
        return String(registeredCourses)
          .split(",")
          .map((course: string) => course.trim().toLowerCase());
      }
    }

    return [String(registeredCourses).toLowerCase().trim()];
  };

  const coursesCount = useMemo(() => {
    return getStudentCoursesArray().length;
  }, [authdStudent?.registered_courses]);

  // RESTORED: Fixed structural visibility for date parse format
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays <= 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  useEffect(() => {
    const calculateActiveClasses = async () => {
      if (!authdStudent?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const registeredCourses = getStudentCoursesArray();
        if (registeredCourses.length === 0) {
          setActiveClassesCount(0);
          setIsLoading(false);
          return;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: videoProgress, error } = await supabase
          .from("video_progress")
          .select(`
            video_id,
            progress,
            completed,
            last_watched,
            resources (
              topic_id,
              topics (
                subject_id,
                subjects (name)
              )
            )
          `)
          .eq("student_id", authdStudent.id)
          .gte("last_watched", thirtyDaysAgo.toISOString())
          .gte("progress", 10)
          .order("last_watched", { ascending: false });

        

        console.log("video progress from active classes : ", videoProgress)

        if (error) {
          console.error("Error fetching video progress:", error);
          setActiveClassesCount(0);
          setIsLoading(false);
          return;
        }

        const subjectActivity = new Map<string, string>();
        
        videoProgress?.forEach((progress: any) => {
          // Robust data extraction mapping both singular and array response structures seamlessly
          const resourceObj = Array.isArray(progress.resources) ? progress.resources[0] : progress.resources;
          const topicObj = resourceObj?.topics ? (Array.isArray(resourceObj.topics) ? resourceObj.topics[0] : resourceObj.topics) : null;
          const subjectObj = topicObj?.subjects ? (Array.isArray(topicObj.subjects) ? topicObj.subjects[0] : topicObj.subjects) : null;
          
          if (subjectObj && subjectObj.name) {
            const subjectName = subjectObj.name;
            const normalizedName = subjectName.toLowerCase().trim();
        
            if (registeredCourses.includes(normalizedName)) {
              const currentLatest = subjectActivity.get(subjectName);
              if (!currentLatest || progress.last_watched > currentLatest) {
                subjectActivity.set(subjectName, progress.last_watched);
              }
            }
          }
        });
        
        setActiveClassesCount(subjectActivity.size);

        const activityArray = Array.from(subjectActivity.entries())
          .map(([subject, lastActivity]) => ({
            subject,
            lastActivity,
          }))
          .sort(
            (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
          );

        setRecentActivity(activityArray);
      } catch (error) {
        console.error("Error calculating active classes:", error);
        setActiveClassesCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    calculateActiveClasses();
  }, [authdStudent?.id, authdStudent?.registered_courses]);

  const displayActiveClasses = isLoading ? "..." : activeClassesCount;

  return (
    <>
      <Flex w="full">
        <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
          <Heading as="h1" fontSize='md' my={2}>
            {t("my_classes")}
          </Heading>
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            alignItems="center"
          >
            {/* Registered Courses Card */}
            <Box
              display="flex"
              justifyItems="space-between"
              alignItems="center"
              w={{ base: "full", lg: "48%" }}
              bg="gray.50"
              borderRadius="lg"
              p={{ base: "3", md: "6", lg: "8" }}
              my={2}
            >
              <Image src={childrenBox_ico} boxSize="57px" />
              <Box mx={5}>
                <Text fontSize={{ base: "sm", lg: "md" }} mb={1} color="#333951">
                  {t("registered_courses")}
                </Text>
                <Heading as="h2" fontSize={{ base: "lg", md: "xl", lg: "2xl" }} color="#333951">
                  {coursesCount < 10 ? `0${coursesCount}` : coursesCount}
                </Heading>
              </Box>
            </Box>

            {/* Active Classes Card */}
            <Tooltip
              content={
                recentActivity.length > 0
                  ? `Recently active: ${recentActivity.map((a) => a.subject).join(", ")}`
                  : "No recent activity in any courses"
              }
            >
              <Box
                display="flex"
                justifyItems="space-between"
                alignItems="center"
                w={{ base: "full", lg: "48%" }}
                bg="gray.50"
                borderRadius="lg"
                p={{ base: "3", md: "6", lg: "8" }}
                my={2}
                cursor="help"
              >
                <Image src={activeChildrenBox_ico} boxSize="57px" />
                <Box mx={5}>
                  <Text fontSize={{ base: "sm", lg: "md" }} mb={1} color="#333951">
                    {t("active_classes")}
                  </Text>
                  <Heading as="h2" fontSize={{ base: "lg", md: "xl", lg: "2xl" }} color="#333951">
                    {typeof displayActiveClasses === "number" && displayActiveClasses < 10 ? `0${displayActiveClasses}` : displayActiveClasses}
                  </Heading>
                </Box>
              </Box>
            </Tooltip>
          </Flex>
        </Box>
      </Flex>

      {/* Detailed Activity Breakdown Wrapper placed perfectly at row bounds container */}
      {!isLoading && recentActivity.length > 0 && (
        <Box p={4} m={1} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.100">
          <Text fontSize="xs" fontWeight="semibold" color="green.800" mb={2}>
            {t("recent_activity")}:
          </Text>
          <Flex flexWrap="wrap" gap={2}>
            {recentActivity.slice(0, 3).map((activity, index) => (
              <Box
                key={index}
                bg="green.100"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="11px"
                fontWeight="500"
                color="green.800"
              >
                {activity.subject} ({formatRelativeTime(activity.lastActivity)})
              </Box>
            ))}
            {recentActivity.length > 3 && (
              <Box
                bg="green.200"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="11px"
                fontWeight="600"
                color="green.900"
              >
                +{recentActivity.length - 3} more
              </Box>
            )}
          </Flex>
        </Box>
      )} 
    </>
  );
};

export default MyClasses;