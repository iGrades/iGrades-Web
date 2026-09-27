import { useState } from "react";
import { Flex, Box, Button, Grid, Badge, Text, HStack } from "@chakra-ui/react";
import { GoArrowRight, GoX } from "react-icons/go";
import QuizSubjectsList from "../components/quiz/quizSubjectsList";
import QuizTopicsList from "../components/quiz/quizTopicsList";
import SearchBar from "../components/quiz/searchBar";
import { toaster } from "@/components/ui/toaster";
import { PiShootingStarDuotone } from "react-icons/pi";
import { useSubscriptionEntitlement } from "@/hooks/useSubscriptionEntitlement";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";

type Props = {
  showSideBar: boolean;
  showNavBar: boolean;
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
};

interface Topic {
  id: string;
  name: string;
  description?: string;
  course: string;
}

interface SubjectImage {
  [key: string]: string;
}

interface SelectedCourse {
  displayName: string;
  dbName: string;
  id: string;
}


const QuizPage = ({ setShowSideBar, setShowNavBar }: Props) => {
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [showTopicList, setShowTopicList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedForQuiz, setSelectedForQuiz] = useState<SelectedCourse[]>([]);
  const [selectedTopicsId, setSelectedTopicsId] = useState<string>("");
  const [subjectImages, setSubjectImages] = useState<SubjectImage>({});
  const [searchResult, setSearchResult] = useState<any[]>([]);

  // handles selection of courses
 const handleCourseSelect = (
  course: string,
  courseTopics?: Topic[],
  dbCourseName?: string
) => {
  setSelectedForQuiz((prev) => {
    const existingIndex = prev.findIndex((c) => c.displayName === course);

    if (existingIndex >= 0) {
      // Remove course and its topics
      setTopicList((prevTopics) =>
        prevTopics.filter((topic) => topic.course !== course)
      );
      return prev.filter((c) => c.displayName !== course);
    } else {
      // Add course and its topics
      const topicsWithCourse = (courseTopics ?? []).map((topic) => ({
        ...topic,
        course,
      }));
      setTopicList((prev) => [...prev, ...topicsWithCourse]);
      // Ensure id is provided; fallback to dbCourseName or course if not available
      return [
        ...prev,
        {
          displayName: course,
          dbName: dbCourseName ?? course,
          id: dbCourseName ?? course,
        },
      ];
    }
  });
};


  const handleRemoveCourse = (courseToRemove: string) => {
    setSelectedForQuiz((prev) =>
      prev.filter((course) => course.displayName !== courseToRemove)
    );

    // Also remove topics associated with this course
    setTopicList((prev) =>
      prev.filter((topic) => topic.course !== courseToRemove)
    );
  };

  const {
    effectivePlan,
    verifyQuizMode,
    verifyTimedQuiz,
    verifyJambSimulation,
    todayTimedQuizCount,
    maxDailyTimedQuizzes,
    modalState,
    promptUpgrade,
    closeUpgradeModal,
  } = useSubscriptionEntitlement();

  const handleStartQuiz = () => {
    if (selectedForQuiz.length < 1) {
      toaster.create({
        title: "Subject Selection Required",
        description: "Please select at least 1 course before continuing to quiz topics.",
        type: "warning",
      });
      return;
    }

    // 1. Verify timed quiz daily limit entitlement for Basic users
    const timedAccess = verifyTimedQuiz();
    if (!timedAccess.allowed) {
      promptUpgrade(
        "Daily Timed Quiz Limit",
        timedAccess.requiredPlan,
        timedAccess.reason || `You have completed your daily limit of ${maxDailyTimedQuizzes} timed practice quizzes on the Basic plan. Upgrade to Standard (₦15,000) for generous timed practice!`
      );
      return;
    }

    // 2. Verify multi-subject & JAMB 4-subject entitlement
    if (selectedForQuiz.length === 4) {
      const jambAccess = verifyJambSimulation(4);
      if (!jambAccess.allowed) {
        promptUpgrade(
          "JAMB 4-Subject Simulation",
          jambAccess.requiredPlan,
          jambAccess.reason || "JAMB UTME 4-Subject Mock Simulation requires a Standard or Premium subscription. Basic plan supports 1 subject at a time."
        );
        return;
      }
    } else if (selectedForQuiz.length > 1) {
      const access = verifyQuizMode("quick test", selectedForQuiz.length);
      if (!access.allowed) {
        promptUpgrade(
          "Multi-Subject Quiz Practice",
          access.requiredPlan,
          access.reason || "Multi-subject combined quiz testing requires a Standard or Premium subscription. Basic plan supports 1 subject at a time."
        );
        return;
      }
    }

    setShowTopicList(true);
  };

  const handleLaunchJambSimulation = () => {
    const jambAccess = verifyJambSimulation(4);
    if (!jambAccess.allowed) {
      promptUpgrade(
        "JAMB UTME 4-Subject Simulation",
        jambAccess.requiredPlan,
        jambAccess.reason || "JAMB UTME 4-Subject Mock Simulation is an examination-grade simulation available on Standard and Premium plans. Upgrade to Standard (₦15,000) to simulate real JAMB exams."
      );
      return;
    }

    toaster.create({
      title: "JAMB Simulation Mode Ready",
      description: "Select your 4 JAMB subject combination below to generate your official timed exam simulation.",
      type: "info",
    });
  };

  return (
    <>
      {showTopicList ? (
        <QuizTopicsList
          topicList={topicList}
          selectedCourses={selectedForQuiz}
          setSelectedCourses={setSelectedForQuiz}
          setShowTopicList={setShowTopicList}
          selectedTopicsId={selectedTopicsId}
          setShowSideBar={setShowSideBar}
          setShowNavBar={setShowNavBar}
        />
      ) : (
        <>
          {/* JAMB 4-Subject Simulation & Timed Practice Banner */}
          <Box
            mb={4}
            p={{ base: 4, md: 5 }}
            borderRadius="xl"
            bg="white"
            border="1px solid"
            borderColor="orange.200"
            boxShadow="sm"
          >
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              gap={3}
            >
              <Box>
                <HStack gap={2} mb={1}>
                  <Badge colorPalette="orange" variant="solid" size="xs" px={2} py={0.5} borderRadius="md">
                    JAMB UTME Mock
                  </Badge>
                  {effectivePlan === "basic" && (
                    <Badge colorPalette="gray" variant="surface" size="xs" px={2} py={0.5} borderRadius="md">
                      Standard / Premium Feature
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  JAMB 4-Subject Timed Simulation
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Simulate official JAMB UTME with 4 combined subjects under timed conditions.
                </Text>
              </Box>

              <Button
                size="sm"
                bg="#206CE1"
                color="white"
                _hover={{ bg: "#1852B2" }}
                borderRadius="lg"
                onClick={handleLaunchJambSimulation}
                fontSize="xs"
                fontWeight="bold"
                px={4}
              >
                {effectivePlan === "basic" ? (
                  <>
                    <PiShootingStarDuotone style={{ marginRight: "6px" }} />
                    Unlock Standard Plan
                  </>
                ) : (
                  "Start JAMB Simulation"
                )}
              </Button>
            </Flex>

            {/* Daily Timed Practice Status for Basic */}
            {effectivePlan === "basic" && (
              <Flex
                mt={3}
                pt={2.5}
                borderTop="1px dashed"
                borderColor="gray.200"
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
              >
                <Text fontSize="xs" color="gray.600">
                  <strong>Timed Practice Limit:</strong> {todayTimedQuizCount}/{maxDailyTimedQuizzes} used today.
                </Text>
                <Button
                  variant="ghost"
                  size="xs"
                  color="#206CE1"
                  _hover={{ color: "#1852B2", bg: "blue.50" }}
                  onClick={() =>
                    promptUpgrade(
                      "Unlimited Timed Practice",
                      "standard",
                      "Upgrade to Standard (₦15,000) for generous timed practice and unlimited exam simulations without daily caps!"
                    )
                  }
                >
                  <PiShootingStarDuotone style={{ marginRight: "4px" }} />
                  Unlock Standard Plan for Generous Timed Practice →
                </Button>
              </Flex>
            )}
          </Box>

          <Flex
            justify="space-between"
            align="center"
            mb={4}
            mt={2}
          >
            <Box w={{ base: "55%", md: "50%", lg: "80%" }}>
              <SearchBar placeholder="Search subject ..." searchResult={searchResult} setSearchResult={setSearchResult} />
            </Box>

            <Button
              bg="primaryColor"
              w={{ base: 36, md: 60 }}
              p={6}
              rounded={{ base: "lg", md: "3xl" }}
              fontWeight="500"
              onClick={handleStartQuiz}
              disabled={selectedForQuiz.length < 1}
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
                    {course.displayName}
                    <GoX
                      size={12}
                      cursor="pointer"
                      onClick={() => handleRemoveCourse(course.displayName)}
                    />
                  </Badge>
                ))}
              </Grid>
              {/* start quiz button */}
              {/* <Flex w="full" mt={5} justify="flex-end" align="center">
                <Button
                  bg="primaryColor"
                  w="47%"
                  p={6}
                  rounded="xl"
                  fontWeight="500"
                  onClick={handleStartQuiz}
                  disabled={selectedForQuiz.length < 1}
                  display={{ base: "flex", md: "none" }}
                  alignItems="center"
                  gap={6}
                >
                  Next <GoArrowRight />
                </Button>
              </Flex> */}
            </Box>
          )}

          <Box bg="white" rounded="lg" shadow="lg" p={4} mb={20} h="auto">
            <QuizSubjectsList
              onCourseSelect={handleCourseSelect}
              setSelectedCourse={setSelectedCourse}
              selectedCourses={selectedForQuiz.map((c) => c.displayName)}
              subjectImages={subjectImages}
              setSubjectImages={setSubjectImages}
              setSelectedTopicsId={setSelectedTopicsId}
            />
          </Box>

          <Text display="none">{selectedCourse}</Text>
        </>
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        isOpen={modalState.isOpen}
        onClose={closeUpgradeModal}
        featureName={modalState.featureName}
        requiredPlan={modalState.requiredPlan}
        reason={modalState.reason}
        currentPlan={effectivePlan}
      />
    </>
  );
};

export default QuizPage;
