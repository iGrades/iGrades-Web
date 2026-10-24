import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { KeepAwake } from "@capacitor-community/keep-awake";

/**
 * Screen keep-awake service for active timed examinations.
 * Ensures the screen does not dim or sleep while a student is answering a timed exam.
 * Unconditionally releases on submission, cancellation, timeout, navigation, or unmount.
 */

let isExamWakeLockActive = false;
let webWakeLockSentinel: any = null;

async function requestWebWakeLock(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
    return false;
  }
  try {
    const sentinel = await (navigator as any).wakeLock.request("screen");
    webWakeLockSentinel = sentinel;
    sentinel.addEventListener("release", () => {
      // If released externally (e.g. OS low battery) and exam is still active, clear pointer
      if (webWakeLockSentinel === sentinel) {
        webWakeLockSentinel = null;
      }
    });
    return true;
  } catch (_err) {
    // Gracefully handle wake lock rejection (e.g. battery saver mode)
    return false;
  }
}

async function releaseWebWakeLock(): Promise<void> {
  if (webWakeLockSentinel) {
    try {
      await webWakeLockSentinel.release();
    } catch {
      // ignore
    } finally {
      webWakeLockSentinel = null;
    }
  }
}

export const examWakeLockService = {
  /**
   * Acquire keep-awake lock for active timed examination
   */
  async acquire(reason = "timed_exam"): Promise<boolean> {
    isExamWakeLockActive = true;

    try {
      if (Capacitor.isNativePlatform()) {
        await KeepAwake.keepAwake();
        return true;
      } else {
        return await requestWebWakeLock();
      }
    } catch (err) {
      // Non-fatal: exam continues even if device disallows wake-lock
      console.warn(`[ExamWakeLock] Could not acquire keep-awake (${reason}):`, err);
      return false;
    }
  },

  /**
   * Release keep-awake lock immediately to restore normal device sleep
   */
  async release(reason = "exam_ended"): Promise<void> {
    isExamWakeLockActive = false;

    try {
      if (Capacitor.isNativePlatform()) {
        await KeepAwake.allowSleep();
      }
    } catch (err) {
      console.warn(`[ExamWakeLock] Could not allow sleep (${reason}):`, err);
    }

    try {
      await releaseWebWakeLock();
    } catch {
      // ignore
    }
  },

  /**
   * Query whether the exam wake-lock is actively requested
   */
  isActive(): boolean {
    return isExamWakeLockActive;
  },
};

/**
 * React hook to manage keep-awake for the lifecycle of a timed exam session.
 * Guarantees release on unmount, page change, submission, or manual cancellation.
 */
export function useExamWakeLock(shouldBeActive: boolean) {
  const activeRef = useRef(shouldBeActive);
  activeRef.current = shouldBeActive;

  useEffect(() => {
    if (!shouldBeActive) {
      examWakeLockService.release("hook_inactive");
      return;
    }

    // Acquire on activation
    examWakeLockService.acquire("timed_exam_active");

    // Re-acquire if app was minimized and resumed while exam is still running
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && activeRef.current) {
        examWakeLockService.acquire("visibility_resumed");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Unconditionally release on unmount / navigation away
      examWakeLockService.release("hook_cleanup");
    };
  }, [shouldBeActive]);
}
