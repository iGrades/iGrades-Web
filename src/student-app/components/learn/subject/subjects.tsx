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

  // Use context hooks
  const { subjectImages } = useStudentData();
  const { getSubjectByName } = useSubjects();
  const { getTopicsBySubjectId } = useTopics();
  const { getClassByName } = useClasses();
  const { getResourcesByType } = useResources();

  // Helper function to convert registered_courses to an array
  // const getStudentCoursesArray = (): string[] => {
  //   const registered = authdStudent?.registered_courses;
  //   if (!registered) return [];
  //   if (Array.isArray(registered)) return registered;
  //   if (typeof registered === "string") {
  //     try {
  //       const parsed = JSON.parse(registered);
  //       return Array.isArray(parsed) ? parsed : [registered];
  //     } catch {
  //       return registered.split(",").map((course: string) => course.trim());
  //     }
  //   }
  //   return [String(registered)];
  // };
  
  const getStudentCoursesArray = (): string[] => {
    const registered: string[] | undefined = authdStudent?.registered_courses;
    return registered ?? [];
  };

  const handleCourseClick = async (
    courseName: string,
    dbCourseId: string
  ) => {
    setLoading(true);
    setSelectedCourse(courseName);

    try {
      // 1. Get class ID
      const classData = getClassByName(authdStudent?.class || "");
      if (!classData) {
        setLoading(false);
        return;
      }

      // 2. Get subject ID (dbCourseId is now the lowercase name e.g., "physics")
      const subjectData = getSubjectByName(dbCourseId);
      if (!subjectData) {
        setLoading(false);
        return;
      }

      // 3. Get topics for this subject and class
      const allTopics = getTopicsBySubjectId(subjectData.id);
      const classTopics = allTopics.filter(
        (topic: any) => topic.class_id === classData.id
      );

      setTopics(classTopics || []);

      // 4. Get videos for these topics
      const topicIds = classTopics.map((topic: any) => topic.id) || [];

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
      image: subjectImages[id] || null,
      color: config.color,
    };
  });

  return (
    <Box bg="white" rounded="lg" shadow="sm" p={4} mb={20} h={{ base: 'auto', lg: '75vh' }}>
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
              </Box>
            ))
          )}
        </Grid>
      ) : (
        <TopicsList
          selectedCourse={selectedCourse}
          topics={topics}
          videos={videos} // Ensure TopicsList accepts videos prop
          setTopicList={setTopicList}
          courseName={selectedCourse}
        />
      )}
    </Box>
  );
};

export default Subjects;