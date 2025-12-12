import { useCallback, useEffect } from "react";
import {
  Box,
  Alert,
  Flex,
  Text,
  Button,
  Dialog,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { QuizAttemptProps } from "./types";
import { QuizHeader } from "./quizHeader";
import { SubjectNavigation } from "./subjectNavigation";
import { QuestionComponent } from "./questionComponent";
import { QuizNavigation } from "./quizNavigation";
import { ResultsPage } from "./resultsPage";
import { LoadingState } from "./loadingState";
import { ErrorState } from "./errorState";
import { NoQuizAvailable } from "./noQuizAvialable";
import { CheatingProgressBar } from "./CheatingProgressBar";
import { useQuizAttempt } from "./useQuizAttempt";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useCheatingMonitor } from "@/hooks/useCheatingMonitor";
import { useTabSwitchDetection } from "@/hooks/useTabSwitchDetection";
import { useAudioMonitoring } from "@/hooks/useAudioMonitoring";
import { useScreenshotDetection } from "@/hooks/useScreenshotDetection";
import { useScreenRecordingDetection } from "@/hooks/useScreenRecordingDetection";

const QuizAttempt = ({ quizData, onComplete, onCancel }: QuizAttemptProps) => {
  const {
    currentSubjectIndex,
    currentQuestionIndex,
    answers,
    subjectTimeLeft,
    isSubmitting,
    error,
    completedSubjects,
    isLoading,
    showResults,
    quizResults,
    setCurrentQuestionIndex,
    setError,
    setIsLoading,
    setAttemptIds,
    handleAnswerSelect,
    handleSubjectChange,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmitAll,
    handleAutoSubmitSubject,
    currentSubject,
    currentSubjectQuestions,
    isSubjectCompleted,
    hasQuizzesForCurrentSubject,
  } = useQuizAttempt(quizData);

  const { cheatingScore, reportInfraction } = useCheatingMonitor(handleSubmitAll);
  
  useTabSwitchDetection(reportInfraction);
  useScreenshotDetection(reportInfraction);
  useScreenRecordingDetection(reportInfraction);

  const { authdStudent } = useAuthdStudentData();

  // useMonitoring hook
  const {
    videoRef,
    screenVideoRef,
    hasWebcamAccess,
    hasScreenAccess,
    hasAudioAccess,
    audioStream,
    audioError,
    webcamError,
    screenError,
    isWebcamLoading,
    isScreenLoading,
    showMonitoring,
    showAccessDialog,
    handleStartMonitoring,
    stopAllMonitoring,
    toggleMonitoring,
  } = useMonitoring();
  
  // Pass report and stream
  useAudioMonitoring(reportInfraction, audioStream);

  // Auto-submit when time runs out
  useEffect(() => {
    const currentTimeLeft = subjectTimeLeft[currentSubjectIndex];
    if (
      currentTimeLeft !== undefined &&
      currentTimeLeft <= 0 &&
      !isSubjectCompleted
    ) {
      handleAutoSubmitSubject();
    }
  }, [
    subjectTimeLeft,
    currentSubjectIndex,
    isSubjectCompleted,
    handleAutoSubmitSubject,
  ]);

  // Stop monitoring when quiz is completed
  useEffect(() => {
    if (showResults) stopAllMonitoring();
  }, [showResults, stopAllMonitoring]);

  const createAttemptRecord = useCallback(
    async (subjectId: string): Promise<string | null> => {
      try {
        const quiz = quizData.quizzes.find((q) => q.subject_id === subjectId);
        if (!quiz) return null;

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
              (q) => q.subject_id === subjectId,
            ).length,
            webcam_monitoring: hasWebcamAccess,
            screen_sharing: hasScreenAccess,
            audio_monitoring: hasAudioAccess,
          })
          .select()
          .single();

        if (error) return null;
        return data.id;
      } catch {
        return null;
      }
    },
    [
      authdStudent?.id,
      hasWebcamAccess,
      hasScreenAccess,
      quizData.mode,
      quizData.questions,
      quizData.quizzes,
      hasAudioAccess,
    ],
  );

  // Create attempt records when BOTH permissions are granted
  useEffect(() => {
    if (hasWebcamAccess && hasScreenAccess) {
      const createAttemptRecords = async () => {
        try {
          setIsLoading(true);
          const newAttemptIds: Record<string, string> = {};

          for (const subject of quizData.subjects) {
            const hasQuizzes = quizData.quizzes.some(
              (quiz) => quiz.subject_id === subject.id,
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
          setError("Failed to initialize quiz. Please try again.", error);
        } finally {
          setIsLoading(false);
        }
      };

      createAttemptRecords();
    }
  }, [
    hasWebcamAccess,
    hasScreenAccess,
    createAttemptRecord,
    showResults,
    stopAllMonitoring,
    quizData.quizzes,
    quizData.subjects,
    quizData,
    setAttemptIds,
    setError,
    setIsLoading,
  ]);

  // Manual play function for testing
  const handleManualPlay = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current
        .play()
        .catch((err) => console.log("Manual webcam play failed:", err));
    }
    if (screenVideoRef.current && screenVideoRef.current.srcObject) {
      screenVideoRef.current
        .play()
        .catch((err) => console.log("Manual screen play failed:", err));
    }
  };

  // ---------- Render ----------
  if (showResults && quizResults) {
    return (
      <ResultsPage
        quizResults={quizResults}
        quizData={quizData}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );
  }

  if (showAccessDialog) {
    return (
      <Dialog.Root
        defaultOpen={true}
        onOpenChange={(open) => {
          if (!open && !(hasWebcamAccess && hasScreenAccess)) {
            onCancel();
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Quiz Monitoring Required</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={4}>
                <Text>
                  To ensure academic integrity, this quiz requires webcam, microphone, and screen sharing access.
                </Text>

                {(webcamError || screenError) && (
                  <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>Access Error</Alert.Title>
                    <Alert.Description>
                      {webcamError && `Webcam: ${webcamError}`}
                      {screenError && `Screen Share: ${screenError}`}
                      {audioError && `Audio: ${audioError}`}
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onCancel} mr={3}>
                Cancel Quiz
              </Button>
              <Button
                bg="primaryColor"
                onClick={handleStartMonitoring}
                loading={isWebcamLoading || isScreenLoading}
              >
                Grant Access & Start Quiz
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }

  // ---------- Monitoring Section ----------
  const MonitoringSection = () => (
    <Box
      mb={4}
      p={4}
      bg="gray.50"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex justify="space-between" align="center" mb={showMonitoring ? 3 : 0}>
        <HStack>
          <Text fontSize="sm" fontWeight="bold" color="gray.700">
            📹 Monitoring
          </Text>
          <HStack gap={4}>
            <Text
              fontSize="xs"
              color={hasWebcamAccess ? "green.500" : "red.500"}
            >
              Webcam: {hasWebcamAccess ? "✅" : "❌"}
            </Text>
            <Text
              fontSize="xs"
              color={hasScreenAccess ? "green.500" : "red.500"}
            >
              Screen: {hasScreenAccess ? "✅" : "❌"}
            </Text>
            <Text
              fontSize="xs"
              color={hasAudioAccess ? "green.500" : "red.500"}
            >
              Audio: {hasAudioAccess ? "✅" : "❌"}
            </Text>
          </HStack>
        </HStack>
        <HStack>
          <Button size="sm" variant="outline" onClick={toggleMonitoring}>
            {showMonitoring ? "Hide" : "Show"} Monitoring
          </Button>
          <Button size="sm" variant="ghost" onClick={handleManualPlay}>
            ▶️ Manual Play
          </Button>
        </HStack>
      </Flex>

      {!hasWebcamAccess && (
        <Alert.Root status="warning" size="sm" mb={2}>
          <Alert.Indicator />
          <Alert.Description fontSize="xs">
            Webcam disconnected. Please refresh the page and grant access again.
          </Alert.Description>
        </Alert.Root>
      )}

      {!hasScreenAccess && (
        <Alert.Root status="warning" size="sm" mb={2}>
          <Alert.Indicator />
          <Alert.Description fontSize="xs">
            Screen sharing stopped. Please refresh the page and grant access
            again.
          </Alert.Description>
        </Alert.Root>
      )}

      {showMonitoring && (hasWebcamAccess || hasScreenAccess) && (
        <>
          <Flex gap={4} direction={{ base: "column", md: "row" }}>
            {hasWebcamAccess && (
              <Box flex={1}>
                <Text fontSize="xs" fontWeight="medium" mb={1}>
                  Webcam
                </Text>
                <Box
                  position="relative"
                  bg="black"
                  borderRadius="md"
                  overflow="hidden"
                  height="240px"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            )}
            {hasScreenAccess && (
              <Box flex={2}>
                <Text fontSize="xs" fontWeight="medium" mb={1}>
                  Screen Share
                </Text>
                <Box
                  position="relative"
                  bg="black"
                  borderRadius="md"
                  overflow="hidden"
                  height="240px"
                >
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Flex>

          <CheatingProgressBar cheatingScore={cheatingScore} />

          <Button
            mt={2}
            size="sm"
            onClick={() => reportInfraction("tab_switch")}
          >
            Test Infraction
          </Button>
        </>
      )}
    </Box>
  );

  // ---------- Main Render ----------
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onContinue={() => setError(null)} />;
  }

  if (!hasQuizzesForCurrentSubject) {
    return <NoQuizAvailable subject={currentSubject} onCancel={onCancel} />;
  }

  if (!currentSubjectQuestions[currentQuestionIndex]) {
    return <LoadingState message="Loading questions..." />;
  }

  return (
    <Box w={{ lg: "80%" }} m="auto">
      <MonitoringSection />

      {/* Rest of your quiz UI */}
      {subjectTimeLeft[currentSubjectIndex] !== undefined &&
        subjectTimeLeft[currentSubjectIndex] <= 0 && (
          <Alert.Root status="warning" my={4}>
            <Alert.Indicator />
            <Alert.Title>Time Finished</Alert.Title>
            <Alert.Description>
              Time for {currentSubject.displayName} has ended. Your answers have
              been automatically submitted.
              {!isSubjectCompleted &&
                " You can no longer answer questions for this subject."}
            </Alert.Description>
          </Alert.Root>
        )}

      <QuizHeader
        currentSubject={currentSubject}
        timeLeft={subjectTimeLeft[currentSubjectIndex] || 0}
        isSubjectCompleted={isSubjectCompleted}
        onSubmit={handleSubmitAll}
        isSubmitting={isSubmitting}
        mode={quizData.mode}
        disableActions={
          subjectTimeLeft[currentSubjectIndex] !== undefined &&
          subjectTimeLeft[currentSubjectIndex] <= 0
        }
      />

      {isSubjectCompleted && (
        <Alert.Root status="success" my={4} fontSize="xs">
          <Alert.Indicator />
          You have completed all questions for {currentSubject.displayName}. You
          can now select another subject or submit all answers.
        </Alert.Root>
      )}

      <SubjectNavigation
        subjects={quizData.subjects}
        quizzes={quizData.quizzes}
        currentSubjectIndex={currentSubjectIndex}
        completedSubjects={completedSubjects}
        onSubjectChange={handleSubjectChange}
        disabledSubjects={quizData.subjects.map(
          (_, index) =>
            subjectTimeLeft[index] !== undefined && subjectTimeLeft[index] <= 0,
        )}
      />

      <QuestionComponent
        currentQuestion={currentSubjectQuestions[currentQuestionIndex]}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={currentSubjectQuestions.length}
        selectedAnswer={
          answers[currentSubjectQuestions[currentQuestionIndex]?.id] || ""
        }
        onAnswerSelect={handleAnswerSelect}
        disabled={
          subjectTimeLeft[currentSubjectIndex] !== undefined &&
          subjectTimeLeft[currentSubjectIndex] <= 0
        }
      />

      <QuizNavigation
        questions={currentSubjectQuestions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        isSubjectCompleted={isSubjectCompleted}
        onQuestionSelect={setCurrentQuestionIndex}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onAutoSubmit={handleAutoSubmitSubject}
        disabled={
          subjectTimeLeft[currentSubjectIndex] !== undefined &&
          subjectTimeLeft[currentSubjectIndex] <= 0
        }
      />
    </Box>
  );
};

export default QuizAttempt;
