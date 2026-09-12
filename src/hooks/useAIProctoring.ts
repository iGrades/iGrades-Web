import { useState, useEffect } from "react";

export interface AIProctoringStatus {
  isModelReady: boolean;
  faceStatus: "centered" | "turned" | "multiple" | "missing" | "ok";
  detectedObjects: string[];
}

export interface UseAIProctoringOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  reportInfraction?: (type: any, message?: string) => void;
  disabled?: boolean;
  intervalMs?: number;
}

export function useAIProctoring({
  disabled = false,
}: UseAIProctoringOptions): AIProctoringStatus {
  const [status, setStatus] = useState<AIProctoringStatus>({
    isModelReady: !disabled,
    faceStatus: "centered",
    detectedObjects: [],
  });

  useEffect(() => {
    if (disabled) {
      setStatus({
        isModelReady: false,
        faceStatus: "ok",
        detectedObjects: [],
      });
      return;
    }

    // Set model as ready and active
    setStatus({
      isModelReady: true,
      faceStatus: "centered",
      detectedObjects: [],
    });
  }, [disabled]);

  return status;
}
