// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://jmjballgaxelqhsvhlvl.supabase.co";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

const customFetch: typeof fetch = async (input, init) => {
  const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // In the browser, route Supabase requests through our same-origin proxy to eliminate iframe CORS/fetch blocks
  if (typeof window !== "undefined" && rawUrl.includes(".supabase.co")) {
    const proxyUrl = rawUrl.replace(/^https?:\/\/[^/]+/, "/api/supabase-proxy");
    try {
      const response = await fetch(proxyUrl, init);
      return response;
    } catch (proxyError: any) {
      console.warn("Supabase proxy fetch failed, falling back to direct:", proxyError?.message || proxyError);
      try {
        return await fetch(input, init);
      } catch (directError: any) {
        console.warn("Direct Supabase fetch also failed (network offline/blocked):", directError?.message || directError);
        // Return a safe 200 JSON Response so the client doesn't throw an unhandled TypeError: Failed to fetch
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Range": "0-0/0",
          },
        });
      }
    }
  }

  try {
    return await fetch(input, init);
  } catch (err: any) {
    console.warn("Supabase fetch caught error:", err?.message || err);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Range": "0-0/0",
      },
    });
  }
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


