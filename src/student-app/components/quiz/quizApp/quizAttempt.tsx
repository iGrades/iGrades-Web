import { useCallback, useEffect, memo, useRef } from "react";
import { Box, Alert, Text, Button, Dialog, VStack, HStack, Badge } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import type { QuizAttemptProps } from "./types";
import { QuizHeader } from "./quizHeader";
import { SubjectNavigation } from "./subjectNavigation";
import { QuestionComponent } from "./questionComponent";
import { QuizNavigation } from "./quizNavigation";
import { ResultsPage } from "./resultsPage";
import { MonitoringView } from "./monitoringView";
import { useQuizAttempt } from "./useQuizAttempt";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useCheatingMonitor } from "@/hooks/useCheatingMonitor";
import { useTabSwitchDetection } from "@/hooks/useTabSwitchDetection";
import { useAudioMonitoring } from "@/hooks/useAudioMonitoring";
import { useScreenshotDetection } from "@/hooks/useScreenshotDetection";
import { useScreenRecordingDetection } from "@/hooks/useScreenRecordingDetection";
import { useAIProctoring } from "@/hooks/useAIProctoring";
import { FiCamera, FiMic, FiMonitor, FiShield } from "react-icons/fi";


// ─── Memoized Monitoring View (unchanged) ─────────────────────────────────────

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
    bypassedScreenShare,
    initializeScreenShare,
    proctorStatus,
  }: any) => {
    return (
      <>
        {!hasWebcamAccess && (
          <Alert.Root status="warning" size="sm" mb={2}>
            <Alert.Indicator />
            <Alert.Description fontSize="xs">
              Webcam disconnected. Please ensure your camera is enabled.
            </Alert.Description>
          </Alert.Root>
        )}

        {!hasScreenAccess && !bypassedScreenShare && (
          <Alert.Root status="error" size="sm" mb={2}>
            <Alert.Indicator />
            <Alert.Title fontSize="xs">Screen Sharing Inactive</Alert.Title>
            <Alert.Description fontSize="xs">
              Entire screen sharing is required during the examination.
            </Alert.Description>
            {initializeScreenShare && (
              <Button
                size="xs"
                colorPalette="red"
                ml="auto"
                onClick={initializeScreenShare}
              >
                Re-share Screen
              </Button>
            )}
          </Alert.Root>
        )}

        {showMonitoring && (hasWebcamAccess || hasScreenAccess) && (
          <MonitoringView
            hasWebcamAccess={hasWebcamAccess}
            hasScreenAccess={hasScreenAccess}
            hasAudioAccess={hasAudioAccess}
            showMonitoring={showMonitoring}
            setWebcamNode={setWebcamNode}
            setScreenNode={setScreenNode}
            toggleMonitoring={toggleMonitoring}
            handleManualPlay={handleManualPlay}
            proctorStatus={proctorStatus}
          />
        )}
      </>
    );
  }
);

// ─── Main Component ───────────────────────────────────────────────────────────

const QuizAttempt = ({
  quizData,
  onComplete,
  onCancel,
  setShowSideBar,
  setShowNavBar,
}: QuizAttemptProps) => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const {
    currentSubjectIndex,
    currentQuestionIndex,
    answers,
    subjectTimeLeft,
    isSubmitting,
    completedSubjects,
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
  } = useQuizAttempt(quizData);

  const { authdStudent } = useAuthdStudentData();

  // Test mode has quiz monitoring functionality completely removed.
  const isTestMode =
    quizData.mode === "quick test" ||
    quizData.mode?.toLowerCase().includes("test");
  const isMonitoringEnabled = !isTestMode && quizData.mode === "examination";

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
    isAudioLoading,
    showMonitoring,
    showAccessDialog,
    bypassedScreenShare,
    handleStartMonitoring,
    initializeWebcam,
    initializeAudio,
    initializeScreenShare,
    stopAllMonitoring,
    toggleMonitoring,
    proceedWithWebcamOnly,
  } = useMonitoring({
    disabled: !isMonitoringEnabled,
    onScreenShareEnded: () => {
      reportInfraction(
        "screen_share_stopped",
        "Screen sharing was stopped! Entire screen must remain shared throughout the examination."
      );
    },
  });

  // Monitoring should be inactive when in test mode, or when quiz is completed/submitting
  const isMonitoringDisabled = !isMonitoringEnabled || showResults || isSubmitting;

  const { cheatingScore, reportInfraction } = useCheatingMonitor(
    handleSubmitAll,
    isMonitoringDisabled
  );

  // ── Existing monitoring hooks ────────────────────────────────────────────
  useAudioMonitoring(reportInfraction, audioStream, isMonitoringDisabled);
  useTabSwitchDetection(reportInfraction, isMonitoringDisabled);
  useScreenshotDetection(reportInfraction, isMonitoringDisabled);
  useScreenRecordingDetection(reportInfraction, isMonitoringDisabled);

  // ── AI-powered Vision & Head Pose Proctoring Hook ──────────────────────────
  // Monitors face orientation, head shifting/turning, looking down,
  // second person detection, and external objects (phones, books, secondary screens).
  const proctorStatus = useAIProctoring({
    videoRef,
    reportInfraction,
    disabled: isMonitoringDisabled || !hasWebcamAccess,
    intervalMs: 1500,
  });

  // ── Auto-submit when time runs out ───────────────────────────────────────
  useEffect(() => {
    const currentTimeLeft = subjectTimeLeft[currentSubjectIndex];
    if (
      currentTimeLeft !== undefined &&
      currentTimeLeft <= 0 &&
      !isSubjectCompleted
    ) {
      handleAutoSubmitSubject();
    }
  }, [subjectTimeLeft, currentSubjectIndex, isSubjectCompleted, handleAutoSubmitSubject]);

  // ── Stop monitoring when quiz completes ──────────────────────────────────
  useEffect(() => {
    if (showResults) {
      stopAllMonitoring();
    }
  }, [showResults, stopAllMonitoring]);

  // ── Create attempt records ───────────────────────────────────────────────
  const createAttemptRecord = useCallback(
    async (subjectId: string): Promise<string | null> => {
      try {
        const quiz = quizData.quizzes.find((q) => q.subject_id === subjectId);
        if (!quiz) return null;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data: existingAttempt, error: fetchError } = await supabase
          .from("attempts")
          .select("id")
          .eq("student_id", authdStudent?.id)
          .eq("subject_id", subjectId)
          .eq("status", "in_progress")
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
          webcam_monitoring: isMonitoringEnabled ? hasWebcamAccess : false,
          screen_sharing: isMonitoringEnabled ? hasScreenAccess : false,
          audio_monitoring: isMonitoringEnabled ? hasAudioAccess : false,
          started_at: existingAttempt ? undefined : new Date().toISOString(),
        };

        if (existingAttempt) {
          const { error: updateError } = await supabase
            .from("attempts")
            .update(attemptData)
            .eq("id", existingAttempt.id);
          if (updateError) throw updateError;
          return existingAttempt.id;
        } else {
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
      isMonitoringEnabled,
      hasWebcamAccess,
      hasScreenAccess,
      hasAudioAccess,
      quizData.mode,
      quizData.questions,
      quizData.quizzes,
    ]
  );

  const hasInitializedAttempts = useRef(false);

  useEffect(() => {
    // In test mode, initialize attempts immediately without monitoring requirements.
    // In examination mode, initialize once required media access is granted.
    const shouldInitialize =
      !isMonitoringEnabled ||
      (hasWebcamAccess && hasAudioAccess && (hasScreenAccess || bypassedScreenShare));

    if (shouldInitialize && !hasInitializedAttempts.current) {
      hasInitializedAttempts.current = true;
      const createAttemptRecords = async () => {
        try {
          setIsLoading(true);
          const newAttemptIds: Record<string, string> = {};
          const subjectsWithQuizzes = quizData.subjects.filter((subject) =>
            quizData.quizzes.some((quiz) => quiz.subject_id === subject.id)
          );
          const results = await Promise.all(
            subjectsWithQuizzes.map(async (subject) => ({
              id: subject.id,
              attemptId: await createAttemptRecord(subject.id),
            }))
          );
          results.forEach(({ id, attemptId }) => {
            if (attemptId) newAttemptIds[id] = attemptId;
          });
          setAttemptIds(newAttemptIds);
        } catch {
          setError("Failed to initialize quiz. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      createAttemptRecords();
    }
  }, [
    isMonitoringEnabled,
    hasWebcamAccess,
    hasAudioAccess,
    hasScreenAccess,
    bypassedScreenShare,
    createAttemptRecord,
    quizData.quizzes,
    quizData.subjects,
    setAttemptIds,
    setError,
    setIsLoading,
  ]);

  // ── Manual play ──────────────────────────────────────────────────────────
  const handleManualPlay = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.play().catch((err) => console.log("Manual webcam play failed:", err));
    }
    if (screenVideoRef.current?.srcObject) {
      screenVideoRef.current.play().catch((err) => console.log("Manual screen play failed:", err));
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
  }, [isSubjectCompleted, currentSubject.displayName]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isMobile && isMonitoringEnabled) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" p={6}>
        <VStack maxW="md" p={8} bg="white" borderRadius="xl" boxShadow="lg" textAlign="center" gap={6}>
          <Box fontSize="5xl">🚫</Box>
          <VStack gap={2}>
            <Text fontSize="xl" fontWeight="bold">Mobile Access Restricted</Text>
            <Text color="gray.600">
              For security and monitoring purposes, this quiz can only be taken on a{" "}
              <b>Desktop or Laptop computer</b>
            </Text>
          </VStack>
          <Alert.Root status="info" size="sm">
            <Alert.Indicator />
            <Alert.Description>
              Screen sharing and advanced proctoring features are not supported on mobile browsers.
              To access the quiz on your mobile device
              <br /><br />
              <b>Download mobile app</b>
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

  if (isMonitoringEnabled && showAccessDialog) {
    const allGranted =
      hasWebcamAccess && hasAudioAccess && (hasScreenAccess || bypassedScreenShare);

    return (
      <Dialog.Root
        defaultOpen={true}
        onOpenChange={(open) => {
          if (!open && !allGranted) onCancel();
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="lg">
            <Dialog.Header>
              <HStack justify="space-between" align="center">
                <HStack gap={2}>
                  <FiShield size={20} color="#2563eb" />
                  <Dialog.Title fontSize="lg" fontWeight="bold">
                    Proctored Examination Access
                  </Dialog.Title>
                </HStack>
                <Badge colorPalette="blue" size="sm">
                  Active Proctoring
                </Badge>
              </HStack>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  To ensure academic integrity, this examination requires active verification of your{" "}
                  <b>Camera, Microphone, and Entire Screen</b>. Real-time AI proctoring monitors head
                  movements, looking away, unauthorized persons, and external objects (phones, notes).
                </Text>

                {/* Device Access Checklist */}
                <VStack
                  align="stretch"
                  gap={2}
                  p={3}
                  bg="gray.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  {/* Camera Checklist Item */}
                  <HStack justify="space-between" p={2} bg="white" borderRadius="md" boxShadow="xs">
                    <HStack gap={2}>
                      <FiCamera size={18} color="#4b5563" />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="bold">
                          Webcam Camera
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          Tracks face centering, head shifts & object detection
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack gap={2}>
                      <Badge
                        size="xs"
                        colorPalette={hasWebcamAccess ? "green" : webcamError ? "red" : "gray"}
                      >
                        {hasWebcamAccess
                          ? "Verified"
                          : isWebcamLoading
                          ? "Connecting..."
                          : webcamError
                          ? "Error"
                          : "Pending"}
                      </Badge>
                      {!hasWebcamAccess && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={initializeWebcam}
                          loading={isWebcamLoading}
                        >
                          Enable
                        </Button>
                      )}
                    </HStack>
                  </HStack>

                  {/* Microphone Checklist Item */}
                  <HStack justify="space-between" p={2} bg="white" borderRadius="md" boxShadow="xs">
                    <HStack gap={2}>
                      <FiMic size={18} color="#4b5563" />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="bold">
                          Microphone Audio
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          Monitors speech, whispering & vocal anomalies
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack gap={2}>
                      <Badge
                        size="xs"
                        colorPalette={hasAudioAccess ? "green" : audioError ? "red" : "gray"}
                      >
                        {hasAudioAccess
                          ? "Verified"
                          : isAudioLoading
                          ? "Connecting..."
                          : audioError
                          ? "Error"
                          : "Pending"}
                      </Badge>
                      {!hasAudioAccess && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={initializeAudio}
                          loading={isAudioLoading}
                        >
                          Enable
                        </Button>
                      )}
                    </HStack>
                  </HStack>

                  {/* Screen Share Checklist Item */}
                  <HStack justify="space-between" p={2} bg="white" borderRadius="md" boxShadow="xs">
                    <HStack gap={2}>
                      <FiMonitor size={18} color="#4b5563" />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="bold">
                          Entire Screen Share
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          Monitors tab switches & external application usage
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack gap={2}>
                      <Badge
                        size="xs"
                        colorPalette={
                          hasScreenAccess ? "green" : bypassedScreenShare ? "yellow" : screenError ? "red" : "gray"
                        }
                      >
                        {hasScreenAccess
                          ? "Shared"
                          : bypassedScreenShare
                          ? "Bypassed"
                          : isScreenLoading
                          ? "Requesting..."
                          : screenError
                          ? "Denied"
                          : "Pending"}
                      </Badge>
                      {!hasScreenAccess && !bypassedScreenShare && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={initializeScreenShare}
                          loading={isScreenLoading}
                        >
                          Share
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                </VStack>

                <Alert.Root status="info" size="sm">
                  <Alert.Indicator />
                  <Alert.Description fontSize="xs">
                    Please select <b>&quot;Entire Screen&quot;</b> when prompted by your browser to ensure full compliance.
                  </Alert.Description>
                </Alert.Root>

                {(webcamError || screenError || audioError) && (
                  <Alert.Root status="error" size="sm">
                    <Alert.Indicator />
                    <Alert.Title fontSize="xs">Access Error</Alert.Title>
                    <Alert.Description fontSize="xs">
                      {webcamError && `Webcam: ${webcamError}. `}
                      {screenError && `Screen Share: ${screenError}. `}
                      {audioError && `Audio: ${audioError}`}
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer flexWrap="wrap" gap={2}>
              <Button variant="outline" onClick={onCancel}>
                Cancel Quiz
              </Button>
              {screenError && hasWebcamAccess && !bypassedScreenShare && (
                <Button variant="surface" colorPalette="amber" onClick={proceedWithWebcamOnly}>
                  Proceed with Webcam Only
                </Button>
              )}
              <Button
                bg="primaryColor"
                onClick={handleStartMonitoring}
                loading={isWebcamLoading || isScreenLoading || isAudioLoading}
              >
                {allGranted ? "Start Examination" : "Grant All Permissions & Enter"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }

  return (
    <Box w={{ lg: "100%" }} m="auto">
      {isMonitoringEnabled && (
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
          bypassedScreenShare={bypassedScreenShare}
          initializeScreenShare={initializeScreenShare}
          proctorStatus={proctorStatus}
        />
      )}

      {subjectTimeLeft[currentSubjectIndex] !== undefined &&
        subjectTimeLeft[currentSubjectIndex] <= 0 && (
          <Alert.Root status="warning" my={4}>
            <Alert.Indicator />
            <Alert.Title>Time Finished</Alert.Title>
            <Alert.Description>
              Time for {currentSubject.displayName} has ended. Your answers have been automatically
              submitted.
              {!isSubjectCompleted && " You can no longer answer questions for this subject."}
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
          isSubmitting ||
          (subjectTimeLeft[currentSubjectIndex] !== undefined &&
            subjectTimeLeft[currentSubjectIndex] <= 0)
        }
        cheatingScore={cheatingScore}
      />

      <SubjectNavigation
        subjects={quizData.subjects}
        quizzes={quizData.quizzes}
        currentSubjectIndex={currentSubjectIndex}
        completedSubjects={completedSubjects}
        onSubjectChange={handleSubjectChange}
        disabledSubjects={quizData.subjects.map(
          (_, index) =>
            subjectTimeLeft[index] !== undefined && subjectTimeLeft[index] <= 0
        )}
      />

      <QuestionComponent
        currentQuestion={currentSubjectQuestions[currentQuestionIndex]}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={currentSubjectQuestions.length}
        selectedAnswer={answers[currentSubjectQuestions[currentQuestionIndex]?.id] || ""}
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