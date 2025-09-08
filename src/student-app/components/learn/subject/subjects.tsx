import {
  Grid,
  Box,
  Text,
  Center,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TopicsList from "./topicsList";
import acc_bgimg from "@/assets/courses/acc_bgimg.png";
import agric_bgimg from "@/assets/courses/agric_bgimg.png";
import basic_sci_bgimg from "@/assets/courses/basic-sci_bgimg.png";
import basic_tech_bgimg from "@/assets/courses/basic-tech_bgimg.png";
import bio_bgimg from "@/assets/courses/bio_bgimg.png";
import bus_stu_bgimg from "@/assets/courses/bus-stu_bgimg.png";
import chem_bgimg from "@/assets/courses/chem_bgimg.png";
import com_sci_bgimg from "@/assets/courses/com-sci_bgimg.png";
import econs_bgimg from "@/assets/courses/econs_bgimg.png";
import geo_bgimg from "@/assets/courses/geo_bgimg.png";
import govt_bgimg from "@/assets/courses/govt_bgimg.png";
import math_bgimg from "@/assets/courses/math_bgimg.png";
import eng_bgimg from "@/assets/courses/eng_bgimg.png";
import phy_bgimg from "@/assets/courses/phy_bgimg.png";

type Props = {};

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

const Subjects = (props: Props) => {
  const { authdStudent } = useAuthdStudentData();
  const [loading, setLoading] = useState(false);
  const [topicList, setTopicList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const { open, onOpen, onClose } = useDisclosure();

  // Create a mapping of database course names to display names, images and colors
  const courseConfig: Record<
    string,
    { displayName: string; image: any; color: string }
  > = {
    // JUNIOR SECONDARY COURSES
    juniorMath: {
      displayName: "Mathematics",
      image: math_bgimg,
      color: "#F26946",
    },
    juniorEng: { displayName: "English", image: eng_bgimg, color: "#4ECDC4" },
    basicScience: {
      displayName: "Basic Science",
      image: basic_sci_bgimg,
      color: "#45B7D1",
    },
    basicTech: {
      displayName: "Basic Technology",
      image: basic_tech_bgimg,
      color: "#F9A826",
    },
    socialStudies: {
      displayName: "Social Studies",
      image: null,
      color: "#E84855",
    },
    civicEdu: {
      displayName: "Civic Education",
      image: null,
      color: "#7D70BA",
    },
    businessStudies: {
      displayName: "Business Studies",
      image: bus_stu_bgimg,
      color: "#2A9D8F",
    },
    homeEconomics: {
      displayName: "Home Economics",
      image: null,
      color: "#E76F51",
    },
    juniorAgric: {
      displayName: "Agricultural Science",
      image: agric_bgimg,
      color: "#2A9D8F",
    },
    physicalEdu: {
      displayName: "Physical Education",
      image: null,
      color: "#E63946",
    },
    juniorComp: {
      displayName: "Computer Studies",
      image: com_sci_bgimg,
      color: "#3A86FF",
    },
    creativeArts: {
      displayName: "Creative Arts",
      image: null,
      color: "#8338EC",
    },
    music: { displayName: "Music", image: null, color: "#FB5607" },

    // SENIOR SECONDARY COURSES
    seniorMath: {
      displayName: "General Mathematics",
      image: math_bgimg,
      color: "#FF6B6B",
    },
    seniorEng: { displayName: "English", image: eng_bgimg, color: "#4ECDC4" },
    physics: { displayName: "Physics", image: phy_bgimg, color: "#F06595" },
    chemistry: {
      displayName: "Chemistry",
      image: chem_bgimg,
      color: "#339AF0",
    },
    biology: { displayName: "Biology", image: bio_bgimg, color: "#51CF66" },
    furtherMath: {
      displayName: "Further Mathematics",
      image: math_bgimg,
      color: "#FF922B",
    },
    economics: {
      displayName: "Economics",
      image: econs_bgimg,
      color: "#CC5DE8",
    },
    accounting: {
      displayName: "Accounting",
      image: acc_bgimg,
      color: "#20C997",
    },
    commerce: { displayName: "Commerce", image: null, color: "#FDA7DF" },
    government: {
      displayName: "Government",
      image: govt_bgimg,
      color: "#D980FA",
    },
    literature: {
      displayName: "Literature",
      image: null,
      color: "#B53471",
    },
    history: { displayName: "History", image: null, color: "#EE5A24" },
    geography: {
      displayName: "Geography",
      image: geo_bgimg,
      color: "#A3CB38",
    },
    fineArts: { displayName: "Fine Arts", image: null, color: "#FFC312" },
    seniorComp: {
      displayName: "Computer Science",
      image: com_sci_bgimg,
      color: "#1289A7",
    },
    french: { displayName: "French", image: null, color: "#6F1E51" },
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

      // First, class ID
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("name", authdStudent?.class)
        .single();

      if (classError || !classData) {
        console.log("No class found for:", authdStudent?.class);
        setLoading(false);
        return;
      }

      const classId = classData.id;
      console.log("Found class ID:", classId);

      // Get subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", dbCourseName) // Use dbCourseName to match database entry
        .single();

      if (subjectError || !subjectData) {
        console.log("No subject found for:", courseName);
        console.log('Here is the subject error: ', subjectError);
        
        setLoading(false);
        return;
      }

      const subjectId = subjectData.id;
      console.log("Found subject ID:", subjectId);

      // Fetch topics for this specific subject_id AND class_id
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id, name, description")
        .eq("subject_id", subjectId) // Filter by subject_id
        .eq("class_id", classId) // Filter by class_id
        .order("order_index");

      if (topicsError) {
        console.error("Error fetching topics:", topicsError);
      } else {
        setTopics(topicsData || []);
         setTopicList(true);
        console.log("Topics found:", topicsData);
       
      }

      // Get topic IDs to fetch their videos
      const topicIds = topicsData?.map((topic) => topic.id) || [];

      if (topicIds.length > 0) {
        // Fetch videos for these specific topics
        const { data: videosData, error: videosError } = await supabase
          .from("resources")
          .select("id, title, url, duration, type, topic_id")
          .in("topic_id", topicIds) // Get videos for all the topics
          .eq("type", "video")
          .order("order_index");

        if (videosError) {
          console.error("Error fetching videos:", videosError);
          setTopicList(true);
        } else {
          setVideos(videosData || []);
          setTopicList(true);
          console.log("Videos found:", videosData);
          
        }
      } else {
        setVideos([]); // No topics means no videos
      }

      // Open drawer to show topics and videos
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
      image: null,
      color: "#718096", // Default gray color for unknown courses
    };

    return {
      dbName: dbCourseName, // Keep original database name for reference
      displayName: config.displayName,
      image: config.image,
      color: config.color,
    };
  });
  

  return (
    <>
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
                boxShadow="xl"
                minH="110px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "2xl",
                }}
                background={
                  course.image
                    ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${course.image})`
                    : course.color
                }
                backgroundSize="contain"
                backgroundPosition="right"
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
                {/* Show color overlay for ALL courses (including those with images) */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg={course.color}
                  opacity={course.image ? 0.5 : 1}
                  zIndex={1}
                  transition="opacity 0.3s ease"
                  _hover={{
                    opacity: course.image ? 0.6 : 0.9,
                  }}
                />

                <Center flexDirection="column" zIndex={2} position="relative">
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="white"
                    textShadow="2px 2px 4px rgba(0,0,0,0.7)"
                    mb={2}
                  >
                    {course.displayName}
                  </Text>
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
          videos={videos}
          setTopicList={setTopicList}
          courseName={selectedCourse}
        />
      )}
    </>
  );
};

export default Subjects;
