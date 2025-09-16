import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  RadioGroup,
  VStack,
  Progress,
  Badge,
  Alert,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stack,
  Icon,
  Image,
  HStack,
} from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useStudentData } from "@/student-app/context/dataContext";
import { RiErrorWarningFill } from "react-icons/ri";
import { FaCircleCheck } from "react-icons/fa6";
import { GoArrowRight } from "react-icons/go";
import { GoArrowLeft } from "react-icons/go";
import timerImage from "@/assets/timer.png";

type Props = {
  quizData: {
    mode: string;
    subjects: { id: string; displayName: string; dbName: string }[];
    topics: string[];
    quizzes: any[];
    questions: any[];
    timePerSubject: number;
    totalTime: number;
  };
  onComplete: (results: any) => void;
  onCancel: () => void;
};

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  subject_id: string;
  topic_id: string;
  quiz_id: string;
}


interface SubjectResult {
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}

interface QuizResults {
  subjectResults: Record<string, SubjectResult>;
  overallPassed: boolean;
  timestamp: string;
  attemptIds: Record<string, string>;
}

const QuizAttempt = ({ quizData, onComplete, onCancel }: Props) => {
  const { authdStudent } = useAuthdStudentData();
  const { subjectImages } = useStudentData();
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [subjectTimeLeft, setSubjectTimeLeft] = useState<
    Record<number, number>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSubjects, setCompletedSubjects] = useState<Set<number>>(
    new Set()
  );
  const [attemptIds, setAttemptIds] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  // Create attempt records when component mounts
  useEffect(() => {
    const createAttemptRecords = async () => {
      try {
        setIsLoading(true);
        const newAttemptIds: Record<string, string> = {};

        for (const subject of quizData.subjects) {
          const hasQuizzes = quizData.quizzes.some(
            (quiz) => quiz.subject_id === subject.id
          );

          if (hasQuizzes) {
            const attemptId = await createAttemptRecord(subject.id);
            if (attemptId) {
              newAttemptIds[subject.id] = attemptId;
            }
          }
        }

        setAttemptIds(newAttemptIds);
      } catch (error) {
        console.error("Error creating attempt records:", error);
        setError("Failed to initialize quiz. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createAttemptRecords();
  }, [quizData.subjects, quizData.quizzes]);

  // Initialize timers for each subject
  useEffect(() => {
    const initialTimers: Record<number, number> = {};
    quizData.subjects.forEach((_, index) => {
      initialTimers[index] = quizData.timePerSubject * 60;
    });
    setSubjectTimeLeft(initialTimers);
  }, [quizData.subjects, quizData.timePerSubject]);

  // Function to create attempt record
  const createAttemptRecord = async (
    subjectId: string
  ): Promise<string | null> => {
    try {
      const quiz = quizData.quizzes.find((q) => q.subject_id === subjectId);

      if (!quiz) {
        console.error("No quiz found for subject:", subjectId);
        return null;
      }

      const { data, error } = await supabase
        .from("attempts")
        .insert({
          student_id: authdStudent?.id,
          subject_id: subjectId,
          quiz_id: quiz.id,
          mode: quizData.mode,
          started_at: new Date().toISOString(),
          status: "in_progress",
          total_questions: quizData.questions.filter(
            (q) => q.subject_id === subjectId
          ).length,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating attempt record:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error in createAttemptRecord:", error);
      return null;
    }
  };

  const currentSubject = quizData.subjects[currentSubjectIndex];
  const currentSubjectQuestions = quizData.questions.filter(
    (q: Question) => q.subject_id === currentSubject.id
  );
  const currentQuestion = currentSubjectQuestions[currentQuestionIndex];
  const isLastQuestionInSubject =
    currentQuestionIndex === currentSubjectQuestions.length - 1;
  const isSubjectCompleted = completedSubjects.has(currentSubjectIndex);

  // Check if current subject has any quizzes
  const hasQuizzesForCurrentSubject = quizData.quizzes.some(
    (quiz) => quiz.subject_id === currentSubject.id
  );

  // Timer for current subject only
  useEffect(() => {
    if (
      isSubjectCompleted ||
      !subjectTimeLeft[currentSubjectIndex] ||
      !hasQuizzesForCurrentSubject
    )
      return;

    const timer = setInterval(() => {
      setSubjectTimeLeft((prev) => ({
        ...prev,
        [currentSubjectIndex]: Math.max(0, prev[currentSubjectIndex] - 1),
      }));

      if (subjectTimeLeft[currentSubjectIndex] <= 1) {
        handleAutoSubmitSubject();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentSubjectIndex,
    subjectTimeLeft,
    isSubjectCompleted,
    hasQuizzesForCurrentSubject,
  ]);

  // Validation for selected_option to ensure it's A, B, C, or D
  const handleAnswerSelect = (questionId: string, answer: string) => {
    const validAnswers = ["A", "B", "C", "D"];
    if (validAnswers.includes(answer.toUpperCase())) {
      setAnswers((prev) => ({ ...prev, [questionId]: answer.toUpperCase() }));
    } else {
      console.error("Invalid answer selected:", answer);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSubjectQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCompletedSubjects((prev) => new Set(prev).add(currentSubjectIndex));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubjectChange = (subjectIndex: number) => {
    if (
      !completedSubjects.has(currentSubjectIndex) &&
      currentSubjectIndex !== subjectIndex
    ) {
      setError(
        "Please complete all questions in the current subject before switching."
      );
      return;
    }

    setError(null);
    setCurrentSubjectIndex(subjectIndex);
    setCurrentQuestionIndex(0);
  };

  const handleAutoSubmitSubject = async () => {
    if (isSubjectCompleted) return;

    setCompletedSubjects((prev) => new Set(prev).add(currentSubjectIndex));
    await saveAnswersForCurrentSubject();
  };

  const saveAnswersForCurrentSubject = async () => {
    try {
      const attemptId = attemptIds[currentSubject.id];

      if (!attemptId) {
        console.error("No attempt ID found for subject:", currentSubject.id);
        return;
      }

      const currentSubjectAnswers = Object.entries(answers)
        .filter(([questionId]) => {
          const question = quizData.questions.find((q) => q.id === questionId);
          return question && question.subject_id === currentSubject.id;
        })
        .map(([questionId, selected_option]) => ({
          attempt_id: attemptId,
          question_id: questionId,
          selected_option,
          student_id: authdStudent?.id,
          subject_id: currentSubject.id,
          created_at: new Date().toISOString(),
        }));

      if (currentSubjectAnswers.length > 0) {
        const { error: saveError } = await supabase
          .from("attempt_answers")
          .insert(currentSubjectAnswers);

        if (saveError) {
          console.error("Error saving answers:", saveError);
        }
      }
    } catch (error) {
      console.error("Error in saveAnswersForCurrentSubject:", error);
    }
  };

  // Function to update attempt status
  const updateAttemptStatus = async (
    attemptId: string,
    status: string,
    score?: number
  ) => {
    try {
      const updateData: any = {
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      };

      if (score !== undefined) {
        updateData.score = score;
      }

      const { error } = await supabase
        .from("attempts")
        .update(updateData)
        .eq("id", attemptId);

      if (error) {
        console.error("Error updating attempt status:", error);
      }
    } catch (error) {
      console.error("Error in updateAttemptStatus:", error);
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);

    try {
      // Save all answers
      const allAnswers = Object.entries(answers)
        .map(([questionId, selected_option]) => {
          const question = quizData.questions.find((q) => q.id === questionId);
          return {
            attempt_id: attemptIds[question?.subject_id || ""],
            question_id: questionId,
            selected_option,
            student_id: authdStudent?.id,
            subject_id: question?.subject_id,
            created_at: new Date().toISOString(),
          };
        })
        .filter((answer) => answer.attempt_id);

      if (allAnswers.length > 0) {
        const { error: saveError } = await supabase
          .from("attempt_answers")
          .insert(allAnswers);

        if (saveError) {
          console.error("Error saving all answers:", saveError);
        }
      }

      // Calculate results
      const results = await calculateResults();
      setQuizResults(results);

      // Update all attempt statuses to completed with scores
      for (const [subjectId, result] of Object.entries(
        results.subjectResults
      )) {
        const attemptId = attemptIds[subjectId];
        if (attemptId) {
          await updateAttemptStatus(attemptId, "completed", result.percentage);
        }
      }

      setShowResults(true);
    } catch (error) {
      console.error("Error in handleSubmitAll:", error);
      setIsSubmitting(false);
    }
  };

  const calculateResults = async (): Promise<QuizResults> => {
    const subjectResults: Record<string, SubjectResult> = {};

    quizData.subjects.forEach((subject) => {
      const subjectQuestions = quizData.questions.filter(
        (q) => q.subject_id === subject.id
      );
      const subjectAnswers = Object.entries(answers).filter(([questionId]) =>
        subjectQuestions.some((q) => q.id === questionId)
      );

      let correctAnswers = 0;
      subjectAnswers.forEach(([questionId, userAnswer]) => {
        const question = subjectQuestions.find((q) => q.id === questionId);
        if (question && userAnswer === question.correct_option) {
          correctAnswers++;
        }
      });

      const totalQuestions = subjectQuestions.length;
      const percentage =
        totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const passed = percentage >= 55;

      subjectResults[subject.id] = {
        correct: correctAnswers,
        total: totalQuestions,
        percentage: Math.round(percentage),
        passed,
      };
    });

    const overallPassed = Object.values(subjectResults).every(
      (result) => result.passed
    );

    return {
      subjectResults,
      overallPassed,
      timestamp: new Date().toISOString(),
      attemptIds,
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSubjectImage = subjectImages[currentSubject?.dbName] || null;

  // Results Page Component
  const ResultsPage = () => {
    if (!quizResults) return null;

    return (
      <Box p={6} bg="white" borderRadius="lg" minH="75vh">
        <Heading size="xl" textAlign="center" mb={8} color="blue.600">
          Quiz Results
        </Heading>

        {/* Overall Result */}
        <Card.Root
          bg={quizResults.overallPassed ? "green.50" : "red.50"}
          mb={8}
        >
          <CardBody>
            <Flex align="center" justify="center" gap={4}>
              <Icon
                boxSize={8}
                color={quizResults.overallPassed ? "green.500" : "red.500"}
              >
                {quizResults.overallPassed ? (
                  <FaCircleCheck />
                ) : (
                  <RiErrorWarningFill />
                )}
              </Icon>
              <Box textAlign="center">
                <Heading size="lg">
                  {quizResults.overallPassed ? "Congratulations!" : "Try Again"}
                </Heading>
                <Text fontSize="lg">
                  You {quizResults.overallPassed ? "passed" : "did not pass"}{" "}
                  the quiz
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Completed on{" "}
                  {new Date(quizResults.timestamp).toLocaleDateString()}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card.Root>

        {/* Subject-wise Results */}
        <Heading size="lg" mb={6} color="gray.700">
          Subject-wise Performance
        </Heading>

        <Grid
          templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
          gap={6}
          mb={8}
        >
          {quizData.subjects.map((subject) => {
            const result = quizResults.subjectResults[subject.id];
            if (!result) return null;

            const isPassed = result.passed;
            const colorScheme = isPassed ? "green" : "red";

            return (
              <GridItem key={subject.id}>
                <Card.Root
                  variant="outline"
                  borderColor={isPassed ? "green.200" : "red.200"}
                >
                  <Card.Body>
                    <Stack gap={3}>
                      <Flex align="center" justify="space-between">
                        <Heading size="md">{subject.displayName}</Heading>
                        <Icon
                          color={isPassed ? "green.500" : "red.500"}
                          boxSize={5}
                        >
                          {isPassed ? (
                            <FaCircleCheck />
                          ) : (
                            <RiErrorWarningFill />
                          )}
                        </Icon>
                      </Flex>

                      <Progress.Root
                        value={result.percentage}
                        size="lg"
                        max={100}
                      >
                        <Progress.Track>
                          <Progress.Range
                            bg={isPassed ? "green.500" : "red.500"}
                          />
                        </Progress.Track>
                      </Progress.Root>

                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.600">
                          Score: {result.correct}/{result.total}
                        </Text>
                        <Badge colorScheme={colorScheme} fontSize="sm">
                          {result.percentage}%
                        </Badge>
                      </Flex>

                      <Text
                        fontSize="sm"
                        color={isPassed ? "green.600" : "red.600"}
                        fontWeight="bold"
                      >
                        {isPassed ? "PASSED" : "FAILED"} -{" "}
                        {isPassed ? "✓" : "✗"} Minimum 55% required
                      </Text>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              </GridItem>
            );
          })}
        </Grid>

        {/* Action Buttons */}
        <Flex justify="center" gap={4}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => onComplete(quizResults)}
          >
            Review Answers
          </Button>
          <Button variant="outline" size="lg" onClick={onCancel}>
            Back to Dashboard
          </Button>
        </Flex>
      </Box>
    );
  };

  if (showResults) {
    return <ResultsPage />;
  }

  if (isLoading) {
    return (
      <Box
        p={4}
        bg="white"
        borderRadius="lg"
        minH="75vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text>Initializing quiz...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="white" borderRadius="lg" minH="75vh">
        <Alert.Root status="error" mb={4}>
          {error}
        </Alert.Root>
        <Button onClick={() => setError(null)}>Continue</Button>
      </Box>
    );
  }

  // Check if current subject has quizzes
  if (!hasQuizzesForCurrentSubject) {
    return (
      <Box p={4} bg="white" borderRadius="lg" minH="75vh">
        {/* No Quiz Available Message */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={4}
          minH="60vh"
        >
          <Heading size="lg" color="gray.600">
            No Quiz Available
          </Heading>
          <Text fontSize="xl" textAlign="center">
            No quiz available for {currentSubject.displayName} currently.
          </Text>
          <Button colorScheme="blue" onClick={onCancel}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  if (!currentQuestion) {
    return (
      <Box
        p={4}
        bg="white"
        borderRadius="lg"
        minH="75vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text>Loading questions...</Text>
      </Box>
    );
  }

  return (
    <Box w="80%" m="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          {currentSubjectImage ? (
            <Image src={currentSubjectImage} alt={currentSubject.displayName} />
          ) : (
            <Box
              boxSize="50px"
              bg="gray.200"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="sm" fontWeight="bold" color="gray.600">
                {currentSubject.displayName.charAt(0)}
              </Text>
            </Box>
          )}
        </Flex>

        <Flex justify='space-between' gap={4} align="center" w='50%'>
          <Badge>
            <Image src={timerImage} alt="timer" height="25px" />
            <Heading
              color="on_backgroundColor"
              fontSize="2xl"
              fontWeight="semibold"
            >
              {formatTime(subjectTimeLeft[currentSubjectIndex] || 0)}
            </Heading>
          </Badge>
         
          <Badge colorScheme={isSubjectCompleted ? "green" : "blue"}>
            {isSubjectCompleted ? "Completed" : "In Progress"}
          </Badge>
          <Button
            bg="primaryColor"
            size="sm"
            w="48"
            p={6}
            rounded="3xl"
            fontWeight="500"
            onClick={handleSubmitAll}
            loading={isSubmitting}
          >
            Submit Quiz <GoArrowRight />
          </Button>
        </Flex>
      </Flex>

      <Box p={6} bg="white" borderRadius="lg" minH="75vh">
        <Heading my={2} fontSize="md">
          Question {currentQuestionIndex + 1} of{" "}
          {currentSubjectQuestions.length}
        </Heading>
        {/* Question Content */}
        <Flex
          justify="space-between"
          align="center"
          my={6}
          px={4}
          color="on_backgroundColor"
        >
          <Box>
            <Text fontSize="sm" my={10}>
              {currentQuestion.question_text}
            </Text>
          </Box>

          <Box w="50%">
            <Heading my={2} fontSize="md">
              Select only one answer
            </Heading>
            <RadioGroup.Root
              value={answers[currentQuestion.id] || ""}
              onValueChange={(details) =>
                handleAnswerSelect(
                  currentQuestion.id,
                  details.value ? details.value.toUpperCase() : ""
                )
              }
              size="sm"
              colorPalette='blue'
            >
              <VStack align="stretch" gap={6}>
                {["A", "B", "C", "D"].map((option) => (
                  <RadioGroup.Item
                    key={option}
                    value={option}
                    bg="textFieldColor"
                    p={4}
                    rounded="md"
                    cursor="pointer"
                  >
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl cursor="pointer" />
                    <RadioGroup.Label>
                      {/* {option}. */}
                      {
                        currentQuestion[
                          `option_${option.toLowerCase()}` as keyof Question
                        ]
                      }
                    </RadioGroup.Label>
                  </RadioGroup.Item>
                ))}
              </VStack>
            </RadioGroup.Root>
          </Box>
        </Flex>
      </Box>

      <Box mt={6}>
        {/* Navigation */}
        <Flex justify="space-between" align="center" mb={4}>
          {/* Question Numbers Pagination */}
          <HStack gap={2} wrap="wrap" justify="center">
            {currentSubjectQuestions.map((_, index) => {
              const isAnswered =
                answers[currentSubjectQuestions[index].id] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <Button
                  key={index}
                  size="sm"
                  bg={[
                    isAnswered ? "primaryColor" : "white",
                    isCurrent ? "white" : "primaryColor",
                  ]}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                  }}
                  minW="30px"
                  h="30px"
                  p={0}
                  border="1px solid"
                  borderColor="primaryColor"
                  borderRadius="md"
                  fontWeight={isCurrent ? "semibold" : "normal"}
                  color={isCurrent ? "primaryColor" : "white"}
                >
                  <Heading fontSize='xs'>{index + 1}</Heading>
                </Button>
              );
            })}
          </HStack>
          <Flex w="45%" justify="space-between">
            <Button
              variant="outline"
              border="1px solid"
              borderColor="primaryColor"
              rounded="3xl"
              w="45%"
              p={4}
              color="primaryColor"
              fontWeight={500}
              fontSize="sm"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <GoArrowLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              border="1px solid"
              borderColor="primaryColor"
              rounded="3xl"
              w="45%"
              p={4}
              color="primaryColor"
              fontWeight={500}
              fontSize="sm"
              onClick={handleNextQuestion}
              disabled={isSubjectCompleted}
            >
              {isLastQuestionInSubject ? "Completed" : "Next"} <GoArrowRight />
            </Button>
          </Flex>
        </Flex>

        {/* Completion Status */}
        {isSubjectCompleted && (
          <Alert.Root status="success" mt={4}>
            <Alert.Indicator />
            You have completed all questions for {currentSubject.displayName}.
            You can now select another subject or submit all answers.
          </Alert.Root>
        )}

        {/* Subject Navigation */}
        <Flex gap={2} mb={6} wrap="wrap">
          {quizData.subjects.map((subject, index) => {
            const hasQuizzes = quizData.quizzes.some(
              (quiz) => quiz.subject_id === subject.id
            );
            return (
              <Button
                key={subject.id}
                size="sm"
                bg={
                  currentSubjectIndex === index
                    ? "primaryColor"
                    : completedSubjects.has(index)
                    ? "green"
                    : "#1FBA79"
                }
                variant={currentSubjectIndex === index ? "solid" : "outline"}
                onClick={() => handleSubjectChange(index)}
                disabled={
                  (!completedSubjects.has(currentSubjectIndex) &&
                    currentSubjectIndex !== index) ||
                  !hasQuizzes
                }
                title={!hasQuizzes ? "No quiz available for this subject" : ""}
              >
                {subject.displayName}
                {completedSubjects.has(index) && " ✓"}
                {!hasQuizzes && " (No Quiz)"}
              </Button>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};

export default QuizAttempt;
