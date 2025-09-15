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

type Props = {
  selectedCourses: string[];
  onCourseSelect: (
    course: string,
    topics?: Topic[],
    dbCourseName?: string
  ) => void;
  setSelectedCourse: Dispatch<SetStateAction<string>>;
  setSelectedTopicsId: Dispatch<SetStateAction<string>>;
};

interface Topic {
  id: string;
  name: string;
  description?: string;
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

  // Create a mapping of database course names to display names and colors
  const courseConfig: Record<string, { displayName: string; color: string }> = {
    // JUNIOR SECONDARY COURSES
    juniorMath: {
      displayName: "Mathematics",
      color: "#F26946",
    },
    juniorEng: { displayName: "English", color: "#4ECDC4" },
    basicScience: {
      displayName: "Basic Science",
      color: "#45B7D1",
    },
    basicTech: {
      displayName: "Basic Technology",
      color: "#F9A826",
    },
    socialStudies: {
      displayName: "Social Studies",
      color: "#E84855",
    },
    civicEdu: {
      displayName: "Civic Education",
      color: "#7D70BA",
    },
    businessStudies: {
      displayName: "Business Studies",
      color: "#2A9D8F",
    },
    homeEconomics: {
      displayName: "Home Economics",
      color: "#E76F51",
    },
    juniorAgric: {
      displayName: "Agricultural Science",
      color: "#2A9D8F",
    },
    physicalEdu: {
      displayName: "Physical Education",
      color: "#E63946",
    },
    juniorComp: {
      displayName: "Computer Studies",
      color: "#3A86FF",
    },
    creativeArts: {
      displayName: "Creative Arts",
      color: "#8338EC",
    },
    music: { displayName: "Music", color: "#FB5607" },

    // SENIOR SECONDARY COURSES
    seniorMath: {
      displayName: "General Mathematics",
      color: "#FF6B6B",
    },
    seniorEng: { displayName: "English", color: "#4ECDC4" },
    physics: { displayName: "Physics", color: "#F06595" },
    chemistry: {
      displayName: "Chemistry",
      color: "#339AF0",
    },
    biology: { displayName: "Biology", color: "#51CF66" },
    furtherMath: {
      displayName: "Further Mathematics",
      color: "#FF922B",
    },
    economics: {
      displayName: "Economics",
      color: "#CC5DE8",
    },
    accounting: {
      displayName: "Accounting",
      color: "#20C997",
    },
    commerce: { displayName: "Commerce", color: "#FDA7DF" },
    government: {
      displayName: "Government",
      color: "#D980FA",
    },
    literature: {
      displayName: "Literature",
      color: "#B53471",
    },
    history: { displayName: "History", color: "#EE5A24" },
    geography: {
      displayName: "Geography",
      color: "#A3CB38",
    },
    fineArts: { displayName: "Fine Arts", color: "#FFC312" },
    seniorComp: {
      displayName: "Computer Science",
      color: "#1289A7",
    },
    french: { displayName: "French", color: "#6F1E51" },
  };

  // Helper function to convert registered_courses to an array
  const getStudentCoursesArray = () => {
    const registeredCourses = authdStudent?.registered_courses;

    if (!registeredCourses) return [];

    // If it's already an array, return it
    if (Array.isArray(registeredCourses)) {
      return registeredCourses;
    }

    // If it's a string, try to parse it as JSON or split by commas
    if (typeof registeredCourses === "string") {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(registeredCourses);
        return Array.isArray(parsed) ? parsed : [registeredCourses];
      } catch {
        // If JSON parsing fails, try splitting by commas
        return (registeredCourses as string)
          .split(",")
          .map((course: string) => course.trim());
      }
    }

    // If it's some other type, convert to array
    return [String(registeredCourses)];
  };

  const isCourseSelected = (courseName: string) => {
    return selectedCourses.includes(courseName);
  };

  const handleCourseClick = async (
    courseName: string,
    dbCourseName: string
  ) => {
    setLoading(true);
    setSelectedCourse(courseName);

    try {
      console.log(
        "Fetching topics for:",
        courseName,
        "in class:",
        authdStudent?.class
      );

      // Get class ID using context
      const classData = getClassByName(authdStudent?.class || "");
      if (!classData) {
        console.log("No class found for:", authdStudent?.class);
        setLoading(false);
        return;
      }

      const classId = classData.id;
      console.log("Found class ID:", classId);

      // Get subject ID using context
      const subjectData = getSubjectByName(dbCourseName);
      if (!subjectData) {
        console.log("No subject found for:", courseName);
        setLoading(false);
        return;
      }

      const subjectId = subjectData.id;
      console.log("Found subject ID:", subjectId);

      // Get topics for this specific subject_id AND class_id using context
      const allTopics = getTopicsBySubjectId(subjectId);
      const classTopics = allTopics.filter(
        (topic: any) => topic.class_id === classId
      );

      console.log("Topics found:", classTopics);

      // Set the first topic ID if available
      if (classTopics.length > 0) {
        setSelectedTopicsId(classTopics[0].id);
      }

      // Pass the course and its topics to the parent component
      onCourseSelect(courseName, classTopics || [], dbCourseName);

      onOpen();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get the student's registered courses as an array
  const registeredCoursesArray = getStudentCoursesArray();

  // Map courses with display names, images, and colors from our config
  const studentCourses = registeredCoursesArray.map((dbCourseName) => {
    // Find the course in our config (exact match for database names)
    const config = courseConfig[dbCourseName] || {
      displayName: dbCourseName, // Fallback to database name if not found
      color: "#718096", // Default gray color for unknown courses
    };

    return {
      dbName: dbCourseName, // Keep original database name for reference
      displayName: config.displayName,
      image: subjectImages[dbCourseName] || null, // Get image from context
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
              _hover={{
                transform: "translateY(-8px)",
              }}
              background={course.image ? `url(${course.image})` : course.color}
              backgroundSize="contain"
              backgroundRepeat="no-repeat"
              cursor="pointer"
              position="relative"
              overflow="hidden"
              onClick={() =>
                handleCourseClick(course.displayName, course.dbName)
              }
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
