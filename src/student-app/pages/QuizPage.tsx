import { useState } from "react";
import {
  Flex,
  Box,
  Alert,
  Button,
  Grid,
  Badge,

} from "@chakra-ui/react";
import { IoIosAlert } from "react-icons/io";
import { GoArrowRight, GoX } from "react-icons/go";
import QuizSubjectsList from "../components/quiz/quizSubjectsList";
import QuizTopicsList from "../components/quiz/quizTopicsList";
import SearchBar from "../components/quiz/searchBar";

interface Topic {
  id: string;
  name: string;
  description?: string;
  course: string; // Add course reference
}

const QuizPage = () => {
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [showTopicList, setShowTopicList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedForQuiz, setSelectedForQuiz] = useState<string[]>([]);
  const [showTick, setShowTick] = useState(false);

  // handles selection of courses
  const handleCourseSelect = (course: string, courseTopics: Topic[] = []) => {
    setSelectedForQuiz((prev) => {
      if (prev.includes(course)) {
        // Remove course and its topics
        setTopicList((prevTopics) =>
          prevTopics.filter((topic) => topic.course !== course)
        );
        return prev.filter((c) => c !== course);
      } else {
        // Add course and its topics
        const topicsWithCourse = courseTopics.map((topic) => ({
          ...topic,
          course: course,
        }));
        setTopicList((prev) => [...prev, ...topicsWithCourse]);
        return [...prev, course];
      }
    });
  };

  const handleRemoveCourse = (courseToRemove: string) => {
    setSelectedForQuiz((prev) =>
      prev.filter((course) => course !== courseToRemove)
    );
    setShowTick(false);

    // Also remove topics associated with this course
    setTopicList((prev) =>
      prev.filter((topic) => topic.course !== courseToRemove)
    );
  };

  const handleStartQuiz = () => {
    if (selectedForQuiz.length < 4) {
      alert("Please select at least 4 courses for the quiz");
      return;
    }
    // Start quiz logic here
    console.log("Starting quiz with courses:", selectedForQuiz);
    console.log("Available topics:", topicList);
    setShowTopicList(true);
  };

  return (
    <>
      {showTopicList ? (
        <QuizTopicsList
          topicList={topicList}
          selectedCourses={selectedForQuiz}
        />
      ) : (
        <>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            mb={4}
            mt={4}
          >
            <Box w="80%">
              <SearchBar mb={5} placeholder="Search subject ..." />
              <Alert.Root
                status="warning"
                variant="subtle"
                color="#474256"
                w={{ base: "full", md: "70%" }}
              >
                <Alert.Indicator color="orange.400">
                  <IoIosAlert />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Title fontSize="11px" fontWeight={700}>
                    Kindly note
                  </Alert.Title>
                  <Alert.Description fontSize="11px" fontWeight={400}>
                    You are allowed to pick at least four courses to take a quiz
                    on.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Box>

            <Button
              bg="primaryColor"
              w="60"
              p={6}
              rounded="3xl"
              fontWeight="500"
              onClick={handleStartQuiz}
              disabled={selectedForQuiz.length < 4}
              display={{ base: "none", md: "flex" }}
            >
              Next <GoArrowRight />
            </Button>
          </Flex>

          {/* Display selected courses */}
          {selectedForQuiz.length > 0 && (
            <Box mb={4} p={4} bg="white" borderRadius="lg">
              <Grid
                templateColumns={{
                  base: "repeat(auto-fill, minmax(150px, 1fr))",
                  md: "repeat(auto-fill, minmax(200px, 1fr))",
                  lg: "repeat(auto-fill, minmax(225px, 1fr))",
                }}
                gap={{ base: 4, md: 4 }}
                py={{ base: 4, md: 6 }}
              >
                {selectedForQuiz.map((course, index) => (
                  <Badge
                    key={index}
                    colorScheme="blue"
                    p={4}
                    borderRadius="xl"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1}
                    size={"lg"}
                  >
                    {course}
                    <GoX
                      size={12}
                      cursor="pointer"
                      onClick={() => handleRemoveCourse(course)}
                    />
                  </Badge>
                ))}
              </Grid>
              {/* start quiz button */}
              <Flex w="full" mt={5} justify="flex-end" align="center">
                <Button
                  bg="primaryColor"
                  w="47%"
                  p={6}
                  rounded="xl"
                  fontWeight="500"
                  onClick={handleStartQuiz}
                  disabled={selectedForQuiz.length < 4}
                  display={{ base: "flex", md: "none" }}
                  alignItems="center"
                  gap={6}
                >
                  Next <GoArrowRight />
                </Button>
              </Flex>
            </Box>
          )}

          <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="75vh">
            <QuizSubjectsList
              onCourseSelect={handleCourseSelect}
              setSelectedCourse={setSelectedCourse}
              selectedCourses={selectedForQuiz}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default QuizPage;
