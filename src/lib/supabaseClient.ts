// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://jmjballgaxelqhsvhlvl.supabase.co";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

const shouldUseProxy = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  // Route through proxy only in sandboxed preview/dev environments (e.g. Cloud Run or localhost)
  // Production hosts like igrades.org or www.igrades.org connect directly to Supabase
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".run.app");
};

const customFetch: typeof fetch = async (input, init) => {
  const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // In the browser, route through same-origin proxy ONLY in dev sandbox environments
  if (shouldUseProxy() && rawUrl.includes(".supabase.co")) {
    const proxyUrl = rawUrl.replace(/^https?:\/\/[^/]+/, "/api/supabase-proxy");
    try {
      const response = await fetch(proxyUrl, init);
      // If the proxy responds with 404 or 405 (proxy not deployed on this server), fallback to direct Supabase call
      if (response.status === 404 || response.status === 405) {
        return await fetch(input, init);
      }
      return response;
    } catch (proxyError: any) {
      console.warn("Supabase proxy fetch failed, falling back to direct:", proxyError?.message || proxyError);
      try {
        return await fetch(input, init);
      } catch (directError: any) {
        console.warn("Direct Supabase fetch also failed:", directError?.message || directError);
        throw directError;
      }
    }
  }

  // Direct fetch for production (e.g. www.igrades.org) and standard calls
  return await fetch(input, init);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: customFetch,
  },
});


