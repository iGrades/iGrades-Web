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

  // 1. Official Capacitor runtime flags & platform methods
  if (
    win?.Capacitor?.isNativePlatform?.() ||
    win?.Capacitor?.getPlatform?.() === "ios" ||
    win?.Capacitor?.getPlatform?.() === "android"
  ) {
    return true;
  }

  // 2. Custom protocols used by Capacitor/Ionic WebViews
  const protocol = win?.location?.protocol || "";
  if (protocol === "capacitor:" || protocol === "ionic:") {
    return true;
  }

  // 3. Origin check for iOS WKWebView (capacitor://localhost)
  if (typeof win?.location?.origin === "string" && win.location.origin.startsWith("capacitor://")) {
    return true;
  }

  // 4. Android WebView asset server check (localhost with no port on mobile device)
  const isLocalhostNoPort = win?.location?.hostname === "localhost" && (!win?.location?.port || win.location.port === "");
  const isMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator?.userAgent || "");
  if (isLocalhostNoPort && isMobileUA) {
    return true;
  }

  return false;
};

/** Alias for isNativeMobile for semantic clarity */
export const isCapacitorApp = (): boolean => isNativeMobile();

/**
 * Checks if the current environment is local development (e.g. localhost:3000)
 * or a sandboxed container preview (e.g. Cloud Run preview).
 */
export const isWebDevelopment = (): boolean => {
  if (typeof window === "undefined") return false;
  if (isNativeMobile()) return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".run.app");
};

/**
 * Checks if running on a deployed production web domain (e.g. igrades.org, Vercel SPA)
 */
export const isProductionWeb = (): boolean => {
  if (typeof window === "undefined") return false;
  return !isNativeMobile() && !isWebDevelopment();
};

/**
 * Default production backend endpoint for iGrades.
 */
export const DEFAULT_API_BASE_URL = "https://igrades-web.onrender.com";

export const getApiBaseUrl = (): string => {
  // Read API_BASE_URL without 'VITE' prefix as configured in secrets/environment
  const envUrl = (
    (typeof import.meta !== "undefined" && (import.meta.env as any)?.API_BASE_URL) ||
    (typeof import.meta !== "undefined" && (import.meta.env as any)?.BASE_API_URL) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
    DEFAULT_API_BASE_URL
  ).trim();

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  return DEFAULT_API_BASE_URL;
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
