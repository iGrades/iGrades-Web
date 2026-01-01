import { Grid, Box, Text, Center, useDisclosure } from "@chakra-ui/react";
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

  // Use context hooks
  const { subjectImages } = useStudentData();
  const { getSubjectByName } = useSubjects();
  const { getTopicsBySubjectId } = useTopics();
  const { getClassByName } = useClasses();

  // Helper function to convert registered_courses to an array
  const getStudentCoursesArray = (): string[] => {
    const registered = authdStudent?.registered_courses;
    if (!registered) return [];
    if (Array.isArray(registered)) return registered;
    if (typeof registered === "string") {
      try {
        const parsed = JSON.parse(registered);
        return Array.isArray(parsed) ? parsed : [registered];
      } catch {
        return registered.split(",").map((c: string) => c.trim());
      }
    }
    return [String(registered)];
  };

  const isCourseSelected = (courseName: string) => {
    return selectedCourses.includes(courseName);
  };

  const handleCourseClick = async (
    courseName: string,
    dbCourseId: string
  ) => {
    setLoading(true);
    setSelectedCourse(courseName);

    try {
      // Get class ID using context
      const classData = getClassByName(authdStudent?.class || "");
      if (!classData) {
        setLoading(false);
        return;
      }

      // Get subject ID (dbCourseId is the generic lowercase name)
      const subjectData = getSubjectByName(dbCourseId);
      if (!subjectData) {
        setLoading(false);
        return;
      }

      // Get topics for this subject/class
      const allTopics = getTopicsBySubjectId(subjectData.id);
      const classTopics = allTopics.filter(
        (topic: any) => topic.class_id === classData.id
      );

      // Set the first topic ID if available for the quiz setup
      if (classTopics.length > 0) {
        setSelectedTopicsId(classTopics[0].id);
      }

      const mappedTopics = (classTopics || []).map((topic: any) => ({
        ...topic,
        course: courseName,
      }));
      
      onCourseSelect(courseName, mappedTopics, dbCourseId);
      onOpen();
    } catch (error) {
      console.error("Error loading quiz topics:", error);
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
      image: subjectImages[id] || null,
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
          studentCourses.map((course, index) => (
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
              _hover={{ transform: "translateY(-8px)" }}
              background={course.image ? `url(${course.image})` : course.color}
              backgroundSize="contain"
              backgroundRepeat="no-repeat"
              cursor="pointer"
              position="relative"
              overflow="hidden"
              onClick={() => handleCourseClick(course.displayName, course.dbName)}
              opacity={loading ? 0.7 : 1}
              pointerEvents={loading ? "none" : "auto"}
            >
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
              {isCourseSelected(course.displayName) && (
                <Box position="absolute" top={2} right={2} zIndex={3}>
                  <IoIosCheckmarkCircle color="green" size="24px" />
                </Box>
              )}
            </Box>
          ))
        )}
      </Grid>
    </>
  );
};

export default QuizSubjectsList;