import {
  Box,
  Flex,
  RadioGroup,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Checkbox,
  Button,
  Grid,
  Alert,
  Progress,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { GoArrowRight } from "react-icons/go";
import { LuArrowLeft } from "react-icons/lu";
import { useStudentData } from "@/student-app/context/dataContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import quickTestIcon from "@/assets/quickTest_ico.png";
import examTestIcon from "@/assets/examText_ico.png";
import QuizInstructions from "./quizInstructions";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";

type Props = {
  topicList: Topic[];
  selectedCourses: SelectedCourse[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<SelectedCourse[]>>;
  setShowTopicList: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTopicsId: string;
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
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

interface TopicWithQuizStatus extends Topic {
  hasQuiz: boolean;
}

const QuizTopicsList = ({
  topicList,
  setShowTopicList,
  selectedCourses,
  setSelectedCourses,
  setShowSideBar,
  setShowNavBar,
}: Props) => {
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showInstructPage, setShowInstructPage] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<TopicWithQuizStatus[]>([]);
  const [loadingAvailableTopics, setLoadingAvailableTopics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { subjectImages } = useStudentData();
  const { authdStudent } = useAuthdStudentData();

  const items = [
    {
      value: "quick test",
      icon: quickTestIcon,
      title: "Quick Test",
      description:
        "In quick test mode, you will attempt 15 multiple choice questions in 7 minutes for each subject",
    },
    {
      value: "examination",
      icon: examTestIcon,
      title: "Examination",
      description:
        "In examination mode, you will attempt 60 multiple choice questions in 60 minutes for each subject",
    },
  ];

  // Stable serialised keys so the effect only re-fires when content actually changes,
  // not just because the parent handed us a new array reference on re-render.
  const selectedCoursesKey = JSON.stringify(selectedCourses);
  const topicListKey = JSON.stringify(topicList.map((t) => t.id));

  useEffect(() => {
    const fetchAvailableTopics = async () => {
      if (selectedCourses.length === 0 || topicList.length === 0) {
        setAvailableTopics([]);
        return;
      }

      setLoadingAvailableTopics(true);
      setError(null);

      try {
        const dbNames = selectedCourses.map((course) => course.dbName);
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, name")
          .in("name", dbNames);

        if (subjectsError) throw subjectsError;

        if (!subjectsData || subjectsData.length === 0) {
          setAvailableTopics([]);
          return;
        }

        const coursesWithIds = selectedCourses
          .map((course) => {
            const dbSubject = subjectsData.find(
              (subject) => subject.name === course.dbName
            );
            return { ...course, id: dbSubject?.id || null };
          })
          .filter((course) => course.id);

        // Deduplicate topicList by id — this is the main fix for the duplication bug.
        // If the parent passes the same topic more than once (e.g. due to re-renders
        // that append instead of replace), Map deduplication keeps only the first
        // occurrence of each id.
        const uniqueTopics = Array.from(
          new Map(topicList.map((t) => [t.id, t])).values()
        );

        const allTopicIds = uniqueTopics.map((t) => t.id);

        const { data: existingQuizzes, error: quizzesError } = await supabase
          .from("quizzes")
          .select("id, subject_id, topic_id")
          .in("subject_id", coursesWithIds.map((c) => c.id))
          .in("topic_id", allTopicIds);

        if (quizzesError) throw quizzesError;

        const topicsWithQuizzes = new Set(
          existingQuizzes?.map((quiz) => quiz.topic_id) || []
        );

        // Build the filtered list from the deduplicated array only
        const filteredAvailableTopics = uniqueTopics
          .map((topic) => ({ ...topic, hasQuiz: topicsWithQuizzes.has(topic.id) }))
          .filter((topic) => topic.hasQuiz);

        setAvailableTopics(filteredAvailableTopics);

        // Drop any selected topics that no longer have quizzes
        const validSelectedTopics = selectedTopics.filter((id) =>
          topicsWithQuizzes.has(id)
        );
        if (validSelectedTopics.length !== selectedTopics.length) {
          setSelectedTopics(validSelectedTopics);
        }
      } catch (err) {
        console.error("Error fetching available topics:", err);
        setError("Failed to load available topics");
        setAvailableTopics([]);
      } finally {
        setLoadingAvailableTopics(false);
      }
    };

    fetchAvailableTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoursesKey, topicListKey]);

  const handleRadioChange = (value: string | null) => {
    if (value) setSelectedMode(value);
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSelectAll = (course: string) => {
    const courseTopicIds = availableTopics
      .filter((topic) => topic.course === course)
      .map((topic) => topic.id);

    setSelectedTopics((prev) => {
      const allSelected = courseTopicIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !courseTopicIds.includes(id));
      }
      const newTopics = courseTopicIds.filter((id) => !prev.includes(id));
      return [...prev, ...newTopics];
    });
  };

  const handleStartQuiz = () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic for the quiz");
      return;
    }
    if (!selectedMode) {
      alert("Please select a quiz mode");
      return;
    }
    setShowInstructPage(true);
    setShowSideBar(false);
  };

  // Group deduplicated availableTopics by course
  const topicsByCourse = availableTopics.reduce((acc, topic) => {
    if (!acc[topic.course]) acc[topic.course] = [];
    acc[topic.course].push(topic);
    return acc;
  }, {} as Record<string, TopicWithQuizStatus[]>);

  const settings = {
    arrows: false,
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <>
      {showInstructPage ? (
        <QuizInstructions
          examMode={selectedMode}
          selectedTopics={selectedTopics}
          topicsCount={selectedTopics.length}
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
          topicsByCourse={topicsByCourse}
          subjectImages={subjectImages}
          setShowTopicList={setShowTopicList}
          setShowSideBar={setShowSideBar}
          setShowNavBar={setShowNavBar}
          onBack={() => setShowInstructPage(false)}
        />
      ) : (
        <>
          {error && (
            <Alert.Root status="warning" mb={4}>
              <Alert.Indicator />
              <Alert.Title>Warning</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          {loadingAvailableTopics && (
            <Box mb={4} p={4} bg="blue.50" borderRadius="md">
              <Text mb={2} fontSize="xs" fontWeight="semibold">
                Loading available topics...
              </Text>
              <Progress.Root value={50} colorPalette="blue" size="sm">
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Text mt={2} fontSize="xs">
                Checking which topics have available quizzes
              </Text>
            </Box>
          )}

          <Box p={4} borderRadius="md">
            <Flex justify="space-between" align="center">
              <Box width={{ base: "45%", md: "50%" }}>
                <Slider {...settings}>
                  {selectedCourses.map((course, index) => {
                    const courseImage = subjectImages[course.dbName];
                    return (
                      <Box key={index} textAlign="center">
                        {courseImage ? (
                          <Image src={courseImage} alt={course.displayName} />
                        ) : (
                          <Box
                            bg="gray.200"
                            boxSize="200px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="lg"
                            mx="auto"
                            mb={2}
                          >
                            <Text color="gray.500" fontWeight="bold">
                              {course.displayName}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Slider>
              </Box>
              <Button
                bg="primaryColor"
                w={{ base: "40", md: "60" }}
                p={6}
                rounded={{ base: "xl", md: "3xl" }}
                fontWeight="500"
                onClick={handleStartQuiz}
                disabled={!selectedMode || selectedTopics.length === 0 || loadingAvailableTopics}
              >
                Continue <GoArrowRight />
              </Button>
            </Flex>
          </Box>

          <Box mb={4} mt={4} bg="white" shadow="xl" rounded="md" p={4}>
            <RadioGroup.Root
              value={selectedMode}
              onValueChange={(details) => handleRadioChange(details.value)}
              colorPalette="green"
              size="sm"
            >
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align="center"
                gap={4}
              >
                {items.map((item) => (
                  <RadioGroup.Item key={item.value} value={item.value} asChild>
                    <label>
                      <RadioGroup.ItemHiddenInput />
                      <Flex
                        bg="textFieldColor"
                        justify="space-around"
                        align="center"
                        gap={3}
                        p={2}
                        rounded="xl"
                        flex="1"
                        cursor="pointer"
                        border="2px solid"
                        borderColor={selectedMode === item.value ? "blue.300" : "transparent"}
                        _hover={{ borderColor: "blue.300" }}
                        transition="all 0.2s"
                      >
                        <Image src={item.icon} height="35px" alt="icon" />
                        <Box flex="1">
                          <Heading fontSize="sm">{item.title}</Heading>
                          <Text fontSize="xs" color="gray.600">
                            {item.description}
                          </Text>
                        </Box>
                        <RadioGroup.ItemIndicator cursor="pointer" />
                      </Flex>
                    </label>
                  </RadioGroup.Item>
                ))}
              </Flex>
            </RadioGroup.Root>
          </Box>

          <Flex
            justify="space-between"
            align="center"
            bg="white"
            rounded="md"
            shadow="lg"
            p={4}
            mb={2}
          >
            <HStack>
              <LuArrowLeft
                style={{ cursor: "pointer" }}
                onClick={() => setShowTopicList(false)}
              />
              <Heading size="sm">Select Topics for Quiz</Heading>
            </HStack>
            <VStack align="end" gap={1}>
              <Text color="gray.600" fontSize="xs">
                {selectedTopics.length} topic(s) selected
              </Text>
            </VStack>
          </Flex>

          <Box bg="white" rounded="md" shadow="lg" p={4} mb={2}>
            {loadingAvailableTopics ? (
              <Text color="gray.500" textAlign="center" py={8}>
                Loading available topics...
              </Text>
            ) : Object.keys(topicsByCourse).length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No topics with available quizzes found for the selected courses.
              </Text>
            ) : (
              <VStack gap={2} align="stretch" mb={{ base: 24, lg: 0 }}>
                {Object.entries(topicsByCourse).map(([course, topics]) => (
                  <Box key={course}>
                    <Flex justify="space-between" align="center" mb={5}>
                      <Heading size="sm">{course} Topics</Heading>
                      <Button
                        size="sm"
                        fontSize="xs"
                        variant="subtle"
                        onClick={() => handleSelectAll(course)}
                      >
                        {topics.every((topic) => selectedTopics.includes(topic.id))
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </Flex>
                    <Grid
                      templateColumns={{
                        base: "repeat(auto-fill, minmax(150px, 1fr))",
                        md: "repeat(auto-fill, minmax(200px, 1fr))",
                        lg: "repeat(auto-fill, minmax(225px, 1fr))",
                      }}
                      gap={{ base: 4, md: 6 }}
                      py={{ base: 4, md: 6 }}
                    >
                      {topics.map((topic) => (
                        <Checkbox.Root
                          key={topic.id}
                          size="sm"
                          colorPalette="green"
                          checked={selectedTopics.includes(topic.id)}
                          onCheckedChange={() => handleTopicSelect(topic.id)}
                        >
                          <Box
                            bg={selectedTopics.includes(topic.id) ? "blue.50" : "gray.50"}
                            p={3}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={
                              selectedTopics.includes(topic.id) ? "blue.300" : "textFieldColor"
                            }
                            minW={{ base: "175px", md: "225px", lg: "250px" }}
                            cursor="pointer"
                          >
                            <Flex justify="space-between" align="center" gap={3}>
                              <Text fontSize="xs">{topic.name}</Text>
                              <Checkbox.HiddenInput />
                              <Checkbox.Control cursor="pointer" />
                            </Flex>
                          </Box>
                        </Checkbox.Root>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default QuizTopicsList;