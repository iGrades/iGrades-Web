import { useState, useCallback, useRef } from "react";

export const useMonitoring = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [hasScreenAccess, setHasScreenAccess] = useState(false);
  const [hasAudioAccess, setHasAudioAccess] = useState(false);

  const [isWebcamLoading, setIsWebcamLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(false);

  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [showMonitoring, setShowMonitoring] = useState(true);

  // ── Video node setters ─────────────────────────────────────────────────────
  // Comparing node.srcObject avoids unnecessary re-assignments
  // which would cause the live video feed to blink.

  const setWebcamNode = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node && webcamStream) {
        if (node.srcObject !== webcamStream) {
          node.srcObject = webcamStream;
          node.muted = true;
          node.play().catch((err) => {
            if (err.name !== "AbortError") console.error("Webcam play error:", err);
          });
        }
        videoRef.current = node;
      } else if (node === null) {
        videoRef.current = null;
      }
    },
    [webcamStream]
  );

  const setScreenNode = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node && screenStream) {
        if (node.srcObject !== screenStream) {
          node.srcObject = screenStream;
          node.muted = true;
          node.play().catch((err) => {
            if (err.name !== "AbortError") console.error("Screen play error:", err);
          });
        }
        screenVideoRef.current = node;
      } else if (node === null) {
        screenVideoRef.current = null;
      }
    },
    [screenStream]
  );

  // ── Stream initializers ────────────────────────────────────────────────────

  const initializeWebcam = useCallback(async (): Promise<boolean> => {
    try {
      setIsWebcamLoading(true);
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      setWebcamStream(stream);
      setHasWebcamAccess(true);
      return true;
    } catch (err: any) {
      setWebcamError(err.message);
      setHasWebcamAccess(false);
      return false;
    } finally {
      setIsWebcamLoading(false);
    }
  }, []);

  const initializeScreenShare = useCallback(async (): Promise<boolean> => {
    try {
      setIsScreenLoading(true);
      setScreenError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setHasScreenAccess(true);

      // If the user stops screen share via the browser's built-in button,
      // update state so the warning banner shows immediately
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setHasScreenAccess(false);
        setScreenStream(null);
      });

      return true;
    } catch (err: any) {
      setScreenError(err.message);
      setHasScreenAccess(false);
      return false;
    } finally {
      setIsScreenLoading(false);
    }
  }, []);

  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      setAudioError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setHasAudioAccess(true);
      return true;
    } catch (err: any) {
      setAudioError(err.message);
      setHasAudioAccess(false);
      // Audio failure is non-blocking — webcam and screen share are the
      // hard requirements. Audio monitoring is best-effort.
      return false;
    }
  }, []);

  // ── Start all monitoring ──────────────────────────────────────────────────
  //
  // FIX: Previously, showAccessDialog was:
  //   !(hasWebcamAccess && hasScreenAccess && hasAudioAccess)
  // This meant a denied microphone would permanently block quiz start.
  // Now: webcam + screen share are required; audio is optional.
  // The dialog dismisses as soon as both required streams are granted.

  const handleStartMonitoring = useCallback(async (): Promise<boolean> => {
    // Run all three in sequence — screen share must be last because
    // the browser dialog steals focus and can interfere with getUserMedia
    const webcamOk = await initializeWebcam();
    const audioOk = await initializeAudio();   // non-blocking — failure is OK
    const screenOk = await initializeScreenShare();

    // Only webcam + screen are required to proceed
    return webcamOk && screenOk;
  }, [initializeWebcam, initializeAudio, initializeScreenShare]);

  // ── Stop all monitoring ───────────────────────────────────────────────────

  const stopAllMonitoring = useCallback(() => {
    [webcamStream, screenStream, audioStream].forEach((s) =>
      s?.getTracks().forEach((t) => t.stop())
    );
    setWebcamStream(null);
    setScreenStream(null);
    setAudioStream(null);
    setHasWebcamAccess(false);
    setHasScreenAccess(false);
    setHasAudioAccess(false);
    // Clear video refs so YOLO hooks stop processing
    videoRef.current = null;
    screenVideoRef.current = null;
  }, [webcamStream, screenStream, audioStream]);

  const toggleMonitoring = useCallback(() => setShowMonitoring((p) => !p), []);

  return {
    videoRef,
    screenVideoRef,
    setWebcamNode,
    setScreenNode,
    audioStream,
    hasWebcamAccess,
    hasScreenAccess,
    hasAudioAccess,
    isWebcamLoading,
    isScreenLoading,
    webcamError,
    screenError,
    audioError,
    showMonitoring,

    // ── FIX: dialog dismisses when webcam + screen are ready ──────────────
    // Audio denial no longer blocks quiz start.
    showAccessDialog: !(hasWebcamAccess && hasScreenAccess),

    handleStartMonitoring,
    stopAllMonitoring,
    toggleMonitoring,
  };
};