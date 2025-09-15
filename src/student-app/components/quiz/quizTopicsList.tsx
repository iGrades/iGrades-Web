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
} from "@chakra-ui/react";
import { useState } from "react";
import { GoArrowRight } from "react-icons/go";
import { LuArrowLeft } from "react-icons/lu";
import { useStudentData } from "@/student-app/context/dataContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import quickTestIcon from "@/assets/quickTest_ico.png";
import examTestIcon from "@/assets/examText_ico.png";
import QuizInstructions from "./quizInstructions";


type Props = {
  topicList: Topic[];
  selectedCourses: SelectedCourse[];
  setShowTopicList: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTopicsId: string;
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
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
}

const QuizTopicsList = ({
  topicList,
  setShowTopicList,
  selectedCourses,
  selectedTopicsId,
  setShowSideBar
}: Props) => {
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showInstructPage, setShowInstructPage] = useState(false);

  // Use the context hook to get subjectImages
  const { subjectImages } = useStudentData();

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

  const handleRadioChange = (value: string | null) => {
    if (value) {
      // Only set if value is not null
      setSelectedMode(value);
      console.log("Selected mode:", value);
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  const handleSelectAll = (course: string) => {
    const courseTopicIds = topicList
      .filter((topic) => topic.course === course)
      .map((topic) => topic.id);

    setSelectedTopics((prev) => {
      // If all topics for this course are already selected, deselect all
      const allSelected = courseTopicIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !courseTopicIds.includes(id));
      } else {
        // Add all course topics that aren't already selected
        const newTopics = courseTopicIds.filter((id) => !prev.includes(id));
        return [...prev, ...newTopics];
      }
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
    console.log("Starting quiz with:", {
      mode: selectedMode,
      topics: selectedTopics,
      selectedTopicsCount: selectedTopics.length,
    });
    setShowInstructPage(true);
    setShowSideBar(false)
  };

  // Group topics by course
  const topicsByCourse = topicList.reduce((acc, topic) => {
    if (!acc[topic.course]) {
      acc[topic.course] = [];
    }
    acc[topic.course].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

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
          topicsByCourse={topicsByCourse}
          subjectImages={subjectImages}
          onBack={() => setShowInstructPage(false)}
        />
      ) : (
        <>
          {(selectedMode || selectedTopics.length > 0) && (
            <Box p={4} borderRadius="md">
              <Flex justify="space-between" align="center">
                <Box width="50%">
                  <Slider {...settings}>
                    {selectedCourses.map((course, index) => {
                      // Get the image for this course from the context
                      const courseImage = subjectImages[course.dbName];

                      return (
                        <Box key={index} textAlign="center">
                          {courseImage ? (
                            <Image
                              src={courseImage}
                              alt={course.displayName}
                            />
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
                  w="60"
                  p={6}
                  rounded="3xl"
                  fontWeight="500"
                  onClick={handleStartQuiz}
                  disabled={!selectedMode || selectedTopics.length === 0}
                >
                  Continue <GoArrowRight />
                </Button>
              </Flex>
            </Box>
          )}

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
                        borderColor={
                          selectedMode === item.value
                            ? "blue.300"
                            : "transparent"
                        }
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
              <Heading size="sm"> Select Topics for Quiz</Heading>
            </HStack>
            <Text color="gray.600" fontSize="xs">
              {selectedTopics.length} topic(s) selected
            </Text>
          </Flex>

          <Box>
            {Object.keys(topicsByCourse).length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No topics available for the selected courses.
              </Text>
            ) : (
              <VStack gap={2} align="stretch">
                {Object.entries(topicsByCourse).map(([course, topics]) => (
                  <Box key={course} bg="white" rounded="lg" shadow="lg" p={4}>
                    <Flex justify="space-between" align="center" mb={5}>
                      <Heading size="sm">{course} Topics</Heading>
                      <Button
                        size="sm"
                        fontSize="xs"
                        variant="ghost"
                        onClick={() => handleSelectAll(course)}
                      >
                        {topics.every((topic) =>
                          selectedTopics.includes(topic.id)
                        )
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
                            bg={
                              selectedTopics.includes(topic.id)
                                ? "blue.50"
                                : "gray.50"
                            }
                            p={3}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={
                              selectedTopics.includes(topic.id)
                                ? "blue.300"
                                : "textFieldColor"
                            }
                            minW={{ base: "175px", md: "225px", lg: "250px" }}
                            cursor="pointer"
                          >
                            <Flex
                              justify="space-between"
                              align="center"
                              gap={3}
                            >
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

