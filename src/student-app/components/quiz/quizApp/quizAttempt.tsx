import { useCallback, useEffect, memo } from "react";
import { Box, Alert, Text, Button, Dialog, VStack } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { QuizAttemptProps } from "./types";
import { QuizHeader } from "./quizHeader";
import { SubjectNavigation } from "./subjectNavigation";
import { QuestionComponent } from "./questionComponent";
import { QuizNavigation } from "./quizNavigation";
import { ResultsPage } from "./resultsPage";
// import { LoadingState } from "./loadingState";
// import { ErrorState } from "./errorState";
// import { NoQuizAvailable } from "./noQuizAvialable";
import { MonitoringView } from "./monitoringView";
import { useQuizAttempt } from "./useQuizAttempt";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useCheatingMonitor } from "@/hooks/useCheatingMonitor";
import { useTabSwitchDetection } from "@/hooks/useTabSwitchDetection";
import { useAudioMonitoring } from "@/hooks/useAudioMonitoring";
import { useScreenshotDetection } from "@/hooks/useScreenshotDetection";
import { useScreenRecordingDetection } from "@/hooks/useScreenRecordingDetection";

const MemoizedMonitoring = memo(
  ({
    hasWebcamAccess,
    hasScreenAccess,
    hasAudioAccess,
    showMonitoring,
    setWebcamNode,
    setScreenNode,
    toggleMonitoring,
    handleManualPlay,
    // reportInfraction,
  }: any) => {
    return (
      <>
        {!hasWebcamAccess && (
          <Alert.Root status="warning" size="sm" mb={2}>
            <Alert.Indicator />
            <Alert.Description fontSize="xs">
              Webcam disconnected. Please refresh the page and grant access
              again.
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
            <MonitoringView
              hasWebcamAccess={hasWebcamAccess}
              hasScreenAccess={hasScreenAccess}
              hasAudioAccess={hasAudioAccess}
              showMonitoring={showMonitoring}
              setWebcamNode={setWebcamNode}
              setScreenNode={setScreenNode}
              toggleMonitoring={toggleMonitoring}
              handleManualPlay={handleManualPlay}
            />

            {/*<Button
            mt={2}
            size="sm"
            onClick={() => reportInfraction("tab_switch")}
          >
            Test Infraction
          </Button>*/}
          </>
        )}
      </>
    );
  },
);

const QuizAttempt = ({
  quizData,
  onComplete,
  onCancel,
  setShowSideBar,
  setShowNavBar,
}: QuizAttemptProps) => {
  // device detection logic
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  const {
    currentSubjectIndex,
    currentQuestionIndex,
    answers,
    subjectTimeLeft,
    isSubmitting,
    // error,
    completedSubjects,
    // isLoading,
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
    // hasQuizzesForCurrentSubject,
  } = useQuizAttempt(quizData);

  const { authdStudent } = useAuthdStudentData();
  const {
    videoRef,
    setScreenNode,
    setWebcamNode,
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
  
  // indicate monitoring should be inactive
  const isMonitoringDisabled = showResults || isSubmitting;
  
  const { cheatingScore, reportInfraction } =
    useCheatingMonitor(handleSubmitAll, isMonitoringDisabled);
  
  // Monitoring hooks
  useAudioMonitoring(reportInfraction, audioStream, isMonitoringDisabled);
  useTabSwitchDetection(reportInfraction, isMonitoringDisabled);
  useScreenshotDetection(reportInfraction, isMonitoringDisabled);
  useScreenRecordingDetection(reportInfraction,isMonitoringDisabled);

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
    if (showResults){
      stopAllMonitoring();
    } 
  }, [showResults, stopAllMonitoring]);
  
  const createAttemptRecord = useCallback(
    async (subjectId: string): Promise<string | null> => {
      try {
        const quiz = quizData.quizzes.find((q) => q.subject_id === subjectId);
        if (!quiz) return null;
  
        // 1. Define the time range for the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  
        // 2. Check if an attempt already exists for this student + subject this month
        const { data: existingAttempt, error: fetchError } = await supabase
          .from("attempts")
          .select("id")
          .eq("student_id", authdStudent?.id)
          .eq("subject_id", subjectId)
          .gte("started_at", startOfMonth)
          .lte("started_at", endOfMonth)
          .maybeSingle();
  
        if (fetchError) throw fetchError;
  
        const attemptData = {
          student_id: authdStudent?.id,
          subject_id: subjectId,
          quiz_id: quiz.id,
          mode: quizData.mode,
          status: "in_progress",
          total_questions: quizData.questions.filter((q) => q.subject_id === subjectId).length,
          webcam_monitoring: hasWebcamAccess,
          screen_sharing: hasScreenAccess,
          audio_monitoring: hasAudioAccess,
          // If we are updating, we might want to keep the original started_at 
          // but update the "last_active" if you have that column
          started_at: existingAttempt ? undefined : new Date().toISOString(),
        };
  
        if (existingAttempt) {
          // 3. UPDATE existing record
          const { error: updateError } = await supabase
            .from("attempts")
            .update(attemptData)
            .eq("id", existingAttempt.id);
  
          if (updateError) throw updateError;
          return existingAttempt.id;
        } else {
          // 4. INSERT new record
          const { data: newAttempt, error: insertError } = await supabase
            .from("attempts")
            .insert(attemptData)
            .select()
            .single();
  
          if (insertError) throw insertError;
          return newAttempt.id;
        }
      } catch (err) {
        console.error("Error in createAttemptRecord:", err);
        return null;
      }
    },
    [
      authdStudent?.id,
      hasWebcamAccess,
      hasScreenAccess,
      hasAudioAccess,
      quizData.mode,
      quizData.questions,
      quizData.quizzes,
    ]
  );

  useEffect(() => {
    if (hasWebcamAccess && hasScreenAccess) {
      const createAttemptRecords = async () => {
        try {
          setIsLoading(true);
          const newAttemptIds: Record<string, string> = {};
      
          // 1. Filter only subjects that have quizzes
          const subjectsWithQuizzes = quizData.subjects.filter((subject) =>
            quizData.quizzes.some((quiz) => quiz.subject_id === subject.id)
          );
      
          // 2. Run all database checks/creations at the SAME time
          const results = await Promise.all(
            subjectsWithQuizzes.map(async (subject) => ({
              id: subject.id,
              attemptId: await createAttemptRecord(subject.id),
            }))
          );
      
          // 3. Map the results back to your state object
          results.forEach(({ id, attemptId }) => {
            if (attemptId) {
              newAttemptIds[id] = attemptId;
            }
          });
      
          setAttemptIds(newAttemptIds);
        } catch (error) {
          setError("Failed to initialize quiz. Please try again.");
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
    quizData.quizzes,
    quizData.subjects,
    setAttemptIds,
    setError,
    setIsLoading,
  ]);

  // Manual Play function
  const handleManualPlay = useCallback(() => {
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
  }, [videoRef, screenVideoRef]);

  useEffect(() => {
      if (isSubjectCompleted) {
        toaster.create({
          description: `You have completed all questions for ${currentSubject.displayName}. You can now select another subject or submit all answers.`,
          type: "success",
          closable: true,
        });
      }
    }, [isSubjectCompleted, currentSubject.displayName])                                
  
  
  // ---------- Render ----------
  // handle mobile block render
  if (isMobile) {
    return (
      <Box
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        p={6}
      >
        <VStack
          maxW="md"
          p={8}
          bg="white"
          borderRadius="xl"
          boxShadow="lg"
          textAlign="center"
          gap={6}
        >
          <Box fontSize="5xl">🚫</Box>
          <VStack gap={2}>
            <Text fontSize="xl" fontWeight="bold">
              Mobile Access Restricted
            </Text>
            <Text color="gray.600">
              For security and monitoring purposes, this quiz can only be taken
              on a<b> Desktop or Laptop computer</b>
            </Text>
          </VStack>
          <Alert.Root status="info" size="sm">
            <Alert.Indicator />
            <Alert.Description>
              Screen sharing and advanced proctoring features are not supported
              on mobile browsers. To access quiz on your mobile device
              <br /> <br />
              <b> Download mobile app </b>
            </Alert.Description>
          </Alert.Root>
          <Button width="full" bg="primaryColor" onClick={onCancel}>
            Return to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }
  if (showResults && quizResults) {
    return (
      <ResultsPage
        quizResults={quizResults}
        quizData={quizData}
        onComplete={onComplete}
        onCancel={onCancel}
        setShowSideBar={setShowSideBar}
        setShowNavBar={setShowNavBar}
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
                  To ensure academic integrity, this quiz requires webcam,
                  microphone, and screen sharing access.
                </Text>

                <Alert.Root status="info" size="sm">
                  <Alert.Indicator />
                  <Alert.Description>
                    Please ensure to share your entire screen
                  </Alert.Description>
                </Alert.Root>

                {(webcamError || screenError || audioError) && (
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

  return (
    <Box w={{ lg: "100%" }} m="auto">
      <MemoizedMonitoring
        hasWebcamAccess={hasWebcamAccess}
        hasScreenAccess={hasScreenAccess}
        hasAudioAccess={hasAudioAccess}
        showMonitoring={showMonitoring}
        setWebcamNode={setWebcamNode}
        setScreenNode={setScreenNode}
        toggleMonitoring={toggleMonitoring}
        handleManualPlay={handleManualPlay}
        cheatingScore={cheatingScore}
        reportInfraction={reportInfraction}
      />

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
          isSubmitting || // prevents user interaction during DB sync
          (subjectTimeLeft[currentSubjectIndex] !== undefined &&
            subjectTimeLeft[currentSubjectIndex] <= 0)
        }
        cheatingScore={cheatingScore}
        // hasWebcamAccess={hasWebcamAccess}
        // hasScreenAccess={hasScreenAccess}
        // hasAudioAccess={hasAudioAccess}
      />

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
