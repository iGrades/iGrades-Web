import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Detects whether desktop screen sharing (getDisplayMedia) is genuinely supported
 * in the current runtime environment.
 *
 * Mobile browsers (iOS Safari, Android Chrome, and Capacitor/Cordova WebViews)
 * lack WebRTC getDisplayMedia support or disallow it via OS-level sandboxing.
 */
export const checkScreenShareSupport = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  // 1. Verify getDisplayMedia API exists on navigator.mediaDevices
  const hasGetDisplayMedia =
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.getDisplayMedia === "function";

  if (!hasGetDisplayMedia) return false;

  // 2. Mobile User Agents: iOS Safari / Android Chrome / Mobile WebViews do not support getDisplayMedia
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobileDevice) return false;

  return true;
};

export const useMonitoring = (options?: {
  disabled?: boolean;
  onScreenShareEnded?: () => void;
}) => {
  const disabled = options?.disabled ?? false;
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
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [showMonitoring, setShowMonitoring] = useState(true);

  // Platform screen-sharing support detection
  const [isScreenShareSupported] = useState<boolean>(() => checkScreenShareSupport());
  const [bypassedScreenShare, setBypassedScreenShare] = useState<boolean>(
    () => !checkScreenShareSupport()
  );
  const [monitoringMode, setMonitoringMode] = useState<"desktop_full" | "mobile_proctored">(
    () => (!checkScreenShareSupport() ? "mobile_proctored" : "desktop_full")
  );

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

      if (!checkScreenShareSupport()) {
        const msg =
          "Desktop screen sharing is not supported on this mobile device or browser. Mobile proctoring uses Front Camera, Microphone, and Tab/App Visibility monitoring instead.";
        setScreenError(msg);
        setHasScreenAccess(false);
        setBypassedScreenShare(true);
        setMonitoringMode("mobile_proctored");
        return false;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setHasScreenAccess(true);
      setBypassedScreenShare(false);
      setMonitoringMode("desktop_full");

      // If the user stops screen share via the browser's built-in button,
      // update state so the warning banner shows immediately
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setHasScreenAccess(false);
        setScreenStream(null);
        options?.onScreenShareEnded?.();
      });

      return true;
    } catch (err: any) {
      let msg = err?.message || "Failed to start screen share.";
      if (
        msg.includes("display-capture") ||
        msg.includes("permissions policy") ||
        msg.includes("disallowed")
      ) {
        msg =
          "Screen share is disallowed by browser/iframe security policy. You can proceed with webcam & tab visibility monitoring, or open the app directly in a new tab.";
      }
      setScreenError(msg);
      setHasScreenAccess(false);
      return false;
    } finally {
      setIsScreenLoading(false);
    }
  }, [options]);

  const proceedWithWebcamOnly = useCallback(() => {
    setBypassedScreenShare(true);
    setMonitoringMode("mobile_proctored");
    setScreenError(null);
  }, []);

  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      setIsAudioLoading(true);
      setAudioError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setHasAudioAccess(true);
      return true;
    } catch (err: any) {
      setAudioError(err?.message || "Microphone access denied or not found.");
      setHasAudioAccess(false);
      return false;
    } finally {
      setIsAudioLoading(false);
    }
  }, []);

  // ── Start all monitoring (Webcam, Audio, and Screen Share) ───────────────────
  const handleStartMonitoring = useCallback(async (): Promise<boolean> => {
    // 1. Always start Webcam and Audio
    const [webcamOk, audioOk] = await Promise.all([
      initializeWebcam(),
      initializeAudio(),
    ]);

    // 2. Only attempt desktop screen share if genuinely supported and not in mobile proctored mode
    let screenOk = false;
    if (checkScreenShareSupport() && !bypassedScreenShare) {
      screenOk = await initializeScreenShare();
    } else {
      // Mobile / camera-and-visibility path: screen share is omitted
      screenOk = true;
    }

    return webcamOk && audioOk && screenOk;
  }, [initializeWebcam, initializeAudio, initializeScreenShare, bypassedScreenShare]);

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
    setBypassedScreenShare(!checkScreenShareSupport());
    videoRef.current = null;
    screenVideoRef.current = null;
  }, [webcamStream, screenStream, audioStream]);

  useEffect(() => {
    if (disabled) {
      stopAllMonitoring();
    }
  }, [disabled, stopAllMonitoring]);

  const toggleMonitoring = useCallback(() => setShowMonitoring((p) => !p), []);

  return {
    videoRef,
    screenVideoRef,
    setWebcamNode,
    setScreenNode,
    audioStream,
    hasWebcamAccess: disabled ? false : hasWebcamAccess,
    hasScreenAccess: disabled ? false : hasScreenAccess,
    hasAudioAccess: disabled ? false : hasAudioAccess,
    isWebcamLoading: disabled ? false : isWebcamLoading,
    isScreenLoading: disabled ? false : isScreenLoading,
    isAudioLoading: disabled ? false : isAudioLoading,
    webcamError,
    screenError,
    audioError,
    showMonitoring: disabled ? false : showMonitoring,
    isScreenShareSupported,
    monitoringMode,
    bypassedScreenShare,
    proceedWithWebcamOnly,

    // Dialog dismisses when disabled, or when webcam, audio, and screen share/mobile path are all granted
    showAccessDialog:
      !disabled &&
      !(hasWebcamAccess && hasAudioAccess && (hasScreenAccess || bypassedScreenShare || !isScreenShareSupported)),

    handleStartMonitoring,
    initializeWebcam,
    initializeAudio,
    initializeScreenShare,
    stopAllMonitoring,
    toggleMonitoring,
  };
};