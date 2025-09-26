import {
  Box,
  Heading,
  Flex,
  Text,
  Image,
  Button,
  Progress,
  Alert,
  Center,
  HStack,
} from "@chakra-ui/react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { useState, useEffect } from "react";
import { useStudentData } from "@/student-app/context/dataContext";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { GoArrowRight } from "react-icons/go";
import { IoIosCheckmarkCircle } from "react-icons/io";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import timerImage from "@/assets/timer.png";
import QuizAttempt from "./quizAttempt";

type Props = {
  examMode: string;
  selectedTopics: string[];
  topicsCount: number;
  selectedCourses: SelectedCourse[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<SelectedCourse[]>>;
  topicsByCourse: Record<string, Topic[]>;
  subjectImages: Record<string, string>;
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTopicList: React.Dispatch<React.SetStateAction<boolean>>;
  onBack: () => void;
};

interface Topic {
  id: string;
  name: string;
  description?: string;
  course: string;
}

interface SelectedCourse {
  displayName: string;
  dbName: string;
  id: string;
}

const QuizInstructions = ({
  examMode,
  selectedTopics,
  topicsByCourse,
  selectedCourses,
  setSelectedCourses,
  setShowSideBar,
  setShowTopicList,
  onBack,
}: Props) => {
  const { authdStudent } = useAuthdStudentData();
  const { subjectImages } = useStudentData();
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [showQuizAttempt, setShowQuizAttempt] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [timePerSubject, setTimePerSubject] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const allocatedTime =
    examMode === "examination"
      ? selectedCourses.length * 60
      : selectedCourses.length * 10;

  useEffect(() => {
    setTimePerSubject(examMode === "examination" ? 60 : 10);
  }, [examMode, selectedCourses.length]);

  const fetchQuizQuestions = async () => {
    setFetchingQuestions(true);
    setError(null);

    try {
      if (!authdStudent?.id) throw new Error("Student not authenticated.");

      console.log("Looking up subject IDs from database...");

      // 1. Get all subject IDs from the database using the dbNames
      const dbNames = selectedCourses.map((course) => course.dbName);

      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name")
        .in("name", dbNames);

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
        throw new Error(`Error loading subjects: ${subjectsError.message}`);
      }

      console.log("Subjects found in database:", subjectsData);

      if (!subjectsData || subjectsData.length === 0) {
        throw new Error(
          "No subjects found in database. Please contact support."
        );
      }

      // 2. Map the database subjects to our selected courses
      const coursesWithIds = selectedCourses.map((course) => {
        const dbSubject = subjectsData.find(
          (subject) => subject.name === course.dbName
        );
        return {
          ...course,
          id: dbSubject?.id || null, // Add the ID from database
        };
      });

      console.log("Courses with IDs:", coursesWithIds);

      // 3. Validate that all selectedCourses now have valid IDs
      const validSelectedCourses = coursesWithIds.filter((course) => {
        const isValid =
          course.id && typeof course.id === "string" && course.id.length > 0;
        console.log(
          `Course validation: ${course.displayName} - ID: ${course.id}, Valid: ${isValid}`
        );
        return isValid;
      });

      console.log("Valid courses after ID lookup:", validSelectedCourses);

      // 4. Validate topics (same as before)
      const validTopics = selectedTopics.filter((topicId) => {
        const isValid =
          topicId && typeof topicId === "string" && topicId.length > 0;
        console.log(`Topic validation: ${topicId} - isValid: ${isValid}`);
        return isValid;
      });

      console.log("Valid topics after filtering:", validTopics);

      if (validSelectedCourses.length === 0) {
        const errorDetails = coursesWithIds.map((course) => ({
          displayName: course.displayName,
          dbName: course.dbName,
          id: course.id,
        }));

        console.error(
          "No valid subjects after ID lookup - details:",
          errorDetails
        );
        throw new Error(
          "Could not find subject IDs in database. Please contact support."
        );
      }

      if (validTopics.length === 0) {
        console.error("No valid topics - details:", selectedTopics);
        throw new Error(
          "No valid topics selected. Please select topics again."
        );
      }

      // 5. Get the class ID from the class name (same as before)
      let classId = null;
      if (authdStudent.class) {
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .select("id")
          .eq("name", authdStudent.class)
          .single();

        if (classError) {
          console.warn("Could not find class ID, using null:", classError);
        } else {
          classId = classData.id;
          console.log("Found class ID:", classId);
        }
      }

      // 6. Continue with the rest of your function using validSelectedCourses instead of selectedCourses
      console.log("Checking existing quizzes...");
      const { data: existingQuizzes, error: quizzesError } = await supabase
        .from("quizzes")
        .select("id, subject_id, topic_id")
        .in(
          "subject_id",
          validSelectedCourses.map((course) => course.id)
        )
        .in("topic_id", validTopics);

      if (quizzesError) {
        console.error("Error fetching quizzes:", quizzesError);
        throw new Error(`Quiz fetch error: ${quizzesError.message}`);
      }

      console.log("Existing quizzes:", existingQuizzes);

      // 3. Create missing quizzes
      const quizzesToCreate = [];
      for (const course of validSelectedCourses) {
        for (const topicId of validTopics) {
          const exists = existingQuizzes?.some(
            (quiz) => quiz.subject_id === course.id && quiz.topic_id === topicId
          );

          if (!exists) {
            quizzesToCreate.push({
              subject_id: course.id,
              topic_id: topicId,
              class_id: classId,
            });
          }
        }
      }

      let allQuizzes = [...(existingQuizzes || [])];

      if (quizzesToCreate.length > 0) {
        console.log("Creating new quizzes:", quizzesToCreate);
        const { data: newQuizzes, error: createError } = await supabase
          .from("quizzes")
          .insert(quizzesToCreate)
          .select("id, subject_id, topic_id");

        if (createError) {
          console.error("Error creating quizzes:", createError);
          throw new Error(`Quiz creation error: ${createError.message}`);
        }

        if (newQuizzes) {
          allQuizzes = [...allQuizzes, ...newQuizzes];
        }
      }

      console.log("All quizzes:", allQuizzes);

      if (allQuizzes.length === 0) {
        throw new Error(
          "No quizzes found or created for the selected subjects and topics."
        );
      }

      // 4. Fetch questions
      console.log("Fetching questions...");
      const quizIds = allQuizzes.map((quiz) => quiz.id);
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select(
          "id, question_text, option_a, option_b, option_c, option_d, correct_option, quiz_id, subject_id, topic_id"
        )
        .in("quiz_id", quizIds)
        .limit(examMode === "examination" ? 100 : 50);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        throw new Error(`Questions fetch error: ${questionsError.message}`);
      }

      console.log("Fetched questions:", questions);

      if (!questions || questions.length === 0) {
        throw new Error(
          "No questions found for the selected quizzes. Please contact support."
        );
      }

      // 5. Prepare quiz data
      const quizDataObj = {
        mode: examMode,
        subjects: validSelectedCourses,
        topics: validTopics,
        quizzes: allQuizzes,
        questions,
        timePerSubject,
        totalTime: allocatedTime,
      };

      setQuizData(quizDataObj);
      setShowQuizAttempt(true);
      console.log("Quiz data prepared successfully");
    } catch (err) {
      console.error("Error in fetchQuizQuestions:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while preparing the quiz.";

      setError(errorMessage);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    await fetchQuizQuestions();
    setLoading(false);
  };

  const handleQuizComplete = (results: any) => {
    console.log("Quiz completed with results:", results);
  };

  const handleCancelQuiz = () => {
    setShowQuizAttempt(false);
    setQuizData(null);
    setShowTopicList(false);
    setSelectedCourses([]);
    setShowSideBar(true);
  };

  console.log("This is the tpoics by course: ", topicsByCourse);
  console.log("These are the topics: ", selectedTopics);

  // custom arrow functions
  function SampleNextArrow(props: any) {
    const { onClick } = props;
    return (
      <Button
        onClick={onClick}
        position="absolute"
        right="-25px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        variant="ghost"
        size="sm"
      >
        <LuArrowRight />
      </Button>
    );
  }

  function SamplePrevArrow(props: any) {
    const { onClick } = props;
    return (
      <Button
        onClick={onClick}
        position="absolute"
        left="-25px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        variant="ghost"
        size="sm"
      >
        <LuArrowLeft />
      </Button>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
    ],
  };

  // Function to get selected topics for a specific course
  const getSelectedTopicsForCourse = (course: SelectedCourse) => {
    // If topicsByCourse is keyed by database name
    if (topicsByCourse[course.dbName]) {
      return topicsByCourse[course.dbName].filter((topic) =>
        selectedTopics.includes(topic.id)
      );
    }

    // Try case-insensitive matching
    const matchingKey = Object.keys(topicsByCourse).find(
      (key) =>
        key.toLowerCase() === course.dbName.toLowerCase() ||
        key.toLowerCase() === course.displayName.toLowerCase() ||
        key.toLowerCase() === course.id
    );

    if (matchingKey) {
      return topicsByCourse[matchingKey].filter((topic) =>
        selectedTopics.includes(topic.id)
      );
    }

    return [];
  };

  return (
    <>
      {showQuizAttempt && quizData ? (
        <QuizAttempt
          quizData={quizData}
          onComplete={handleQuizComplete}
          onCancel={handleCancelQuiz}
        />
      ) : (
        <Box w={{ base: "100%", lg: "80%" }} m="auto">
          <Flex
            justify="flex-end"
            align="center"
            mt={{ base: 4, md: 0 }}
            mb={4}
          >
            <Flex
              justify="space-between"
              w={{ base: "70%", md: "60%", lg: "50%" }}
            >
              <HStack>
                <Image
                  src={timerImage}
                  alt="timer"
                  height={{ base: "30px", md: "35px" }}
                />
                <Heading
                  color="on_backgroundColor"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="semibold"
                >
                  {allocatedTime}:00
                </Heading>
              </HStack>

              <Button
                bg="primaryColor"
                mx={{ lg: 6 }}
                size="lg"
                w={{ base: 36, md: 48, lg: 60 }}
                p={{ base: 4, md: 6 }}
                rounded={{ base: "lg", md: "3xl" }}
                fontWeight="500"
                onClick={handleStartQuiz}
                loading={loading || fetchingQuestions}
                loadingText={
                  fetchingQuestions ? "Preparing Questions..." : "Starting..."
                }
                disabled={!!error}
              >
                Start Quiz <GoArrowRight />
              </Button>
            </Flex>
          </Flex>
          <Box
            mb={4}
            p={{ base: 2, md: 4, lg: 6 }}
            bg="white"
            borderRadius="lg"
            minH="75vh"
          >
            <Heading
              as="h3"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
              mt={3}
              mb={5}
              mx={2}
            >
              <Flex align="center">
                <LuArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
                <Text ml={3}>
                  {examMode === "examination" ? "Examination" : "Quick Test"}
                </Text>
              </Flex>
            </Heading>

            {error && (
              <Alert.Root status="error" mb={4}>
                <Alert.Indicator />
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Root>
            )}

            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align="flex-start"
              gap={6}
            >
              <Box w={{ base: "100%", md:'50%', lg: "40%" }} p={4}>
                <Slider {...sliderSettings}>
                  {selectedCourses.map((course) => {
                    const courseImage = subjectImages[course.dbName];
                    const selectedCourseTopics =
                      getSelectedTopicsForCourse(course);

                    return (
                      <Box
                        key={course.dbName}
                        mb={6}
                        position="relative"
                      >
                        {/* Course Image */}
                        <Flex
                          align="center"
                          gap={3}
                          mb={4}
                          w={{ base: "70%", md: "65%", lg: "60%" }}
                          m="auto"
                        >
                          {courseImage ? (
                            <Image src={courseImage} alt={course.displayName} />
                          ) : (
                            <Box
                              borderRadius="xl"
                              p={4}
                              textAlign="center"
                              minH="80px"
                              minW="80px"
                              display="flex"
                              flexDirection="column"
                              justifyContent="center"
                              alignItems="center"
                              bg="gray.100"
                              cursor="pointer"
                              position="relative"
                              overflow="hidden"
                            >
                              <Center
                                flexDirection="column"
                                zIndex={2}
                                position="relative"
                              >
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="gray.600"
                                  textAlign="center"
                                >
                                  {course.displayName}
                                </Text>
                              </Center>
                            </Box>
                          )}
                        </Flex>

                        {/* Selected Topics */}
                        {selectedCourseTopics.length > 0 && (
                          <Box
                            w={{ base: "70%", md: "65%", lg: "60%" }}
                            m="auto"
                          >
                            {selectedCourseTopics.map((topic) => (
                              <Box key={topic.id} py={2}>
                                <Box
                                  bg="#206CE10D"
                                  p={4}
                                  borderRadius="lg"
                                  textAlign="center"
                                  minH="45px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="space-between"
                                >
                                  <Text
                                    fontSize="xs"
                                    fontWeight="medium"
                                    color="on_backgroundColor"
                                  >
                                    {topic.name}
                                  </Text>
                                  <IoIosCheckmarkCircle
                                    color="#1FBA79"
                                    size="17px"
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {selectedCourseTopics.length === 0 && (
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            fontStyle="italic"
                            textAlign="center"
                          >
                            No topics selected for this course
                          </Text>
                        )}
                      </Box>
                    );
                  })}
                </Slider>
              </Box>

              <Box w={{ base: "100%", md: "50%", lg: "50%" }} p={6}>
                <Heading size="xl" mb={6} color="on_backgroundColor">
                  Instructions
                </Heading>

                <Text
                  fontSize={{ base: "md", md: "sm", lg: "md" }}
                  fontWeight={500}
                  lineHeight="tall"
                  mb={4}
                  color="on_backgroundColor"
                >
                  {examMode === "examination"
                    ? `The quiz duration is ${timePerSubject} minutes per subject,
                     60 multiple choice questions each. Pass mark is 55%.`
                    : `The quiz duration is ${allocatedTime} minutes total,
                     with 25 multiple choice questions distributed across subjects.
                     Pass mark is 55%.`}
                </Text>

                <Text
                  fontSize={{ base: "md", md: "sm", lg: "md" }}
                  fontWeight={500}
                  lineHeight="tall"
                  color="on_backgroundColor"
                >
                  Please note that once you begin the quiz, it can't be stopped
                  until it's submitted.
                  <br />
                  <br />
                  Ensure you have enough power and good connectivity on your
                  device. Prepare a pen, paper and calculator (for Math-related
                  questions).
                  <br />
                  <br />
                  After a successful completion of the test, you can check your
                  result on your profile.
                </Text>

                {fetchingQuestions && (
                  <Box mt={8} p={4} bg="blue.50" borderRadius="md">
                    <Text mb={2} fontWeight="bold">
                      Preparing your quiz...
                    </Text>
                    <Progress.Root value={50} size="sm">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text mt={2} fontSize="sm">
                      Loading questions from selected topics
                    </Text>
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );
};

export default QuizInstructions;
