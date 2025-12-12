
import { useState, useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

export type CheatingType =
  | "tab_switch" // 5 points
  | "multiple_persons" // 20 points
  | "eye_tracking" // 10 points (e.g., looking away from screen frequently)
  | "audio_anomaly" // 15 points (e.g., background noise, multiple voices)
  | "phone_detection" // 20 points
  | "screenshot" // 10 points
  | "screen_recording" // 15 points
  | "face_mismatch"; // 25 points (face recognition fails)

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

export const useCheatingMonitor = (handleSubmitAll: () => void) => {
  const [cheatingScore, setCheatingScore] = useState(0);

  // WRAP reportInfraction IN useCallback AND USE FUNCTIONAL UPDATE
  const reportInfraction = useCallback(
    (type: CheatingType, customMessage?: string) => {
      const points = getPointsForType(type);

      // Use functional update (prevScore) 
      setCheatingScore((prevScore) => {
        const newScore = prevScore + points;

        const pointsLeft = Math.max(100 - newScore, 0);
        const defaultMessage = `Infraction detected: ${type.replace(
          "_",
          " "
        )}. +${points} points.`;
        const message = customMessage || defaultMessage;
        const warning =
          pointsLeft > 0
            ? `Points left before auto-submit: ${pointsLeft}`
            : "Score reached 100! Final warning - quiz will auto-submit in 5 seconds.";

        // Show toast with the calculated newScore/pointsLeft
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

        // Return the actual new score to update the state
        return newScore;
      });
      // -------------------------------------------------------------------
    },
    [handleSubmitAll] // Depend on handleSubmitAll
  );

  return {
    cheatingScore,
    reportInfraction,
  };
};





