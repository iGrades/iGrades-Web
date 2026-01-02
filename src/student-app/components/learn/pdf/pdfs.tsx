import { Grid, Box, Text, Center, useDisclosure } from "@chakra-ui/react";
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

interface Topic {
  id: string;
  name: string;
  description?: string;
}

interface PDFsResource {
  id: string;
  title: string;
  url: string;
  duration?: number;
  type: string;
  topic_id?: string;
}

const Pdfs = () => {
  const { authdStudent } = useAuthdStudentData();
  const [ setLoading] = useState(false);
  const [topicList, setTopicList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pdfs, setPdfs] = useState<PDFsResource[]>([]);
  const { onOpen } = useDisclosure();

  const { subjectImages } = useStudentData();
  const { getSubjectByName } = useSubjects();
  const { getTopicsBySubjectId } = useTopics();
  const { getClassByName } = useClasses();
  const { getResourcesByType } = useResources();

  // 2. HELPER TO PARSE COURSES (Simplified)
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

  const handleCourseClick = async (courseName: string, dbCourseId: string) => {
    setLoading(true);
    setSelectedCourse(courseName);

    try {
      const classData = getClassByName(authdStudent?.class || "");
      if (!classData) return;

      // Notice we use the ID (dbCourseId) which is now "mathematics"
      const subjectData = getSubjectByName(dbCourseId);
      if (!subjectData) return;

      const allTopics = getTopicsBySubjectId(subjectData.id);
      const classTopics = allTopics.filter((t: any) => t.class_id === classData.id);

      setTopics(classTopics || []);
      
      const topicIds = classTopics.map((t: any) => t.id) || [];
      if (topicIds.length > 0) {
        const allPDFs = getResourcesByType("pdf");
        const topicPDFs = allPDFs.filter((pdf: any) => pdf.topic_id && topicIds.includes(pdf.topic_id));
        setPdfs(topicPDFs || []);
      } else {
        setPdfs([]);
      }
      onOpen();
      setTopicList(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 3. MAP COURSES USING THE CENTRAL CONFIG
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
  });

  return (
    <Box bg="white" rounded="lg" shadow="sm" p={4} mb={20} h={{base: 'auto', lg: '75vh'}}>
      {!topicList ? (
        <Grid
          templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
          gap={6}
          py={6}
        >
          {studentCourses.map((course, index) => (
            <Box
              key={index}
              borderRadius="xl"
              p={6}
              textAlign="center"
              bg={course.image ? `url(${course.image})` : course.color}
              backgroundSize="contain"
              backgroundRepeat="no-repeat"
              cursor="pointer"
              transition="0.3s"
              _hover={{ transform: "translateY(-8px)" }}
              onClick={() => handleCourseClick(course.displayName, course.dbName)}
            >
              <Center flexDirection="column">
                {!course.image && (
                  <Text fontWeight="bold" color="white" textShadow="1px 1px 2px black">
                    {course.displayName}
                  </Text>
                )}
              </Center>
            </Box>
          ))}
        </Grid>
      ) : (
        <TopicsList
          selectedCourse={selectedCourse}
          topics={topics}
          PDFs={pdfs}
          setTopicList={setTopicList}
          courseName={selectedCourse}
        />
      )}
    </Box>
  );
};

export default Pdfs;