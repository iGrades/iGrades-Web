// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { authSessionStorage, recordActivity } from "./authSessionManager";
import { isNativeMobile, isWebDevelopment, apiUrl } from "./apiConfig";

const supabaseUrl =
  (typeof import.meta !== "undefined" && (import.meta.env?.SUPABASE_URL as string)) ||
  "https://jmjballgaxelqhsvhlvl.supabase.co";
const supabaseAnonKey =
  (typeof import.meta !== "undefined" && (import.meta.env?.SUPABASE_ANON_KEY as string)) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptamJhbGxnYXhlbHFoc3ZobHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjA2NjAsImV4cCI6MjA2NDUzNjY2MH0.Roav4e8Yx7KXw5KtgZEFToi89HCHio9rRnEPWq-ngj4";

/**
 * Determines whether Supabase queries should route through the same-origin Express proxy.
 *
 * Capacitor Native Mobile (Android APK / iOS) must ALWAYS connect directly
 * to the Supabase HTTPS endpoint. Only Cloud Run sandboxed previews (*.run.app)
 * use the proxy.
 */
export const shouldUseProxy = (): boolean => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname || "";
  return hostname.endsWith(".run.app");
};

const customFetch: typeof fetch = async (input, init) => {
  // Any network activity from the authenticated user refreshes the 14-day inactivity timer
  recordActivity();

  const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // Prepare headers with student subscription context if available
  const newHeaders = new Headers(init?.headers);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = localStorage.getItem("authdStudent");
      if (cached) {
        const student = JSON.parse(cached);
        if (student?.id) newHeaders.set("x-student-id", student.id);
        if (student?.subscription) newHeaders.set("x-student-subscription", student.subscription);
        if (student?.subscription_status) newHeaders.set("x-student-status", student.subscription_status);
      }
    } catch {
      // ignore
    }
  }

  const modifiedInit = {
    ...init,
    headers: newHeaders,
  };

  // In the browser, route through same-origin proxy ONLY in dev sandbox environments
  // Supabase Storage endpoints (/storage/v1/) support CORS natively (wildcard origin)
  // and must connect directly so binary streams, file uploads, and downloads are never truncated
  if (shouldUseProxy() && rawUrl.includes(".supabase.co") && !rawUrl.includes("/storage/v1/")) {
    const proxyPath = rawUrl.replace(/^https?:\/\/[^/]+/, "/api/supabase-proxy");
    const proxyUrl = apiUrl(proxyPath);
    try {
      const response = await fetch(proxyUrl, modifiedInit);
      // If the proxy responds with 404 or 405 (proxy not deployed on this server), fallback to direct Supabase call
      if (response.status === 404 || response.status === 405) {
        return await fetch(input, modifiedInit);
      }
      return response;
    } catch (proxyError: any) {
      console.warn("Supabase proxy fetch failed, falling back to direct:", proxyError?.message || proxyError);
      try {
        return await fetch(input, modifiedInit);
      } catch (directError: any) {
        console.warn("Direct Supabase fetch also failed:", directError?.message || directError);
        throw directError;
      }
    }
  }

  // Direct fetch for production (e.g. www.igrades.org) and standard calls
  return await fetch(input, modifiedInit);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: authSessionStorage,
  },
  global: {
    fetch: customFetch,
  },
});


