import { Grid, Box, Text, Center, useDisclosure, Icon } from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useState } from "react";
import TopicsList from "./topicsList";
import {
  useStudentData,
  useSubjects,
  useTopics,
  useClasses,
  useResources,
} from "@/student-app/context/dataContext";
import { courseConfig } from "@/student-app/utils/courseConstants";
import { getCourseThumbnail } from "@/student-app/utils/courseImages";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LockedBadge } from "@/components/subscription/LockedBadge";
import { LuLock } from "react-icons/lu";

interface Topic {
  id: string;
  name: string;
  description?: string;
}

interface VideoResource {
  id: string;
  title: string;
  url: string;
  duration?: number;
  type: string;
  topic_id?: string;
}

const Subjects = () => {
  const { authdStudent } = useAuthdStudentData();
  const [loading, setLoading] = useState(false);
  const [topicList, setTopicList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const { onOpen } = useDisclosure();

  // Entitlement hook
  const {
    effectivePlan,
    verifySubject,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  // Use context hooks
  const { subjectImages } = useStudentData();
  const { getSubjectByName } = useSubjects();
  const { getTopicsBySubjectId } = useTopics();
  const { getClassByName } = useClasses();
  const { getResourcesByType } = useResources();

  // Helper function to convert registered_courses to an array
  const getStudentCoursesArray = (): string[] => {
    const registered = authdStudent?.registered_courses;
    if (!registered) return [];
    if (Array.isArray(registered)) return registered;
    try {
      const parsed = JSON.parse(registered);
      return Array.isArray(parsed) ? parsed : [registered];
    } catch {
      return String(registered).split(",").map((c) => c.trim());
    }
  };

  const handleCourseClick = async (
    courseName: string,
    dbCourseId: string,
    index: number
  ) => {
    // Entitlement check
    const access = verifySubject(index, courseName);
    if (!access.allowed) {
      promptUpgrade(
        `${courseName} Curriculum`,
        access.requiredPlan,
        access.reason || "Basic tier includes your first 4 starter subjects. Upgrade to Standard (₦15,000) to access all your registered subjects!"
      );
      return;
    }

    setLoading(true);
    setSelectedCourse(courseName);

    try {
      // 1. Get class ID with fallback
      const classData = getClassByName(authdStudent?.class || "") || classes[0];

      // 2. Get subject ID with robust canonical lookup
      const subjectData =
        getSubjectByName(dbCourseId) ||
        getSubjectByName(courseName);

      const subjectId = subjectData?.id || dbCourseId;

      // 3. Get topics for this subject and class
      const allTopics = getTopicsBySubjectId(subjectId);
      const classTopics = classData
        ? allTopics.filter((topic: any) => {
            if (topic.class_id === classData.id) return true;
            const normClass = classData.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normTopicClass = (topic.class_id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            return normTopicClass.includes(normClass) || normClass.includes(normTopicClass);
          })
        : allTopics;

      setTopics(classTopics || []);

      // 4. Get videos for these topics
      const topicIds = (classTopics || []).map((topic: any) => topic.id);

      if (topicIds.length > 0) {
        const allVideos = getResourcesByType("video");
        const topicVideos = allVideos.filter(
          (video: any) => video.topic_id && topicIds.includes(video.topic_id)
        );
        setVideos(topicVideos || []);
      } else {
        setVideos([]);
      }

      onOpen();
      setTopicList(true);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setTopicList(true);
    } finally {
      setLoading(false);
    }
  };

  const registeredCoursesArray = getStudentCoursesArray();

  // Map courses using the centralized config
  const studentCourses = registeredCoursesArray.map((id) => {
    // Normalize ID to lowercase to match the config keys
    const config = courseConfig[id.toLowerCase()] || {
      displayName: id,
      color: "#718096",
    };

    return {
      dbName: id,
      displayName: config.displayName,
      image: getCourseThumbnail(id, subjectImages),
      color: config.color,
    };
  });

  return (
    <Box bg="white" rounded="lg" shadow="sm" p={4} mb={20} h="auto">
      {!topicList ? (
        <Grid
          templateColumns={{
            base: "repeat(auto-fill, minmax(150px, 1fr))",
            md: "repeat(auto-fill, minmax(200px, 1fr))",
            lg: "repeat(auto-fill, minmax(225px, 1fr))",
          }}
          gap={{ base: 4, md: 6 }}
          py={{ base: 4, md: 6 }}
        >
          {studentCourses.length === 0 ? (
            <Box textAlign="center" gridColumn="1 / -1" py={10}>
              <Text fontSize="xl" color="gray.500">
                No courses registered yet.
              </Text>
            </Box>
          ) : (
            studentCourses.map((course, index) => {
              const access = verifySubject(index, course.displayName);
              const isLocked = !access.allowed;

              return (
                <Box
                  key={index}
                  borderRadius="xl"
                  p={6}
                  textAlign="center"
                  minH="100px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  transition="all 0.3s ease"
                  _hover={{ transform: "translateY(-6px)" }}
                  background={course.image ? `url("${course.image.trim()}")` : course.color}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  backgroundRepeat="no-repeat"
                  cursor="pointer"
                  position="relative"
                  overflow="hidden"
                  onClick={() => handleCourseClick(course.displayName, course.dbName, index)}
                  opacity={loading ? 0.7 : 1}
                  pointerEvents={loading ? "none" : "auto"}
                >
                  {/* Locked Overlay for Basic plan over 4 subjects */}
                  {isLocked && (
                    <Box
                      position="absolute"
                      inset={0}
                      bg="blackAlpha.700"
                      zIndex={3}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      p={3}
                      backdropFilter="blur(2px)"
                    >
                      <Icon as={LuLock} color="orange.300" boxSize={6} mb={1.5} />
                      <Text fontSize="xs" fontWeight="bold" color="white" textAlign="center" mb={1.5}>
                        {course.displayName}
                      </Text>
                      <LockedBadge requiredPlan="standard" label="Standard Plan" size="xs" variant="solid" />
                    </Box>
                  )}

                  <Center flexDirection="column" zIndex={2} position="relative">
                    {!course.image && (
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="white"
                        textShadow="2px 2px 4px rgba(0,0,0,0.7)"
                        mb={2}
                      >
                        {course.displayName}
                      </Text>
                    )}
                    {loading && (
                      <Text fontSize="sm" color="whiteAlpha.800">
                        Loading...
                      </Text>
                    )}
                  </Center>
                </Box>
              );
            })
          )}
        </Grid>
      ) : (
        <TopicsList
          selectedCourse={selectedCourse}
          topics={topics}
          videos={videos}
          setTopicList={setTopicList}
          courseName={selectedCourse}
        />
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </Box>
  );
};

export default Subjects;