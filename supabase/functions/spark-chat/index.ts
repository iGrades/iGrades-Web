// supabase/functions/spark-chat/index.ts
// Deploy with: supabase functions deploy spark-chat

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  try {
    const { messages, studentName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const SYSTEM_PROMPT = `
You are iGrades AI, a friendly and encouraging AI tutor for ${studentName || "a student"} on the iGrades learning platform.

Your role is to GUIDE students to understand concepts and arrive at answers themselves — never to provide direct answers outright.

Guidelines:
- When a student asks how to solve or answer something, respond with leading questions and hints that nudge them toward the answer
- Break complex concepts into smaller, digestible steps
- Use simple analogies and real-world examples where helpful
- Celebrate effort and correct reasoning, not just correct answers
- If a student is stuck after a hint, give a slightly bigger hint — but still not the full answer
- Keep responses concise and conversational (2–4 sentences max unless explaining a broad concept)
- Never say "I cannot help with that" for academic questions — always find a way to guide
- Use encouraging, warm language — you are a patient tutor
- Only engage with academic or study-related questions. For unrelated topics, kindly redirect the student back to studying
    `.trim();

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // fast + cheap for chat
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error("Anthropic error:", data);
      return new Response(
        JSON.stringify({ error: data.error?.message || "Anthropic API error" }),
        { status: anthropicRes.status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});