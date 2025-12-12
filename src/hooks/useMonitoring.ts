// /** For documentation sake - This hook handles the following:
//  * webcam permission request
//  * screen share permission request
//  * managing media streams
//  * auto-cleanup when component unmounts
//   **/
// Updated useMonitoring hook


import { useEffect, useRef, useState, useCallback } from "react";

export const useMonitoring = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [hasScreenAccess, setHasScreenAccess] = useState(false);
  const [hasAudioAccess, setHasAudioAccess] = useState(false);

  const [isWebcamLoading, setIsWebcamLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(false);

  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [showMonitoring, setShowMonitoring] = useState(true);

  // Function to play video safely
  const playVideo = useCallback((videoElement: HTMLVideoElement | null) => {
    if (!videoElement || !videoElement.srcObject) return;

    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        // Don't log common autoplay policy errors
        if (!e.message.includes("user gesture") && !e.message.includes("pause")) {
          console.error("Video play error:", e);
        }
      });
    }
  }, []);

  // Assign webcam stream when available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (webcamStreamRef.current) {
      video.srcObject = webcamStreamRef.current;

      // Set up event listeners
      const handleLoadedMetadata = () => {
        console.log('Webcam metadata loaded');
        playVideo(video);
      };

      const handleCanPlay = () => {
        console.log('Webcam can play');
        playVideo(video);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);

      // Try to play immediately if already loaded
      if (video.readyState >= 1) {
        // HAVE_ENOUGH_DATA
        playVideo(video);
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
      };
    } else {
      video.srcObject = null;
    }
  }, [hasWebcamAccess, playVideo]);

  // Assign screen stream when available
  useEffect(() => {
    const video = screenVideoRef.current;
    if (!video) return;

    if (screenStreamRef.current) {
      video.srcObject = screenStreamRef.current;

      // Set up event listeners
      const handleLoadedMetadata = () => {
        console.log('Screen metadata loaded');
        playVideo(video);
      };

      const handleCanPlay = () => {
        console.log('Screen can play');
        playVideo(video);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);

      // Try to play immediately if already loaded
      if (video.readyState >= 1) {
        playVideo(video);
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
      };
    } else {
      video.srcObject = null;
    }
  }, [hasScreenAccess, playVideo]);

  // Initialize webcam
  const initializeWebcam = async (): Promise<boolean> => {
    try {
      setIsWebcamLoading(true);
      setWebcamError(null);

      // Stop existing stream if any
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      webcamStreamRef.current = stream;
      setHasWebcamAccess(true);

      // Handle track ending
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.log('Webcam track ended');
          setHasWebcamAccess(false);
          setWebcamError("Webcam disconnected");
        };
      });

      console.log('Webcam stream acquired');
      return true;
    } catch (err: any) {
      setWebcamError(err.message || "Failed to access webcam");
      setHasWebcamAccess(false);
      console.error('Webcam init error:', err);
      return false;
    } finally {
      setIsWebcamLoading(false);
    }
  };

  // Initialize screen sharing
  const initializeScreenShare = async (): Promise<boolean> => {
    try {
      setIsScreenLoading(true);
      setScreenError(null);

      // Stop existing stream if any
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Handle when user stops the screen sharing
      stream.getTracks().forEach((track) => {
        track.onended = () => {
          setHasScreenAccess(false);
          setScreenError("Screen sharing stopped");
          console.log('Screen track ended');
        };
      });

      screenStreamRef.current = stream;
      setHasScreenAccess(true);
      console.log('Screen stream acquired');
      return true;
    } catch (err: any) {
      setScreenError(err.message || "Failed to access screen share");
      setHasScreenAccess(false);
      console.error('Screen init error:', err);
      return false;
    } finally {
      setIsScreenLoading(false);
    }
  };

  // Initialize microphone
    const initializeAudio = async (): Promise<boolean> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        audioStreamRef.current = stream;
        setHasAudioAccess(true);
        console.log('Audio stream acquired:', stream);
        return true;
      } catch (err: any) {
        setAudioError(err.message || "Failed to access microphone");
        setHasAudioAccess(false);
        console.error('Audio init error:', err);
        return false;
      }
    };

  // Combined start
  const handleStartMonitoring = async () => {
    const webcamSuccess = await initializeWebcam();
    const screenSuccess = await initializeScreenShare();
    const audioSuccess = await initializeAudio();

    return webcamSuccess && screenSuccess && audioSuccess;
  };

  // Stop monitoring
  const stopAllMonitoring = useCallback(() => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }

    // clear srcObject
    setHasWebcamAccess(false);
    setHasScreenAccess(false);
    setHasAudioAccess(false);
    console.log('Monitoring stopped');
  }, []);

  const toggleMonitoring = () => setShowMonitoring((p) => !p);

  const showAccessDialog = !(hasWebcamAccess && hasScreenAccess && hasAudioAccess);

  return {
    // refs
    videoRef,
    screenVideoRef,
    audioStream: audioStreamRef.current,

    // states
    hasWebcamAccess,
    hasScreenAccess,
     hasAudioAccess,
    isWebcamLoading,
    isScreenLoading,
    webcamError,
    screenError,
     audioError,
    showMonitoring,
    showAccessDialog,

    // actions
    initializeWebcam,
    initializeScreenShare,
    handleStartMonitoring,
    stopAllMonitoring,
    toggleMonitoring,
    
    
   
   
  };
};
