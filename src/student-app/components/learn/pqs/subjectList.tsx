import { Grid, Box, Text, Center, Heading } from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import YearsList from "./yearsList";
import { useStudentData, useSubjects } from "@/student-app/context/dataContext";
import { courseConfig } from "@/student-app/utils/courseConstants";

type Props = {
  onBack: () => void;
  selectedExam: string | null;
};

const SubjectsList = ({ onBack, selectedExam }: Props) => {
  const { authdStudent } = useAuthdStudentData();
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [showYearsList, setShowYearsList] = useState(false);

  // Use context hooks
  const { subjectImages } = useStudentData();
  const { getSubjectByName } = useSubjects();

  // Helper function to convert registered_courses to an array
  const getStudentCoursesArray = (): string[] => {
    const registered = authdStudent?.registered_courses;
    if (!registered) return [];
    if (Array.isArray(registered)) return registered;
    try {
      const parsed = JSON.parse(registered);
      return Array.isArray(parsed) ? parsed : [registered];
    } catch {
      return String(registered).split(",").map(c => c.trim());
    }
  };

  const handleCourseClick = async (
    courseName: string,
    dbCourseName: string
  ) => {
    setLoading(true);
    setSelectedCourse(courseName);

    try {
      console.log("Fetching PQs for:", courseName);

      // Get subject ID using context
      const subjectData = getSubjectByName(dbCourseName);
      if (!subjectData) {
        console.log("No subject found for:", courseName);
        setLoading(false);
        return;
      }

      const subjectId = subjectData.id;
      setSubjectId(subjectId);
      console.log("Found subject ID:", subjectId);
      setShowYearsList(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
    console.log("Selected Course:", selectedCourse);
    console.log("Selected Exam:", selectedExam);
  };

  // MAP COURSES USING THE CENTRAL CONFIG
  const registeredCoursesArray = getStudentCoursesArray();

  const studentCourses = registeredCoursesArray.map((id) => {
    // Look up the ID (e.g., "mathematics") in our central config
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
  }
  );

  return (
    <>
      {showYearsList ? (
        <YearsList
          onBack={() => setShowYearsList(false)}
          selectedExam={selectedExam}
          selectedCourse={selectedCourse}
          subjectId={subjectId}
        />
      ) : (
        <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h={{base: 'auto', lg: '75vh'}}>
          {/* Header with back button */}
          <Heading
            as="h3"
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            gap={3}
            mt={3}
            mb={5}
            mx={2}
          >
            <LuArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
            Select Subject
          </Heading>
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
                  background={
                    course.image ? `url(${course.image})` : course.color
                  }
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
                </Box>
              ))
            )}
          </Grid>
        </Box>
      )}
    </>
  );
};

export default SubjectsList;
