import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

/**
 * Lightweight, non-intrusive haptic feedback service.
 * Respects user's prefers-reduced-motion setting and device capability.
 * Safely falls back to subtle web vibration (8ms) or no-op.
 */

let lastHapticTimestamp = 0;
const HAPTIC_THROTTLE_MS = 60; // Prevent rapid-fire or distracting vibration

function shouldSkipHaptics(): boolean {
  if (typeof window === "undefined") return true;

  // Respect system reduced-motion accessibility preference
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
  } catch {
    // ignore
  }

  // Throttle rapid repeated triggers
  const now = Date.now();
  if (now - lastHapticTimestamp < HAPTIC_THROTTLE_MS) {
    return true;
  }
  lastHapticTimestamp = now;

  return false;
}

export const hapticsService = {
  /**
   * Subtle tap for deliberate navigation events (e.g. bottom bar tab switch)
   */
  async triggerNavigationTap(): Promise<void> {
    if (shouldSkipHaptics()) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        // Very subtle 8ms micro-pulse for mobile web browsers
        navigator.vibrate(8);
      }
    } catch {
      // Gracefully swallow any plugin or permission errors
    }
  },

  /**
   * Subtle selection feedback for quiz answer options
   */
  async triggerAnswerSelection(): Promise<void> {
    if (shouldSkipHaptics()) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.selectionChanged();
      } else if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(6);
      }
    } catch {
      // Gracefully swallow errors
    }
  },

  /**
   * Soft feedback for toggle or light button clicks
   */
  async triggerLight(): Promise<void> {
    if (shouldSkipHaptics()) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(8);
      }
    } catch {
      // Gracefully swallow errors
    }
  },
};
