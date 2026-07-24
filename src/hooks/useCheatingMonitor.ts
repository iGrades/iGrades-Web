import { useState, useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

export type CheatingType =
  | "tab_switch"
  | "multiple_persons" // non functional
  | "eye_tracking" // non functional
  | "audio_anomaly"
  | "phone_detection" // non functional
  | "screenshot"
  | "screen_recording"
  | "face_mismatch"; // non functional

const getPointsForType = (type: CheatingType): number => {
  switch (type) {
    case "tab_switch":
      return 5;
    case "multiple_persons":
      return 20;
    case "eye_tracking":
      return 10;
    case "audio_anomaly":
      return 15;
    case "phone_detection":
      return 20;
    case "screenshot":
      return 10;
    case "screen_recording":
      return 15;
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
