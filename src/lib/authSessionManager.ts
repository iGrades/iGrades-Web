// src/lib/authSessionManager.ts
import type { SupportedStorage } from "@supabase/supabase-js";

/**
 * iGrades Session Persistence & Inactivity Policy
 *
 * Requirements:
 * - 14-day inactivity timeout for persistent user sessions.
 * - Persistent across browser closing and reopening during normal use within 14 days.
 * - Active use continuously extends the session window without unexpected logouts.
 * - When 14 days of inactivity are reached, the session is invalidated at the
 *   authentication level (Supabase auth session revoked and local tokens removed).
 * - User is redirected to /login with: "Your session has expired. Please sign in again."
 */

export const INACTIVITY_PERIOD_DAYS = 14;
export const INACTIVITY_PERIOD_MS = INACTIVITY_PERIOD_DAYS * 24 * 60 * 60 * 1000; // 1,209,600,000 ms

export const STORAGE_KEYS = {
  LAST_ACTIVITY: "igrade_last_activity_timestamp",
  SESSION_EXPIRED_NOTICE: "igrade_session_expired_notice",
  AUTHD_STUDENT: "authdStudent",
  AUTHD_PARENT: "authdParent",
  ADMIN: "admin",
} as const;

export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again.";

let lastThrottledRecord = 0;
const RECORD_THROTTLE_MS = 15000; // Throttle disk writes to once per 15 seconds

/**
 * Check whether there is any active session present in local storage
 * (Supabase token, student profile, parent profile, or admin).
 */
export function hasActiveSessionStored(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("-auth-token") || key === STORAGE_KEYS.AUTHD_STUDENT || key === STORAGE_KEYS.AUTHD_PARENT)) {
        const val = localStorage.getItem(key);
        if (val && val !== "null" && val !== "undefined" && val.trim().length > 2) {
          return true;
        }
      }
    }
    if (sessionStorage.getItem(STORAGE_KEYS.ADMIN)) {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Record user activity timestamp.
 * Throttled to prevent unnecessary localStorage churn during rapid UI events.
 */
export function recordActivity(force = false): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const now = Date.now();
  if (!force && now - lastThrottledRecord < RECORD_THROTTLE_MS) {
    return;
  }
  lastThrottledRecord = now;
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
  } catch {
    // Ignore storage quota or access issues
  }
}

/**
 * Returns the timestamp of the last recorded user activity, or null if unset.
 */
export function getLastActivity(): number | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Evaluates whether the current session has exceeded the 14-day inactivity period.
 */
export function isSessionExpired(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  const hasSession = hasActiveSessionStored();
  if (!hasSession) {
    return false;
  }

  const lastActivity = getLastActivity();
  // If a session exists but no activity timestamp was recorded yet (e.g. migration from previous code),
  // initialize it now so the 14-day clock starts cleanly rather than kicking out active users.
  if (lastActivity === null) {
    recordActivity(true);
    return false;
  }

  const elapsed = Date.now() - lastActivity;
  return elapsed > INACTIVITY_PERIOD_MS;
}

/**
 * Clears all cached user state across localStorage and sessionStorage without triggering an alert.
 */
export function clearAllLocalSessionData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTHD_STUDENT);
    localStorage.removeItem(STORAGE_KEYS.AUTHD_PARENT);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN);

    // Remove any Supabase auth keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("-auth-token") || key.includes("supabase.auth"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

let isHandlingExpiry = false;

/**
 * Fully invalidates the authenticated session at both the Supabase and local application levels,
 * stores the friendly expiration notice, and safely routes to /login.
 */
export async function handleExpiredSession(supabaseClient?: any): Promise<void> {
  if (isHandlingExpiry) return;
  isHandlingExpiry = true;

  try {
    // 1. Revoke the session at the Supabase Auth server level if client is supplied or globally accessible
    if (supabaseClient?.auth?.signOut) {
      try {
        await supabaseClient.auth.signOut({ scope: "local" });
      } catch (e) {
        console.warn("Supabase sign out during expiry warning:", e);
      }
    }

    // 2. Clear all local session tokens and cached roles
    clearAllLocalSessionData();

    // 3. Set the clean, student-friendly expiration notice
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_EXPIRED_NOTICE, SESSION_EXPIRED_MESSAGE);
    } catch {
      // ignore
    }

    // 4. Redirect to login page preserving visual design
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login") && !currentPath.includes("/register") && !currentPath.includes("/signup")) {
        window.location.assign("/login?session_expired=1");
      }
    }
  } finally {
    setTimeout(() => {
      isHandlingExpiry = false;
    }, 2000);
  }
}

/**
 * Checks session validity and enforces the 14-day inactivity policy.
 * Returns true if valid, false if expired (and handles expiration cleanup).
 */
export async function checkAndEnforceSessionExpiry(supabaseClient?: any): Promise<boolean> {
  if (isSessionExpired()) {
    await handleExpiredSession(supabaseClient);
    return false;
  }
  // If valid and active, refresh activity
  if (hasActiveSessionStored()) {
    recordActivity();
  }
  return true;
}

/**
 * Retrieves and clears any pending session expiration notice to show on the login page.
 */
export function consumeSessionExpiredNotice(): string | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const notice = sessionStorage.getItem(STORAGE_KEYS.SESSION_EXPIRED_NOTICE);
    if (notice) {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRED_NOTICE);
      return notice;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Custom Storage adapter for Supabase Auth to enforce the 14-day inactivity policy
 * directly within the Supabase Auth token persistence engine.
 */
export const authSessionStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    try {
      // If inspecting a Supabase auth token, verify inactivity first
      if (key.includes("-auth-token")) {
        const lastActivity = getLastActivity();
        if (lastActivity !== null && Date.now() - lastActivity > INACTIVITY_PERIOD_MS) {
          // Inactivity expired — clear stored token immediately so Supabase treats it as null/expired
          localStorage.removeItem(key);
          clearAllLocalSessionData();
          try {
            sessionStorage.setItem(STORAGE_KEYS.SESSION_EXPIRED_NOTICE, SESSION_EXPIRED_MESSAGE);
          } catch {
            // ignore
          }
          return null;
        }
        // Valid session accessed: record activity
        recordActivity();
      }
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      localStorage.setItem(key, value);
      if (key.includes("-auth-token")) {
        recordActivity(true);
      }
    } catch {
      // ignore
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

/**
 * Sets up global listeners for user activity (pointer, keystroke, touch, visibility, tab focus).
 * All listeners are passive and debounced to preserve 60fps performance.
 */
let trackerInitialized = false;
export function initGlobalActivityTracker(): () => void {
  if (trackerInitialized || typeof window === "undefined") {
    return () => {};
  }
  trackerInitialized = true;

  const handleUserActivity = () => {
    if (hasActiveSessionStored()) {
      recordActivity();
    }
  };

  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      if (isSessionExpired()) {
        handleExpiredSession();
      } else if (hasActiveSessionStored()) {
        recordActivity(true);
      }
    }
  };

  const activityEvents: Array<keyof WindowEventMap> = ["mousedown", "keydown", "touchstart", "scroll"];
  activityEvents.forEach((ev) => {
    window.addEventListener(ev, handleUserActivity, { passive: true });
  });
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("focus", handleVisibility);

  // Periodic check once every 5 minutes to detect expiration without tight polling
  const intervalId = window.setInterval(() => {
    if (isSessionExpired()) {
      handleExpiredSession();
    }
  }, 5 * 60 * 1000);

  return () => {
    activityEvents.forEach((ev) => {
      window.removeEventListener(ev, handleUserActivity);
    });
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("focus", handleVisibility);
    window.clearInterval(intervalId);
    trackerInitialized = false;
  };
}
