import { Grid, Box, Text, Center, useDisclosure, Icon } from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useState } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import type { Dispatch, SetStateAction } from "react";
import {
  useStudentData,
  useSubjects,
  useTopics,
  useClasses,
} from "@/student-app/context/dataContext";
import { courseConfig } from "@/student-app/utils/courseConstants";
import { getCourseThumbnail } from "@/student-app/utils/courseImages";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";
import { LockedBadge } from "@/components/subscription/LockedBadge";
import { LuLock } from "react-icons/lu";

type Props = {
  selectedCourses: string[];
  onCourseSelect: (
    course: string,
    topics?: Topic[] | undefined,
    dbCourseName?: string | undefined
  ) => void;
  setSelectedCourse: Dispatch<SetStateAction<string>>;
  setSelectedTopicsId: Dispatch<SetStateAction<string>>;
  subjectImages: { [key: string]: string };
  setSubjectImages: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
};

interface Topic {
  id: string;
  name: string;
  description?: string;
  course: string;
}

const QuizSubjectsList = ({
  selectedCourses,
  onCourseSelect,
  setSelectedCourse,
  setSelectedTopicsId,
}: Props) => {
  const { authdStudent } = useAuthdStudentData();
  const [loading, setLoading] = useState(false);
  const { onOpen } = useDisclosure();

  // Centralized entitlement hook
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
  const { classes, getClassByName } = useClasses();

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

  const isCourseSelected = (courseName: string) => {
    return selectedCourses.includes(courseName);
  };

  const handleCourseClick = async (
    courseName: string,
    dbCourseId: string,
    index: number
  ) => {
    // 1. Check subject entitlement
    const access = verifySubject(index, courseName);
    if (!access.allowed) {
      promptUpgrade(
        `${courseName} Quiz Practice`,
        access.requiredPlan,
        access.reason || "Basic plan includes your first 4 starter subjects. Upgrade to Standard (₦15,000) to practice quizzes on all registered subjects!"
      );
      return;
    }

    // 2. Check multi-subject practice entitlement for Basic tier
    const isCurrentlySelected = isCourseSelected(courseName);
    if (!isCurrentlySelected && selectedCourses.length >= 1 && effectivePlan === "basic") {
      promptUpgrade(
        "Multi-Subject Practice",
        "standard",
        "On the Basic plan, you can practice 1 subject at a time. Upgrade to Standard or Premium to combine multiple subjects in mock quizzes and tests!"
      );
      return;
    }

    setLoading(true);
    setSelectedCourse(courseName);

    try {
      // Get class ID using context with fallback
      const classData = getClassByName(authdStudent?.class || "") || classes[0];

      // Get subject ID (canonical and alias matching)
      const subjectData =
        getSubjectByName(dbCourseId) ||
        getSubjectByName(courseName);

      const subjectId = subjectData?.id || dbCourseId;

      // Use only real database topics for this subject/class
      const allTopics = getTopicsBySubjectId(subjectId);
      const classTopics = classData
        ? allTopics.filter((topic: any) => {
            if (topic.class_id === classData.id) return true;
            const normClass = classData.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normTopicClass = (topic.class_id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            return normTopicClass.includes(normClass) || normClass.includes(normTopicClass);
          })
        : allTopics;

      // Set the first topic ID if available for the quiz setup
      if (classTopics && classTopics.length > 0) {
        setSelectedTopicsId(classTopics[0].id);
      } else {
        setSelectedTopicsId("");
      }

      const mappedTopics = (classTopics || []).map((topic: any) => ({
        ...topic,
        course: courseName,
      }));

      // Select course with its real database topics
      onCourseSelect(courseName, mappedTopics, subjectData?.name || dbCourseId);
      onOpen();
    } catch (error) {
      console.error("Error loading quiz topics:", error);
      onCourseSelect(courseName, [], dbCourseId);
    } finally {
      setLoading(false);
    }
  };

  const registeredCoursesArray = getStudentCoursesArray();

  const studentCourses = registeredCoursesArray.map((id) => {
    // Lookup the lowercase ID in our central config
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
    <>
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
            const isSelected = isCourseSelected(course.displayName);

            return (
              <Box
                key={index}
                borderRadius="xl"
                p={{ base: 3, sm: 5, md: 6 }}
                textAlign="center"
                w="100%"
                aspectRatio="254 / 101"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                transition="all 0.3s ease"
                _hover={{ transform: "translateY(-6px)" }}
                background={course.image ? `url("${course.image.trim()}")` : course.color}
                backgroundSize="100% 100%"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                cursor="pointer"
                position="relative"
                overflow="hidden"
                onClick={() => handleCourseClick(course.displayName, course.dbName, index)}
                opacity={loading ? 0.7 : 1}
                pointerEvents={loading ? "none" : "auto"}
              >
                {/* Locked overlay for Basic plan subjects past limit */}
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
                {isSelected && (
                  <Box position="absolute" top={2} right={2} zIndex={4}>
                    <IoIosCheckmarkCircle color="green" size="24px" />
                  </Box>
                )}
              </Box>
            );
          })
        )}
      </Grid>

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </>
  );
};

export default QuizSubjectsList;