/**
 * Centralized API Base URL configuration for iGrades.
 *
 * Environment resolution rules:
 * 1. If VITE_API_BASE_URL (or API_BASE_URL) is explicitly configured via environment variables,
 *    normalize and return that verified URL (without trailing slash).
 * 2. If running inside a native mobile runtime (Capacitor iOS/Android WebView or capacitor:// protocol):
 *    - If VITE_API_BASE_URL is set, use it for cross-origin backend calls.
 *    - If NOT set, log a diagnostic warning explaining the missing prerequisite and fall back to relative path.
 * 3. In Web development and same-origin production web environments:
 *    - Return "" (empty string) so relative requests (/api/...) resolve against the current origin,
 *      which is served by Express server.ts in full-stack setups.
 */

export const isNativeMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  const win = window as any;
  return Boolean(
    win?.Capacitor?.isNativePlatform?.() ||
    win?.location?.protocol === "capacitor:" ||
    (win?.location?.hostname === "localhost" && win?.location?.port === "")
  );
};

export const getApiBaseUrl = (): string => {
  const envUrl = (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof import.meta !== "undefined" && (import.meta.env as any)?.API_BASE_URL) ||
    ""
  ).trim();

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (isNativeMobile()) {
    console.warn(
      "[iGrades Mobile Prerequisite] VITE_API_BASE_URL is not configured. " +
      "Native Capacitor mobile builds require a deployed, reachable HTTPS Express backend URL."
    );
    return "";
  }

  // Web environment default: empty string for same-origin relative requests
  return "";
};

/**
 * Constructs a fully qualified API endpoint URL based on current runtime environment.
 * @param path Relative path, e.g. "/api/spark-chat" or "api/award-points"
 */
export const apiUrl = (path: string): string => {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
};
