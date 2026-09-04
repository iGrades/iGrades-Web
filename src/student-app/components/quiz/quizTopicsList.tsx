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
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { GoArrowRight } from "react-icons/go";
import { LuArrowLeft, LuChevronDown, LuChevronUp, LuLayers, LuBookOpen } from "react-icons/lu";
import { useStudentData } from "@/student-app/context/dataContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import quickTestIcon from "@/assets/quickTest_ico.png";
import examTestIcon from "@/assets/examText_ico.png";
import QuizInstructions from "./quizInstructions";
import { toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";

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

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
  order_index?: number;
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
  const [selectedMode, setSelectedMode] = useState<string>("quick test");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [subtopicsByTopic, setSubtopicsByTopic] = useState<Record<string, SubTopic[]>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [showInstructPage, setShowInstructPage] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<TopicWithQuizStatus[]>([]);
  const [loadingAvailableTopics, setLoadingAvailableTopics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { subjectImages } = useStudentData();

  const items = [
    {
      value: "quick test",
      icon: quickTestIcon,
      title: "Quick Test (Test Mode)",
      badge: "Topic & Subtopic Level",
      description:
        "Select specific topics and subtopics to target your test practice (15 questions in 7 mins per subject)",
    },
    {
      value: "examination",
      icon: examTestIcon,
      title: "Examination (Exam Mode)",
      badge: "Whole Topic & Syllabus",
      description:
        "Select topics to be tested across all syllabus subtopics (60 questions in 60 mins per subject)",
    },
  ];

  const selectedCoursesKey = JSON.stringify(selectedCourses);
  const topicListKey = JSON.stringify(topicList.map((t) => t.id));

  useEffect(() => {
    const fetchAvailableTopicsAndSubtopics = async () => {
      if (selectedCourses.length === 0 || topicList.length === 0) {
        setAvailableTopics([]);
        setSubtopicsByTopic({});
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

        const uniqueTopics = Array.from(
          new Map(topicList.map((t) => [t.id, t])).values()
        );

        const allTopicIds = uniqueTopics.map((t) => t.id);

        // 1. Fetch quizzes to verify which topics have quizzes
        const { data: existingQuizzes, error: quizzesError } = await supabase
          .from("quizzes")
          .select("id, subject_id, topic_id")
          .in("subject_id", coursesWithIds.map((c) => c.id))
          .in("topic_id", allTopicIds);

        if (quizzesError) throw quizzesError;

        const topicsWithQuizzes = new Set(
          existingQuizzes?.map((quiz) => quiz.topic_id) || []
        );

        const filteredAvailableTopics = uniqueTopics
          .map((topic) => ({ ...topic, hasQuiz: topicsWithQuizzes.has(topic.id) }))
          .filter((topic) => topic.hasQuiz);

        setAvailableTopics(filteredAvailableTopics);

        // 2. Fetch all subtopics for these available topics
        const availableTopicIds = filteredAvailableTopics.map((t) => t.id);
        const subtopicMap: Record<string, SubTopic[]> = {};

        if (availableTopicIds.length > 0) {
          try {
            let fetchedSubtopics: SubTopic[] = [];
            const { data: subData, error: subError } = await supabase
              .from("sub_topics")
              .select("id, name, topic_id, order_index")
              .in("topic_id", availableTopicIds)
              .order("order_index", { ascending: true })
              .order("name", { ascending: true });

            if (!subError && subData && subData.length > 0) {
              fetchedSubtopics = subData as SubTopic[];
            } else {
              // Fallback to subtopics table
              const { data: altSubData } = await supabase
                .from("subtopics")
                .select("id, name, topic_id")
                .in("topic_id", availableTopicIds);
              if (altSubData && altSubData.length > 0) {
                fetchedSubtopics = altSubData as SubTopic[];
              }
            }

            // Organize by topic_id
            availableTopicIds.forEach((tId) => {
              const matching = fetchedSubtopics.filter((st) => st.topic_id === tId);
              if (matching.length > 0) {
                subtopicMap[tId] = matching;
              } else {
                // If topic doesn't have explicit subtopics yet, provide a general virtual subtopic
                const topicObj = filteredAvailableTopics.find((t) => t.id === tId);
                subtopicMap[tId] = [
                  {
                    id: `default_${tId}`,
                    name: `${topicObj?.name || "General"} Core Concepts`,
                    topic_id: tId,
                  },
                ];
              }
            });
          } catch (e) {
            console.warn("Could not load subtopics, using fallback:", e);
            availableTopicIds.forEach((tId) => {
              const topicObj = filteredAvailableTopics.find((t) => t.id === tId);
              subtopicMap[tId] = [
                {
                  id: `default_${tId}`,
                  name: `${topicObj?.name || "General"} Core Concepts`,
                  topic_id: tId,
                },
              ];
            });
          }
        }

        setSubtopicsByTopic(subtopicMap);

        // Auto-expand all topics initially for easy subtopic visibility in Test Mode
        const initialExpanded: Record<string, boolean> = {};
        availableTopicIds.forEach((id) => {
          initialExpanded[id] = true;
        });
        setExpandedTopics(initialExpanded);

        // Drop any selected topics that no longer have quizzes
        setSelectedTopics((prev) => prev.filter((id) => topicsWithQuizzes.has(id)));
      } catch (err) {
        console.error("Error fetching available topics and subtopics:", err);
        setError("Failed to load available topics");
        setAvailableTopics([]);
      } finally {
        setLoadingAvailableTopics(false);
      }
    };

    fetchAvailableTopicsAndSubtopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoursesKey, topicListKey]);

  const handleRadioChange = (value: string | null) => {
    if (value) {
      setSelectedMode(value);
      // If switching to examination mode, we don't need subtopics
      // If switching to test mode, ensure subtopics are synced
    }
  };

  // Toggle whole topic
  const handleTopicToggle = (topicId: string) => {
    const isCurrentlySelected = selectedTopics.includes(topicId);
    const topicSubtopics = subtopicsByTopic[topicId] || [];
    const topicSubtopicIds = topicSubtopics.map((st) => st.id);

    if (isCurrentlySelected) {
      // Unselect topic
      setSelectedTopics((prev) => prev.filter((id) => id !== topicId));
      // In test mode, also unselect all its subtopics
      setSelectedSubtopics((prev) => prev.filter((id) => !topicSubtopicIds.includes(id)));
    } else {
      // Select topic
      setSelectedTopics((prev) => [...prev, topicId]);
      // In test mode, select all its subtopics by default and expand
      if (selectedMode === "quick test") {
        setSelectedSubtopics((prev) => Array.from(new Set([...prev, ...topicSubtopicIds])));
        setExpandedTopics((prev) => ({ ...prev, [topicId]: true }));
      }
    }
  };

  // Toggle individual subtopic in test mode
  const handleSubtopicToggle = (subtopicId: string, topicId: string) => {
    const isSelected = selectedSubtopics.includes(subtopicId);
    const topicSubtopics = subtopicsByTopic[topicId] || [];
    const topicSubtopicIds = topicSubtopics.map((st) => st.id);

    if (isSelected) {
      const nextSubtopics = selectedSubtopics.filter((id) => id !== subtopicId);
      setSelectedSubtopics(nextSubtopics);
      // Check if any subtopic for this topic is still selected
      const hasOtherSelected = topicSubtopicIds.some(
        (id) => id !== subtopicId && nextSubtopics.includes(id)
      );
      if (!hasOtherSelected) {
        // If no subtopics left selected for this topic, remove topic from selectedTopics
        setSelectedTopics((prev) => prev.filter((id) => id !== topicId));
      }
    } else {
      // Add subtopic
      setSelectedSubtopics((prev) => [...prev, subtopicId]);
      // Ensure parent topic is in selectedTopics
      if (!selectedTopics.includes(topicId)) {
        setSelectedTopics((prev) => [...prev, topicId]);
      }
    }
  };

  // Select all subtopics for a topic
  const handleSelectAllSubtopicsForTopic = (topicId: string) => {
    const topicSubtopics = subtopicsByTopic[topicId] || [];
    const topicSubtopicIds = topicSubtopics.map((st) => st.id);
    const allSelected = topicSubtopicIds.every((id) => selectedSubtopics.includes(id));

    if (allSelected) {
      // Deselect all subtopics for this topic
      setSelectedSubtopics((prev) => prev.filter((id) => !topicSubtopicIds.includes(id)));
      setSelectedTopics((prev) => prev.filter((id) => id !== topicId));
    } else {
      // Select all subtopics for this topic
      setSelectedSubtopics((prev) => Array.from(new Set([...prev, ...topicSubtopicIds])));
      if (!selectedTopics.includes(topicId)) {
        setSelectedTopics((prev) => [...prev, topicId]);
      }
    }
  };

  // Select all topics for a whole course
  const handleSelectAllForCourse = (course: string) => {
    const courseTopics = availableTopics.filter((topic) => topic.course === course);
    const courseTopicIds = courseTopics.map((topic) => topic.id);
    const allTopicsSelected = courseTopicIds.every((id) => selectedTopics.includes(id));

    if (allTopicsSelected) {
      // Deselect all topics and subtopics for this course
      setSelectedTopics((prev) => prev.filter((id) => !courseTopicIds.includes(id)));
      const courseSubtopicIds = courseTopicIds.flatMap(
        (tId) => (subtopicsByTopic[tId] || []).map((st) => st.id)
      );
      setSelectedSubtopics((prev) => prev.filter((id) => !courseSubtopicIds.includes(id)));
    } else {
      // Select all topics
      setSelectedTopics((prev) => Array.from(new Set([...prev, ...courseTopicIds])));
      if (selectedMode === "quick test") {
        const courseSubtopicIds = courseTopicIds.flatMap(
          (tId) => (subtopicsByTopic[tId] || []).map((st) => st.id)
        );
        setSelectedSubtopics((prev) => Array.from(new Set([...prev, ...courseSubtopicIds])));
      }
    }
  };

  const toggleTopicAccordion = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const handleStartQuiz = () => {
    if (selectedTopics.length === 0) {
      toaster.create({
        title: "Topic Selection Required",
        description: "Please select at least one topic to generate your quiz.",
        type: "warning",
      });
      return;
    }

    if (selectedMode === "quick test" && selectedSubtopics.length === 0) {
      toaster.create({
        title: "Subtopic Selection Required",
        description: "In Quick Test mode, please select at least one subtopic to target your practice.",
        type: "warning",
      });
      return;
    }

    if (!selectedMode) {
      toaster.create({
        title: "Quiz Mode Required",
        description: "Please select either Quick Test or Examination mode to begin.",
        type: "warning",
      });
      return;
    }

    setShowInstructPage(true);
    setShowSideBar(false);
  };

  // Group available topics by course
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
          selectedSubtopics={selectedSubtopics}
          subtopicsByTopic={subtopicsByTopic}
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
                Loading topics and subtopics...
              </Text>
              <Progress.Root value={65} colorPalette="blue" size="sm">
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Text mt={2} fontSize="xs" color="gray.600">
                Fetching curriculum topics and subtopics for quiz generation
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
                disabled={
                  !selectedMode ||
                  selectedTopics.length === 0 ||
                  (selectedMode === "quick test" && selectedSubtopics.length === 0) ||
                  loadingAvailableTopics
                }
              >
                Continue <GoArrowRight />
              </Button>
            </Flex>
          </Box>

          {/* Mode Selection */}
          <Box mb={4} mt={4} bg="white" shadow="xl" rounded="md" p={4}>
            <Text fontSize="xs" fontWeight="700" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="wider">
              Step 1: Choose Assessment Mode
            </Text>
            <RadioGroup.Root
              value={selectedMode}
              onValueChange={(details) => handleRadioChange(details.value)}
              colorPalette="blue"
              size="sm"
            >
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align="stretch"
                gap={4}
              >
                {items.map((item) => {
                  const isSelected = selectedMode === item.value;
                  return (
                    <RadioGroup.Item key={item.value} value={item.value} asChild>
                      <label style={{ flex: 1, display: "flex" }}>
                        <RadioGroup.ItemHiddenInput />
                        <Flex
                          bg={isSelected ? "blue.50/80" : "textFieldColor"}
                          justify="space-between"
                          align="center"
                          gap={3}
                          p={3.5}
                          rounded="xl"
                          flex="1"
                          cursor="pointer"
                          border="2px solid"
                          borderColor={isSelected ? "blue.500" : "transparent"}
                          _hover={{ borderColor: "blue.300" }}
                          transition="all 0.2s"
                        >
                          <Image src={item.icon} height="35px" alt="icon" />
                          <Box flex="1">
                            <HStack gap={2} mb={0.5}>
                              <Heading fontSize="sm">{item.title}</Heading>
                              <Badge size="xs" colorPalette={item.value === "quick test" ? "purple" : "blue"} variant="subtle">
                                {item.badge}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">
                              {item.description}
                            </Text>
                          </Box>
                          <RadioGroup.ItemIndicator cursor="pointer" />
                        </Flex>
                      </label>
                    </RadioGroup.Item>
                  );
                })}
              </Flex>
            </RadioGroup.Root>
          </Box>

          {/* Header Bar */}
          <Flex
            justify="space-between"
            align="center"
            bg="white"
            rounded="md"
            shadow="lg"
            p={4}
            mb={2}
          >
            <HStack gap={2}>
              <LuArrowLeft
                style={{ cursor: "pointer", fontSize: "18px" }}
                onClick={() => setShowTopicList(false)}
              />
              <Box>
                <Heading size="sm">
                  {selectedMode === "quick test"
                    ? "Step 2: Select Topics & Subtopics"
                    : "Step 2: Select Topics for Examination"}
                </Heading>
                <Text fontSize="11px" color="gray.500">
                  {selectedMode === "quick test"
                    ? "Choose specific topics and their subtopics to focus your test practice."
                    : "Choose topics. In Exam Mode, questions are drawn broadly across all subtopics."}
                </Text>
              </Box>
            </HStack>
            <VStack align="end" gap={0.5}>
              <Badge colorPalette="blue" variant="surface" fontSize="11px" px={2} py={0.5}>
                {selectedTopics.length} topic(s) selected
              </Badge>
              {selectedMode === "quick test" && (
                <Badge colorPalette="purple" variant="surface" fontSize="11px" px={2} py={0.5}>
                  {selectedSubtopics.length} subtopic(s) selected
                </Badge>
              )}
            </VStack>
          </Flex>

          {/* Topics & Subtopics Selection Area */}
          <Box bg="white" rounded="md" shadow="lg" p={4} mb={4}>
            {loadingAvailableTopics ? (
              <Text color="gray.500" textAlign="center" py={8}>
                Loading available topics & subtopics...
              </Text>
            ) : Object.keys(topicsByCourse).length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No topics with available quizzes found for the selected courses.
              </Text>
            ) : (
              <VStack gap={6} align="stretch" mb={{ base: 24, lg: 0 }}>
                {Object.entries(topicsByCourse).map(([course, topics]) => {
                  const courseTopicIds = topics.map((t) => t.id);
                  const isAllCourseTopicsSelected = courseTopicIds.every((id) =>
                    selectedTopics.includes(id)
                  );

                  return (
                    <Box key={course} borderBottom="1px solid" borderColor="gray.100" pb={4}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <HStack gap={2}>
                          <Icon as={LuBookOpen} color="blue.600" />
                          <Heading size="sm" color="gray.800">
                            {course} Topics
                          </Heading>
                        </HStack>
                        <Button
                          size="xs"
                          fontSize="xs"
                          variant="subtle"
                          colorPalette="blue"
                          onClick={() => handleSelectAllForCourse(course)}
                        >
                          {isAllCourseTopicsSelected ? "Deselect All Topics" : "Select All Topics"}
                        </Button>
                      </Flex>

                      {/* Mode: QUICK TEST (Topic + Subtopic Selection) */}
                      {selectedMode === "quick test" ? (
                        <VStack gap={3} align="stretch">
                          {topics.map((topic) => {
                            const isTopicSelected = selectedTopics.includes(topic.id);
                            const topicSubtopics = subtopicsByTopic[topic.id] || [];
                            const isExpanded = expandedTopics[topic.id] ?? true;
                            const selectedCount = topicSubtopics.filter((st) =>
                              selectedSubtopics.includes(st.id)
                            ).length;
                            const isAllSubSelected =
                              topicSubtopics.length > 0 && selectedCount === topicSubtopics.length;

                            return (
                              <Box
                                key={topic.id}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={isTopicSelected ? "blue.300" : "gray.200"}
                                bg={isTopicSelected ? "blue.50/30" : "gray.50/40"}
                                overflow="hidden"
                                transition="all 0.2s"
                              >
                                {/* Topic Card Header */}
                                <Flex
                                  p={3}
                                  justify="space-between"
                                  align="center"
                                  bg={isTopicSelected ? "blue.50/70" : "white"}
                                  borderBottom={isExpanded && topicSubtopics.length > 0 ? "1px solid" : "none"}
                                  borderColor="gray.200"
                                >
                                  <HStack gap={3} flex={1}>
                                    <Checkbox.Root
                                      size="sm"
                                      colorPalette="blue"
                                      checked={isTopicSelected}
                                      onCheckedChange={() => handleTopicToggle(topic.id)}
                                    >
                                      <Checkbox.HiddenInput />
                                      <Checkbox.Control cursor="pointer" />
                                    </Checkbox.Root>
                                    <Box
                                      cursor="pointer"
                                      onClick={() => toggleTopicAccordion(topic.id)}
                                      flex={1}
                                    >
                                      <HStack gap={2}>
                                        <Text fontSize="sm" fontWeight="700" color="gray.800">
                                          {topic.name}
                                        </Text>
                                        <Badge
                                          size="xs"
                                          colorPalette={selectedCount > 0 ? "purple" : "gray"}
                                          variant="surface"
                                        >
                                          {selectedCount} of {topicSubtopics.length} subtopics
                                        </Badge>
                                      </HStack>
                                      {topic.description && (
                                        <Text fontSize="11px" color="gray.500" truncate>
                                          {topic.description}
                                        </Text>
                                      )}
                                    </Box>
                                  </HStack>

                                  <HStack gap={2}>
                                    {topicSubtopics.length > 1 && (
                                      <Button
                                        size="2xs"
                                        variant="ghost"
                                        fontSize="10px"
                                        color="blue.600"
                                        onClick={() => handleSelectAllSubtopicsForTopic(topic.id)}
                                      >
                                        {isAllSubSelected ? "Deselect Subtopics" : "Select All Subtopics"}
                                      </Button>
                                    )}
                                    <Button
                                      size="2xs"
                                      variant="ghost"
                                      onClick={() => toggleTopicAccordion(topic.id)}
                                      aria-label="Toggle subtopics accordion"
                                    >
                                      <Icon as={isExpanded ? LuChevronUp : LuChevronDown} />
                                    </Button>
                                  </HStack>
                                </Flex>

                                {/* Subtopics List under Topic */}
                                {isExpanded && topicSubtopics.length > 0 && (
                                  <Box p={3} bg="white">
                                    <HStack gap={1.5} mb={2}>
                                      <Icon as={LuLayers} boxSize={3.5} color="purple.500" />
                                      <Text fontSize="11px" fontWeight="600" color="gray.600">
                                        Choose subtopics to include in this test:
                                      </Text>
                                    </HStack>
                                    <Grid
                                      templateColumns={{
                                        base: "repeat(auto-fill, minmax(180px, 1fr))",
                                        md: "repeat(auto-fill, minmax(220px, 1fr))",
                                        lg: "repeat(auto-fill, minmax(260px, 1fr))",
                                      }}
                                      gap={2.5}
                                    >
                                      {topicSubtopics.map((subtopic) => {
                                        const isSubChecked = selectedSubtopics.includes(subtopic.id);
                                        return (
                                          <Checkbox.Root
                                            key={subtopic.id}
                                            size="sm"
                                            colorPalette="purple"
                                            checked={isSubChecked}
                                            onCheckedChange={() =>
                                              handleSubtopicToggle(subtopic.id, topic.id)
                                            }
                                          >
                                            <Box
                                              bg={isSubChecked ? "purple.50" : "gray.50"}
                                              p={2.5}
                                              borderRadius="lg"
                                              border="1px solid"
                                              borderColor={isSubChecked ? "purple.300" : "gray.200"}
                                              cursor="pointer"
                                              _hover={{ borderColor: "purple.300", bg: "purple.50/50" }}
                                              transition="all 0.15s"
                                            >
                                              <Flex justify="space-between" align="center" gap={2}>
                                                <Text fontSize="xs" fontWeight="500" color="gray.800">
                                                  {subtopic.name}
                                                </Text>
                                                <Checkbox.HiddenInput />
                                                <Checkbox.Control cursor="pointer" />
                                              </Flex>
                                            </Box>
                                          </Checkbox.Root>
                                        );
                                      })}
                                    </Grid>
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </VStack>
                      ) : (
                        /* Mode: EXAMINATION (Topic Only Selection) */
                        <Box>
                          <Box mb={3} p={2.5} bg="blue.50" borderRadius="lg">
                            <Text fontSize="xs" color="blue.800">
                              🎓 <strong>Exam Mode:</strong> Questions are drawn across the entire syllabus for selected topics.
                            </Text>
                          </Box>
                          <Grid
                            templateColumns={{
                              base: "repeat(auto-fill, minmax(160px, 1fr))",
                              md: "repeat(auto-fill, minmax(200px, 1fr))",
                              lg: "repeat(auto-fill, minmax(240px, 1fr))",
                            }}
                            gap={3}
                          >
                            {topics.map((topic) => {
                              const isTopicSelected = selectedTopics.includes(topic.id);
                              return (
                                <Checkbox.Root
                                  key={topic.id}
                                  size="sm"
                                  colorPalette="blue"
                                  checked={isTopicSelected}
                                  onCheckedChange={() => handleTopicToggle(topic.id)}
                                >
                                  <Box
                                    bg={isTopicSelected ? "blue.50" : "gray.50"}
                                    p={3.5}
                                    borderRadius="xl"
                                    border="1.5px solid"
                                    borderColor={isTopicSelected ? "blue.400" : "gray.200"}
                                    cursor="pointer"
                                    _hover={{ borderColor: "blue.400" }}
                                    transition="all 0.15s"
                                  >
                                    <Flex justify="space-between" align="center" gap={3}>
                                      <Box>
                                        <Text fontSize="xs" fontWeight="700" color="gray.800">
                                          {topic.name}
                                        </Text>
                                        <Text fontSize="10px" color="gray.500" mt={0.5}>
                                          Full topic exam coverage
                                        </Text>
                                      </Box>
                                      <Checkbox.HiddenInput />
                                      <Checkbox.Control cursor="pointer" />
                                    </Flex>
                                  </Box>
                                </Checkbox.Root>
                              );
                            })}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default QuizTopicsList;
