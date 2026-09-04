import {
  Box,
  Heading,
  Flex,
  Text,
  Image,
  Button,
  Progress,
  Alert,
  HStack,
  VStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { LuArrowLeft, LuArrowRight, LuLayers } from "react-icons/lu";
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
import QuizAttempt from "./quizApp/quizAttempt";
import type { SubTopic } from "./quizTopicsList";

type Props = {
  examMode: string;
  selectedTopics: string[];
  selectedSubtopics?: string[];
  subtopicsByTopic?: Record<string, SubTopic[]>;
  topicsCount: number;
  selectedCourses: SelectedCourse[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<SelectedCourse[]>>;
  topicsByCourse: Record<string, Topic[]>;
  subjectImages: Record<string, string>;
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
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
  selectedSubtopics = [],
  subtopicsByTopic = {},
  topicsByCourse,
  selectedCourses,
  setSelectedCourses,
  setShowSideBar,
  setShowNavBar,
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

  // Quick Test: 7 minutes per subject; Examination: 60 minutes per subject
  const allocatedTime = examMode === "examination"
    ? selectedCourses.length * 60
    : selectedCourses.length * 7;

  useEffect(() => {
    setTimePerSubject(allocatedTime / Math.max(selectedCourses.length, 1));
  }, [examMode, allocatedTime, selectedCourses.length]);

  const fetchQuizQuestions = async () => {
    setFetchingQuestions(true);
    setError(null);
    setShowNavBar(false);
    try {
      if (!authdStudent?.id) throw new Error("Student not authenticated.");

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

      const validSelectedCourses = selectedCourses
        .map((course) => {
          const dbSubject = subjectsData?.find((s) => s.name === course.dbName);
          return {
            ...course,
            id: dbSubject ? dbSubject.id : course.id,
          };
        })
        .filter((c) => c.id);

      const validTopics = selectedTopics.filter(
        (tId) => tId && typeof tId === "string" && tId.length > 0
      );

      if (validSelectedCourses.length === 0) {
        throw new Error("Could not find subject IDs in database. Please contact support.");
      }

      if (validTopics.length === 0) {
        throw new Error("No valid topics selected. Please select topics again.");
      }

      // 2. Resolve quizzes for the selected subject(s) and topics
      let allQuizzes: any[] = [];
      try {
        const { data: dbQuizzes, error: quizzesError } = await supabase
          .from("quizzes")
          .select("id, subject_id, topic_id, title")
          .in("subject_id", validSelectedCourses.map((c) => c.id))
          .in("topic_id", validTopics);

        if (quizzesError) throw quizzesError;
        allQuizzes = dbQuizzes || [];
      } catch (err: any) {
        console.error("Error fetching quizzes:", err);
        throw new Error(`Quiz fetch error: ${err.message}`);
      }

      if (allQuizzes.length === 0) {
        throw new Error(
          "No quizzes found for the selected subjects and topics."
        );
      }

      const quizIds = allQuizzes.map((quiz) => quiz.id);

      // 3. Fetch questions with Topic & Subtopic logic
      // In Quick Test mode: Filter or prioritize by selectedSubtopics
      // In Examination mode: Fetch across all subtopics in the selected topics
      let loadedQuestions: any[] = [];

      // Query questions matching the quizzes or topics
      const { data: rawQuestions, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .in("quiz_id", quizIds);

      if (questionsError) {
        console.error("Error fetching questions by quiz_id:", questionsError);
      }

      const allFetchedQuestions = rawQuestions || [];

      // Also try fetching questions directly by topic_id if fewer questions found
      if (allFetchedQuestions.length < 5) {
        const { data: topicQuestions } = await supabase
          .from("questions")
          .select("*")
          .in("topic_id", validTopics);

        if (topicQuestions && topicQuestions.length > 0) {
          const existingIds = new Set(allFetchedQuestions.map((q) => q.id));
          topicQuestions.forEach((tq) => {
            if (!existingIds.has(tq.id)) {
              allFetchedQuestions.push(tq);
            }
          });
        }
      }

      if (allFetchedQuestions.length === 0) {
        throw new Error(
          "No questions found for the selected quizzes. Please ensure questions are loaded in the CMS."
        );
      }

      // Mode-specific Question Filtering
      if (examMode === "quick test" && selectedSubtopics.length > 0) {
        // Priority 1: Questions matching the exact subtopic IDs selected
        const subtopicQuestions = allFetchedQuestions.filter(
          (q) => q.subtopic_id && selectedSubtopics.includes(q.subtopic_id)
        );

        // Priority 2: Questions matching the selected topics (if subtopic_id is null/unassigned)
        const topicOnlyQuestions = allFetchedQuestions.filter(
          (q) => !q.subtopic_id || !selectedSubtopics.includes(q.subtopic_id)
        );

        // Combine prioritized subtopic questions first, supplemented by topic questions if needed
        const combined = [...subtopicQuestions, ...topicOnlyQuestions];
        // 15 questions per subject for test mode
        const targetCount = validSelectedCourses.length * 15;
        loadedQuestions = combined.slice(0, Math.max(targetCount, 15));
      } else {
        // Examination mode: shuffle and take up to 60 questions per subject
        const shuffled = [...allFetchedQuestions].sort(() => 0.5 - Math.random());
        const targetCount = validSelectedCourses.length * 60;
        loadedQuestions = shuffled.slice(0, Math.max(targetCount, 60));
      }

      // 4. Prepare quiz data
      const quizDataObj = {
        mode: examMode,
        subjects: validSelectedCourses,
        topics: validTopics,
        quizzes: allQuizzes,
        questions: loadedQuestions,
        timePerSubject,
        totalTime: allocatedTime,
      };

      setQuizData(quizDataObj);
      setShowQuizAttempt(true);
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
    setShowNavBar(true);
  };

  // Custom slider arrows
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
    if (topicsByCourse[course.dbName]) {
      return topicsByCourse[course.dbName].filter((topic) =>
        selectedTopics.includes(topic.id)
      );
    }

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
          setShowSideBar={setShowSideBar}
          setShowNavBar={setShowNavBar}
        />
      ) : (
        <Box w={{ base: "100%", lg: "85%" }} m="auto">
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
              {/* display timer only if examination mode */}
              {examMode === "examination" ? (
                <HStack>
                  <Image
                    src={timerImage}
                    alt="timer"
                    height={{ base: "28px", md: "32px" }}
                  />
                  <Heading
                    color="on_backgroundColor"
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="semibold"
                  >
                    {allocatedTime}:00
                  </Heading>
                </HStack>
              ) : (
                <HStack>
                  <Badge colorPalette="blue" variant="subtle" size="md" px={3} py={1} borderRadius="full">
                    ⚡ Untimed Practice
                  </Badge>
                </HStack>
              )}

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
            p={{ base: 3, md: 5, lg: 6 }}
            bg="white"
            borderRadius="xl"
            minH="75vh"
            shadow="sm"
          >
            <Heading
              as="h3"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
              mt={2}
              mb={4}
              mx={2}
            >
              <Flex align="center">
                <LuArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
                <Text ml={3}>
                  {examMode === "examination" ? "Examination Mode" : "Quick Test Mode"}
                </Text>
              </Flex>
              <Badge
                colorPalette={examMode === "examination" ? "blue" : "purple"}
                variant="subtle"
                px={3}
                py={1}
                borderRadius="full"
              >
                {examMode === "examination" ? "Whole Topic Exam" : "Topic & Subtopic Test"}
              </Badge>
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
              {/* Left Column: Course Topics & Subtopics Summary */}
              <Box w={{ base: "100%", md: "50%", lg: "45%" }} p={2}>
                <Slider {...sliderSettings}>
                  {selectedCourses.map((course) => {
                    const courseImage = subjectImages[course.dbName];
                    const selectedCourseTopics = getSelectedTopicsForCourse(course);

                    return (
                      <Box key={course.dbName} mb={6} position="relative" px={2}>
                        {/* Course Header & Image */}
                        <Flex
                          align="center"
                          gap={3}
                          mb={4}
                          w="100%"
                          justify="center"
                        >
                          {courseImage ? (
                            <Image src={courseImage} alt={course.displayName} maxH="80px" />
                          ) : (
                            <Box
                              borderRadius="xl"
                              p={3}
                              textAlign="center"
                              minH="60px"
                              minW="120px"
                              bg="blue.50"
                            >
                              <Text fontSize="sm" fontWeight="bold" color="blue.700">
                                {course.displayName}
                              </Text>
                            </Box>
                          )}
                        </Flex>

                        {/* Selected Topics & Subtopics Breakdown */}
                        {selectedCourseTopics.length > 0 && (
                          <VStack gap={3} align="stretch" maxH="380px" overflowY="auto" pr={1}>
                            {selectedCourseTopics.map((topic) => {
                              const topicSubtopics = subtopicsByTopic[topic.id] || [];
                              const chosenSubtopics = topicSubtopics.filter((st) =>
                                selectedSubtopics.includes(st.id)
                              );

                              return (
                                <Box
                                  key={topic.id}
                                  bg="blue.50/40"
                                  p={3}
                                  borderRadius="lg"
                                  border="1px solid"
                                  borderColor="blue.100"
                                >
                                  <Flex justify="space-between" align="center" mb={examMode === "quick test" && chosenSubtopics.length > 0 ? 2 : 0}>
                                    <Text fontSize="xs" fontWeight="700" color="gray.800">
                                      {topic.name}
                                    </Text>
                                    <IoIosCheckmarkCircle color="#1FBA79" size="18px" />
                                  </Flex>

                                  {/* In Quick Test Mode: display subtopics */}
                                  {examMode === "quick test" && (
                                    <Box mt={1}>
                                      {chosenSubtopics.length > 0 ? (
                                        <VStack align="stretch" gap={1} pl={2} borderLeft="2px solid" borderColor="purple.200">
                                          {chosenSubtopics.map((st) => (
                                            <HStack key={st.id} gap={1}>
                                              <Icon as={LuLayers} boxSize={3} color="purple.500" />
                                              <Text fontSize="11px" color="gray.600">
                                                {st.name}
                                              </Text>
                                            </HStack>
                                          ))}
                                        </VStack>
                                      ) : (
                                        <Text fontSize="10px" color="gray.500" fontStyle="italic">
                                          All subtopic concepts included
                                        </Text>
                                      )}
                                    </Box>
                                  )}

                                  {/* In Examination Mode */}
                                  {examMode === "examination" && (
                                    <Text fontSize="10px" color="blue.600" mt={0.5}>
                                      ✓ Complete syllabus topic coverage
                                    </Text>
                                  )}
                                </Box>
                              );
                            })}
                          </VStack>
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

              {/* Right Column: Instructions */}
              <Box w={{ base: "100%", md: "50%", lg: "55%" }} p={4}>
                <Heading size="md" mb={4} color="gray.800">
                  Assessment Instructions
                </Heading>

                <Box mb={4} p={3.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.800"
                    mb={1.5}
                  >
                    {examMode === "examination"
                      ? `⏱️ Examination Duration: ${timePerSubject} minutes per subject (60 questions each). Pass mark: 55%.`
                      : `📝 Quick Test: 15 questions per subject (Untimed Practice). Pass mark: 55%.`}
                  </Text>
                  <Text fontSize="xs" color="gray.600" lineHeight="relaxed">
                    {examMode === "examination"
                      ? "In Examination mode, questions test overall mastery across all subtopics in your selected topics."
                      : "In Quick Test mode, questions specifically focus on your selected topics and chosen subtopics."}
                  </Text>
                </Box>

                <VStack align="stretch" gap={3} color="gray.600" fontSize="xs">
                  <HStack align="start" gap={2}>
                    <Text fontWeight="bold" color="blue.600">1.</Text>
                    <Text>
                      {examMode === "examination"
                        ? "Once you begin the exam, the timer starts and cannot be paused until submitted."
                        : "Quick Test is untimed — practice and solve questions at your own comfortable pace."}
                    </Text>
                  </HStack>
                  <HStack align="start" gap={2}>
                    <Text fontWeight="bold" color="blue.600">2.</Text>
                    <Text>Ensure a stable internet connection and good device battery.</Text>
                  </HStack>
                  <HStack align="start" gap={2}>
                    <Text fontWeight="bold" color="blue.600">3.</Text>
                    <Text>Prepare pen and scratch paper for any calculations or problem-solving.</Text>
                  </HStack>
                  <HStack align="start" gap={2}>
                    <Text fontWeight="bold" color="blue.600">4.</Text>
                    <Text>Upon completion, view your instant breakdown, score report, and topic-level mastery insights.</Text>
                  </HStack>
                </VStack>

                {fetchingQuestions && (
                  <Box mt={6} p={4} bg="blue.50" borderRadius="lg">
                    <Text mb={2} fontSize="xs" fontWeight="bold" color="blue.800">
                      Preparing questions for your assessment...
                    </Text>
                    <Progress.Root value={65} size="sm" colorPalette="blue">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text mt={2} fontSize="11px" color="gray.600">
                      Loading and verifying questions according to your selected topics and subtopics
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
