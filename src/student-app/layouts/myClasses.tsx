// import {useMemo} from "react";
// import { Box, Flex, Text, Image, Heading } from "@chakra-ui/react";
// import childrenBox_ico from "../../assets/childrenBox_ico.png";
// import activeChildrenBox_ico from "../../assets/activeChildrenBox_ico.png";
// import { useAuthdStudentData } from "../context/studentDataContext";
// const MyClasses = () => {
// const { authdStudent } = useAuthdStudentData();

// // convert registered_courses to an array if it's a string
// const coursesCount = useMemo(() => {
//   const courses = authdStudent?.registered_courses;
//   if (!courses) return 0;

//   if (Array.isArray(courses)) return courses.length;

//   if (typeof courses === "string") {
//     try {
//       const parsed = JSON.parse(courses);
//       return Array.isArray(parsed) ? parsed.length : 0;
//     } catch {
//       return 0;
//     }
//   }

//   return 0;
// }, [authdStudent?.registered_courses]);
//   return (
//     <Flex w="full">
//         <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
//           <Heading as="h1" my={2}>
//             My Classes
//           </Heading>
//           <Flex
//             direction={{ base: "column", lg: "row" }}
//             justify="space-between"
//             alignItems="center"
//           >
//             <Box
//               display="flex"
//               justifyItems="space-between"
//               alignItems="center"
//               w={{ base: "full", lg: "48%" }}
//               bg="textFieldColor"
//               borderRadius="lg"
//               // boxShadow='xs'
//               p={{ base: "5", md: "8", lg: "10" }}
//               my={2}
//             >
//               <Image src={childrenBox_ico} boxSize="60px" />
//               <Box mx={5}>
//                 <Text
//                   fontSize={{ base: "md", lg: "lg" }}
//                   mb={1}
//                   color="#333951"
//                 >
//                   Registered Courses
//                 </Text>
//                 <Heading
//                   as="h2"
//                   fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
//                   color="#333951"
//                 >
//                   {coursesCount || 0}
//                 </Heading>
//               </Box>
//             </Box>

//             <Box
//               display="flex"
//               justifyItems="space-between"
//               alignItems="center"
//               w={{ base: "full", lg: "48%" }}
//               bg="textFieldColor"
//               borderRadius="lg"
//               // shadow='xs'
//               p={{ base: "5", md: "8", lg: "10" }}
//               my={2}
//             >
//               <Image src={activeChildrenBox_ico} boxSize="60px" />
//               <Box mx={5}>
//                 <Text
//                   fontSize={{ base: "md", lg: "lg" }}
//                   mb={1}
//                   color="#333951"
//                 >
//                   Active Classes
//                 </Text>
//                 <Heading
//                   as="h2"
//                   fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
//                   color="#333951"
//                 >
//                   {authdStudent?.active_classes || 0}
//                 </Heading>
//               </Box>
//             </Box>
//           </Flex>
//         </Box>
//     </Flex>
//   );
// };

// export default MyClasses;


import { useMemo, useEffect, useState } from "react";
import { Box, Flex, Text, Image, Heading } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "../context/studentDataContext";
import childrenBox_ico from "../../assets/childrenBox_ico.png";
import activeChildrenBox_ico from "../../assets/activeChildrenBox_ico.png";

const MyClasses = () => {
  const { authdStudent } = useAuthdStudentData();
  const [activeClassesCount, setActiveClassesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<
    { subject: string; lastActivity: string }[]
  >([]);

  // Convert registered_courses to an array if it's a string
  const coursesCount = useMemo(() => {
    const courses = authdStudent?.registered_courses;
    if (!courses) return 0;

    if (Array.isArray(courses)) return courses.length;

    if (typeof courses === "string") {
      try {
        const parsed = JSON.parse(courses);
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        return 0;
      }
    }

    return 0;
  }, [authdStudent?.registered_courses]);

  // Calculate active classes based on video activity
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

        // Get video progress for this student in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: videoProgress, error } = await supabase
          .from("video_progress")
          .select(
            `
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
          `
          )
          .eq("student_id", authdStudent.id)
          .gte("last_watched", thirtyDaysAgo.toISOString())
          .gte("progress", 10) // At least 10% watched
          .order("last_watched", { ascending: false });

        if (error) {
          console.error("Error fetching video progress:", error);
          setActiveClassesCount(0);
          setIsLoading(false);
          return;
        }

        // Track active subjects and their latest activity
        const subjectActivity = new Map<string, string>();

        videoProgress?.forEach((progress) => {
          const subjectName = progress.resources?.topics?.subjects?.name;
          if (subjectName && registeredCourses.includes(subjectName)) {
            const currentLatest = subjectActivity.get(subjectName);
            if (!currentLatest || progress.last_watched > currentLatest) {
              subjectActivity.set(subjectName, progress.last_watched);
            }
          }
        });

        setActiveClassesCount(subjectActivity.size);

        // Convert to array for display
        const activityArray = Array.from(subjectActivity.entries())
          .map(([subject, lastActivity]) => ({
            subject,
            lastActivity,
          }))
          .sort(
            (a, b) =>
              new Date(b.lastActivity).getTime() -
              new Date(a.lastActivity).getTime()
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

  // Helper function to convert registered_courses to an array
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

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const displayActiveClasses = isLoading ? "..." : activeClassesCount;

  return (
    <>
    <Flex w="full">
      <Box bg="white" boxShadow="md" borderRadius="lg" w="full" my={5} p={4}>
        <Heading as="h1" fontSize='md' my={2}>
          My Classes
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
            bg="textFieldColor"
            borderRadius="lg"
            p={{ base: "3", md: "6", lg: "8" }}
            my={2}
          >
            <Image src={childrenBox_ico} boxSize="57px" />
            <Box mx={5}>
              <Text fontSize={{ base: "sm", lg: "md" }} mb={1} color="#333951">
                Registered Courses
              </Text>
              <Heading
                as="h2"
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color="#333951"
              >
                0{coursesCount || 0}
              </Heading>
            </Box>
          </Box>

          {/* Active Classes Card */}
          <Tooltip
            content={
              recentActivity.length > 0
                ? `Recently active: ${recentActivity
                    .map((a) => a.subject)
                    .join(", ")}`
                : "No recent activity in any courses"
            }
            // hasArrow
            // placement="top"
          >
            <Box
              display="flex"
              justifyItems="space-between"
              alignItems="center"
              w={{ base: "full", lg: "48%" }}
              bg="textFieldColor"
              borderRadius="lg"
              p={{ base: "3", md: "6", lg: "8" }}
              my={2}
              cursor="help"
            >
              <Image src={activeChildrenBox_ico} boxSize="57px" />
              <Box mx={5}>
                <Text
                  fontSize={{ base: "sm", lg: "md" }}
                  mb={1}
                  color="#333951"
                >
                  Active Classes
                </Text>
                <Heading
                  as="h2"
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  color="#333951"
                >
                  0{displayActiveClasses}
                </Heading>
                {/* {!isLoading && (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Last 30 days • Hover for details
                  </Text>
                )} */}
              </Box>
            </Box>
          </Tooltip>
        </Flex>

    
      </Box>
    </Flex>
        {/* Detailed Activity Breakdown */}
        {/* {!isLoading && recentActivity.length > 0 && (
          <Box  p={2} bg="green.100" borderRadius="md">
            <Text fontSize="xs" fontWeight="medium" color="green.800" mb={2}>
              Recent Activity:
            </Text>
            <Flex flexWrap="wrap" gap={2}>
              {recentActivity.slice(0, 3).map((activity, index) => (
                <Box
                  key={index}
                  bg="green.200"
                  px={2}
                  py={1}
                  borderRadius="sm"
                  fontSize="11px"
                  color="green.800"
                >
                  {activity.subject} (
                  {formatRelativeTime(activity.lastActivity)})
                </Box>
              ))}
              {recentActivity.length > 3 && (
                <Box
                  bg="green.100"
                  px={2}
                  py={1}
                  borderRadius="sm"
                  fontSize="xs"
                  color="green.800"
                >
                  +{recentActivity.length - 3} more
                </Box>
              )}
            </Flex>
          </Box>
        )} */}
        </>
  );
};

export default MyClasses;

