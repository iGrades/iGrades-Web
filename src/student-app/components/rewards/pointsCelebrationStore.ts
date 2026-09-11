import { create } from "zustand";
import { sprayPointsConfetti, playCelebrationSound } from "./confettiHelper";

export interface PointsCelebrationPayload {
  points: number;
  title?: string;
  description?: string;
  eventType?: "login" | "quiz" | "milestone" | "streak" | "general";
  streakDays?: number;
  milestonePoints?: number;
  newBalance?: number;
}

interface PointsCelebrationState {
  isOpen: boolean;
  data: PointsCelebrationPayload | null;
  triggerCelebration: (payload: PointsCelebrationPayload) => void;
  closeCelebration: () => void;
}

export const usePointsCelebrationStore = create<PointsCelebrationState>((set) => ({
  isOpen: false,
  data: null,
  triggerCelebration: (payload: PointsCelebrationPayload) => {
    // Fire confetti spray & pleasant harmonic sound
    sprayPointsConfetti();
    playCelebrationSound();

    set({
      isOpen: true,
      data: payload,
    });
  },
  closeCelebration: () => {
    set({
      isOpen: false,
      data: null,
    });
  },
}));

/**
 * Universal helper to celebrate points gained anywhere in the app.
 * Replaces the silent toast with an animated celebration popup & confetti burst.
 */
export function celebratePointsGained(payload: PointsCelebrationPayload) {
  usePointsCelebrationStore.getState().triggerCelebration(payload);
}
