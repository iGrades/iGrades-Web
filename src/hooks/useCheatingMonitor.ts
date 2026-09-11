import { useState, useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

export type CheatingType =
  | "tab_switch"
  | "multiple_persons"
  | "head_shift"
  | "eye_tracking"
  | "no_person"
  | "phone_detection"
  | "object_detected"
  | "audio_anomaly"
  | "screenshot"
  | "screen_recording"
  | "screen_share_stopped"
  | "face_mismatch";

const getPointsForType = (type: CheatingType): number => {
  switch (type) {
    case "tab_switch":
      return 5;
    case "multiple_persons":
      return 25;
    case "head_shift":
    case "eye_tracking":
      return 10;
    case "no_person":
      return 15;
    case "audio_anomaly":
      return 15;
    case "phone_detection":
    case "object_detected":
      return 25;
    case "screenshot":
      return 15;
    case "screen_recording":
      return 20;
    case "screen_share_stopped":
      return 25;
    case "face_mismatch":
      return 25;
    default:
      return 10;
  }
};

export const useCheatingMonitor = (
  handleSubmitAll: () => void,
  disabled: boolean,
) => {
  const [cheatingScore, setCheatingScore] = useState(0);

  const reportInfraction = useCallback(
    (type: CheatingType, customMessage?: string) => {
      // If monitoring is disabled (quiz ended), exit immediately
      if (disabled) return;

      setTimeout(() => {
        const points = getPointsForType(type);

        setCheatingScore((prevScore) => {
          const newScore = prevScore + points;
          const pointsLeft = Math.max(100 - newScore, 0);

          const defaultMessage = `Infraction detected: ${type.replace("_", " ")}. +${points} points.`;
          const message = customMessage || defaultMessage;
          const warning =
            pointsLeft > 0
              ? `Points left before auto-submit: ${pointsLeft}`
              : "Score reached 100! Final warning - quiz will auto-submit in 5 seconds.";

          toaster.create({
            title: "Cheating Alert",
            description: `${message} ${warning}`,
            type: pointsLeft > 0 ? "warning" : "error",
            duration: 5000,
            closable: true,
          });

          if (newScore >= 100) {
            setTimeout(() => {
              handleSubmitAll();
            }, 5000);
          }

          return newScore;
        });
      }, 0);
    },
    [handleSubmitAll, disabled],
  );

  return {
    cheatingScore,
    reportInfraction,
  };
};
