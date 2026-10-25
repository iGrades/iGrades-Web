"use client";

import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  HStack,
  Progress,
  Badge,
  IconButton,
  Portal,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { RiCompassesLine } from "react-icons/ri";
import { FiX, FiChevronRight } from "react-icons/fi";
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupTop, setPopupTop] = useState(180);
  const cardRef = useRef<HTMLDivElement>(null);

  const { authdStudent } = useAuthdStudentData();

  const getCourseColor = (dbCourseName: string): string =>
    courseConfig[dbCourseName?.toLowerCase()]?.color || "#206CE1";

  // Derive everything inside the effect so there are no stale closures
  useEffect(() => {
    if (!authdStudent?.id) return;

    const raw = authdStudent.registered_courses ?? "[]";
    const registeredCourses: string[] = Array.isArray(raw)
      ? raw
      : (() => {
          try {
            return JSON.parse(raw as string);
          } catch {
            return (raw as string).split(",").map((c) => c.trim());
          }
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

        const [
          { data: allVideos, error: videosError },
          { data: videoProgress, error: progressError },
        ] = await Promise.all([
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
              progress: 0,
              totalVideos: 0,
              watchedVideos: 0,
              dbCourseName: dbName,
            };
          }

          const subjectVideos = (allVideos ?? []).filter((v) => {
            const topics = Array.isArray(v.topics) ? v.topics : [v.topics];
            return topics.some((t: any) => t?.subject_id === subjectId);
          });
          const totalVideos = subjectVideos.length;

          if (totalVideos === 0) {
            return {
              title: config?.displayName || dbName,
              progress: 0,
              totalVideos: 0,
              watchedVideos: 0,
              dbCourseName: dbName,
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
      } catch (error: any) {
        console.warn("Notice in fetchVideoProgress:", error?.message || error);
        setCourses(initZero());
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoProgress();
  }, [authdStudent?.id, authdStudent?.registered_courses]);

  // Sort courses descending by progress percentage
  const sortedCourses = [...courses].sort((a, b) => b.progress - a.progress);
  const topCourse = sortedCourses.length > 0 ? sortedCourses[0] : null;

  const handleOpenPopup = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      // Stop exactly at where the learning analytics section is located at the top
      const calculatedTop = Math.max(70, Math.floor(rect.top));
      setPopupTop(calculatedTop);
    }
    setIsPopupOpen(true);
  };

  // Close popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPopupOpen) {
        setIsPopupOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPopupOpen]);

  if (isLoading) {
    return (
      <Box
        ref={cardRef}
        bg="white"
        boxShadow="sm"
        borderRadius="xl"
        w="full"
        my={{ base: 1, md: 1.5 }}
        px={{ base: 3, md: 3.5 }}
        py={{ base: 1.5, md: 2 }}
        minH="52px"
      >
        <Flex justify="space-between" align="center" mb={1}>
          <Heading as="h2" fontSize={{ base: "12px", sm: "13px" }} color="gray.800" fontWeight="700">
            Learning Analytics
          </Heading>
        </Flex>
        <DancingLogoLoader size="xs" compact minH="24px" />
      </Box>
    );
  }

  return (
    <>
      <Box
        ref={cardRef}
        bg="white"
        boxShadow="sm"
        borderRadius="xl"
        w="full"
        my={{ base: 1, md: 1.5 }}
        px={{ base: 3, md: 3.5 }}
        py={{ base: 1.5, md: 2 }}
      >
        {/* Header: Title on left, 'See more' button on right */}
        <Flex justify="space-between" align="center" mb={1}>
          <Heading as="h2" fontSize={{ base: "12px", sm: "13px" }} color="gray.800" fontWeight="700">
            Learning Analytics
          </Heading>

          {courses.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              color="#206CE1"
              fontWeight="600"
              fontSize="11px"
              h="20px"
              py={0}
              px={1}
              _hover={{ bg: "blue.50", textDecoration: "none" }}
              onClick={handleOpenPopup}
            >
              See more
              <FiChevronRight style={{ marginLeft: "2px" }} />
            </Button>
          )}
        </Flex>

        {/* First glance: SHOWS ONLY ONE SUBJECT (the course with the highest percentage) */}
        {topCourse ? (
          <Box px={0} py={0.5}>
            <Flex justify="space-between" align="center">
              <HStack gap={2.5}>
                <Flex
                  align="center"
                  justify="center"
                  bg={getCourseColor(topCourse.dbCourseName)}
                  color="white"
                  h="26px"
                  w="26px"
                  rounded="md"
                  flexShrink={0}
                >
                  <RiCompassesLine size={14} />
                </Flex>
                <Box minW={0}>
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="capitalize"
                    color="gray.800"
                    lineHeight="1.2"
                    mb={1}
                  >
                    {topCourse.title}
                  </Text>
                  {/* Range bar matching length of subject title */}
                  <Box w="100%" minW="85px" maxW="130px">
                    <Progress.Root value={topCourse.progress} size="xs">
                      <Progress.Track bg="gray.100" h="3.5px" borderRadius="full">
                        <Progress.Range
                          bg={getCourseColor(topCourse.dbCourseName)}
                          borderRadius="full"
                        />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                </Box>
              </HStack>
              <Text fontSize="12px" fontWeight="700" color="gray.700">
                {topCourse.progress}%
              </Text>
            </Flex>
          </Box>
        ) : (
          <Text fontSize="xs" color="gray.400" py={1} textAlign="center">
            No registered courses found.
          </Text>
        )}
      </Box>

      {/* Pop-up connected to the bottom of the page and stopping at where learning analytics section is located at top */}
      {isPopupOpen && (
        <Portal>
          {/* Backdrop overlay */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1200}
            onClick={() => setIsPopupOpen(false)}
            backdropFilter="blur(2px)"
          />

          {/* Connected Bottom Sheet Pop-up */}
          <Box
            position="fixed"
            top={`${popupTop}px`}
            bottom={0}
            left={0}
            right={0}
            maxW={{ base: "100%", md: "780px" }}
            mx="auto"
            bg="white"
            zIndex={1201}
            borderTopRadius="2xl"
            boxShadow="0 -10px 40px rgba(0, 0, 0, 0.25)"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            {/* Grab / drag indicator bar */}
            <Flex justify="center" pt={2.5} pb={1} flexShrink={0}>
              <Box w="40px" h="4px" bg="gray.300" borderRadius="full" />
            </Flex>

            {/* Pop-up Header */}
            <Flex
              justify="space-between"
              align="center"
              px={5}
              py={3}
              borderBottom="1px solid"
              borderColor="gray.100"
              flexShrink={0}
            >
              <HStack gap={2}>
                <Heading as="h3" fontSize="md" color="gray.900" fontWeight="700">
                  Learning Analytics
                </Heading>
                <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
                  {sortedCourses.length} {sortedCourses.length === 1 ? "Subject" : "Subjects"}
                </Badge>
              </HStack>

              <IconButton
                aria-label="Close analytics popup"
                size="sm"
                variant="ghost"
                borderRadius="full"
                color="gray.500"
                _hover={{ bg: "gray.100", color: "gray.800" }}
                onClick={() => setIsPopupOpen(false)}
              >
                <FiX size={18} />
              </IconButton>
            </Flex>

            {/* Pop-up Body: Full list of all registered courses with progress bars */}
            <Box
              flex={1}
              overflowY="auto"
              px={5}
              py={4}
              css={{
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#CBD5E1",
                  borderRadius: "3px",
                },
              }}
            >
              <Text fontSize="xs" color="gray.500" mb={4}>
                Your overall topic completion across all registered subjects, ranked by progress:
              </Text>

              {sortedCourses.map((course, idx) => (
                <Box
                  key={idx}
                  p={3.5}
                  mb={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  bg="gray.50"
                  _hover={{ bg: "gray.100/60" }}
                  transition="background 0.15s ease"
                >
                  <Flex justify="space-between" align="center">
                    <HStack gap={3}>
                      <Flex
                        align="center"
                        justify="center"
                        bg={getCourseColor(course.dbCourseName)}
                        color="white"
                        h={9}
                        w={9}
                        rounded="lg"
                        flexShrink={0}
                      >
                        <RiCompassesLine size={20} />
                      </Flex>
                      <Box minW={0}>
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          textTransform="capitalize"
                          color="gray.800"
                          mb={1.5}
                        >
                          {course.title}
                        </Text>
                        {/* Range bar matching length of subject title */}
                        <Box w="100%" minW="95px" maxW="150px">
                          <Progress.Root value={course.progress} size="xs">
                            <Progress.Track bg="gray.200" h="5px" borderRadius="full">
                              <Progress.Range
                                bg={getCourseColor(course.dbCourseName)}
                                borderRadius="full"
                              />
                            </Progress.Track>
                          </Progress.Root>
                        </Box>
                      </Box>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      {course.progress}%
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Box>

            {/* Pop-up Footer */}
            <Flex
              px={5}
              py={3}
              borderTop="1px solid"
              borderColor="gray.100"
              bg="gray.50"
              justify="flex-end"
              flexShrink={0}
            >
              <Button
                size="sm"
                variant="outline"
                color="gray.700"
                borderColor="gray.300"
                borderRadius="lg"
                onClick={() => setIsPopupOpen(false)}
              >
                Close
              </Button>
            </Flex>
          </Box>
        </Portal>
      )}
    </>
  );
};

export default Analytics;