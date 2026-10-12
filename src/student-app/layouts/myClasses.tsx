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
          console.warn("Notice fetching video progress:", error?.message || error);
          setActiveClassesCount(0);
          setRecentActivity([]);
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
      } catch (error: any) {
        console.warn("Notice calculating active classes:", error?.message || error);
        setActiveClassesCount(0);
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    calculateActiveClasses();
  }, [authdStudent?.id, authdStudent?.registered_courses]);

  const displayActiveClasses = isLoading ? "..." : activeClassesCount;

  return (
    <Flex w="full">
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="2xl"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.04)"
        w="full"
        my={4}
        p={{ base: 4, sm: 5 }}
      >
        <Heading
          as="h2"
          fontSize={{ base: "15px", md: "16px" }}
          fontWeight="700"
          color="#1E293B"
          mb={3.5}
        >
          {t("my_classes", "My Classes")}
        </Heading>

        <Flex
          direction="row"
          justify="space-between"
          alignItems="stretch"
          gap={{ base: 3, sm: 4 }}
          w="full"
        >
          {/* Registered Courses Card */}
          <Box
            display="flex"
            alignItems="center"
            flex={1}
            minW={0}
            bg="#F4F7FB"
            borderRadius="xl"
            p={{ base: 3, sm: 4, md: 5 }}
          >
            <Image
              src={childrenBox_ico}
              boxSize={{ base: "38px", sm: "44px", md: "50px" }}
              flexShrink={0}
              alt="Registered courses"
            />
            <Box ml={{ base: 2.5, sm: 3.5, md: 4 }} minW={0} flex={1}>
              <Text
                fontSize={{ base: "11px", sm: "12px", md: "13px" }}
                color="#64748B"
                fontWeight="500"
                lineHeight="1.25"
                whiteSpace="normal"
                wordBreak="normal"
              >
                {t("registered_courses", "Registered courses")}
              </Text>
              <Heading
                as="h3"
                fontSize={{ base: "20px", sm: "24px", md: "26px" }}
                fontWeight="800"
                color="#1E293B"
                lineHeight="1.1"
                mt={0.5}
              >
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
              alignItems="center"
              flex={1}
              minW={0}
              bg="#F4F7FB"
              borderRadius="xl"
              p={{ base: 3, sm: 4, md: 5 }}
              cursor="help"
            >
              <Image
                src={activeChildrenBox_ico}
                boxSize={{ base: "38px", sm: "44px", md: "50px" }}
                flexShrink={0}
                alt="Active classes"
              />
              <Box ml={{ base: 2.5, sm: 3.5, md: 4 }} minW={0} flex={1}>
                <Text
                  fontSize={{ base: "11px", sm: "12px", md: "13px" }}
                  color="#64748B"
                  fontWeight="500"
                  lineHeight="1.25"
                  whiteSpace="normal"
                  wordBreak="normal"
                >
                  {t("active_classes", "Active classes")}
                </Text>
                <Heading
                  as="h3"
                  fontSize={{ base: "20px", sm: "24px", md: "26px" }}
                  fontWeight="800"
                  color="#1E293B"
                  lineHeight="1.1"
                  mt={0.5}
                >
                  {typeof displayActiveClasses === "number" && displayActiveClasses < 10
                    ? `0${displayActiveClasses}`
                    : displayActiveClasses}
                </Heading>
              </Box>
            </Box>
          </Tooltip>
        </Flex>
      </Box>
    </Flex>
  );
};

export default MyClasses;