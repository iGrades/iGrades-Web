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

  
  // comparing node.srcObject to avoid unnecessary re-assignments (which can cause the live video to blink)
  const setWebcamNode = useCallback((node: HTMLVideoElement | null) => {
    if (node && webcamStream) {
      if (node.srcObject !== webcamStream) {
        node.srcObject = webcamStream;
        node.muted = true;
        node.play().catch(err => {
          if (err.name !== "AbortError") console.error("Webcam play error:", err);
        });
      }
      videoRef.current = node;
    } else if (node === null) {
      videoRef.current = null;
    }
  }, [webcamStream]);

  const setScreenNode = useCallback((node: HTMLVideoElement | null) => {
    if (node && screenStream) {
      if (node.srcObject !== screenStream) {
        node.srcObject = screenStream;
        node.muted = true;
        node.play().catch(err => {
          if (err.name !== "AbortError") console.error("Screen play error:", err);
        });
      }
      screenVideoRef.current = node;
    } else if (node === null) {
      screenVideoRef.current = null;
    }
  }, [screenStream]);

  const initializeWebcam = useCallback(async () => {
    try {
      setIsWebcamLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      setWebcamStream(stream);
      setHasWebcamAccess(true);
      return true;
    } catch (err: any) {
      setWebcamError(err.message);
      return false;
    } finally {
      setIsWebcamLoading(false);
    }
  }, []);

  const initializeScreenShare = useCallback(async () => {
    try {
      setIsScreenLoading(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setHasScreenAccess(true);
      return true;
    } catch (err: any) {
      setScreenError(err.message);
      return false;
    } finally {
      setIsScreenLoading(false);
    }
  }, []);

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setHasAudioAccess(true);
      return true;
    } catch (err: any) {
      setAudioError(err.message);
      return false;
    }
  }, []);

  // Wrapping this in useCallback to prevents parent re-renders from changing the function identity
  const handleStartMonitoring = useCallback(async () => {
    const w = await initializeWebcam();
    const s = await initializeScreenShare();
    const a = await initializeAudio();
    return w && s && a;
  }, [initializeWebcam, initializeScreenShare, initializeAudio]);

  const stopAllMonitoring = useCallback(() => {
    [webcamStream, screenStream, audioStream].forEach(s => s?.getTracks().forEach(t => t.stop()));
    setWebcamStream(null);
    setScreenStream(null);
    setAudioStream(null);
    setHasWebcamAccess(false);
    setHasScreenAccess(false);
    setHasAudioAccess(false);
  }, [webcamStream, screenStream, audioStream]);

  const toggleMonitoring = useCallback(() => setShowMonitoring(p => !p), []);

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
    showAccessDialog: !(hasWebcamAccess && hasScreenAccess && hasAudioAccess),
    handleStartMonitoring,
    stopAllMonitoring,
    toggleMonitoring,
  };
};