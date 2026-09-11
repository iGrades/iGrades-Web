// supabase/functions/spark-chat/index.ts
// Deploy with: supabase functions deploy spark-chat

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

interface QuestionContext {
  questionNumber?: number;
  questionText: string;
  options?: { [key: string]: string };
  studentAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
}

interface StudentPerformanceContext {
  topicAccuracyPercent?: number;
  recentAttemptsCount?: number;
  recentScoreSummary?: string;
  weakTopics?: string[];
  commonMisconceptions?: string[];
}

interface TutoringState {
  currentGuidanceLevel?: number; // 1 to 6
  guidanceLevelName?: string;
  hintsGiven?: number;
  lastMisconception?: string | null;
  studentStatus?: string;
}

interface LearningContext {
  contextType?: "general_tutor" | "quiz_review" | "topic_study" | "past_questions" | "exam_prep";
  examination?: string;
  gradeLevel?: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  currentQuestion?: QuestionContext;
  performance?: StudentPerformanceContext;
  tutoringState?: TutoringState;
  sourceView?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { messages, studentName, student_id, gradeLevel, learningContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body: messages array required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ── 1. SECURE STUDENT IDENTITY DERIVATION ──
    const authHeader = req.headers.get("Authorization");
    let authenticatedStudentId: string | null = null;
    let verifiedClass: string | null = null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    let supabaseAdmin: any = null;
    if (supabaseUrl && (supabaseServiceRole || supabaseAnonKey)) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole || supabaseAnonKey!);
    }

    // Verify via Supabase Auth JWT if present
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      try {
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          authenticatedStudentId = user.id;
        }
      } catch (_) {
        // Fall through to database verification
      }
    }

    // Fallback: Verify student_id exists in the students table
    if (!authenticatedStudentId && student_id && supabaseAdmin) {
      try {
        const { data: studentRecord } = await supabaseAdmin
          .from("students")
          .select("id, class, grade_level")
          .eq("id", student_id)
          .maybeSingle();

        if (studentRecord) {
          authenticatedStudentId = studentRecord.id;
          verifiedClass = studentRecord.class || studentRecord.grade_level;
        }
      } catch (_) {
        // Continue safely without failing
      }
    }

    // ── 2. COMPACT RECENT LEARNING TELEMETRY (LOW TOKEN OVERHEAD) ──
    let serverPerformance: {
      recentAccuracy?: number;
      recentAttempts?: number;
    } | null = null;

    if (authenticatedStudentId && supabaseAdmin) {
      try {
        const { data: recentAttempts } = await supabaseAdmin
          .from("attempts")
          .select("score, total_questions, completed_at")
          .eq("student_id", authenticatedStudentId)
          .order("completed_at", { ascending: false })
          .limit(3);

        if (recentAttempts && recentAttempts.length > 0) {
          let scored = 0;
          let totalQ = 0;
          for (const att of recentAttempts) {
            scored += Number(att.score) || 0;
            totalQ += Number(att.total_questions) || 0;
          }
          if (totalQ > 0) {
            serverPerformance = {
              recentAccuracy: Math.round((scored / totalQ) * 100),
              recentAttempts: recentAttempts.length,
            };
          }
        }
      } catch (_) {
        // Graceful telemetry fallback
      }
    }

    // Determine target exam based on class if not provided
    const effectiveGradeLevel = gradeLevel || verifiedClass || "SSS 3";
    const defaultExam = effectiveGradeLevel.toUpperCase().includes("JSS") ? "BECE" : "WAEC / JAMB UTME";

    const context: LearningContext | undefined = learningContext || undefined;
    const currentExam = context?.examination || defaultExam;
    const currentSubject = context?.subject || "Academic Curriculum";
    const currentTopic = context?.topic || (context?.subtopic ? `${context.subtopic}` : "General Concept");

    // ── 3. STRUCTURED PROMPT ARCHITECTURE ──

    // Section 1: Core Spark Tutoring Persona & Pedagogy
    const CORE_TUTOR_INSTRUCTIONS = `
You are Spark, the dedicated AI learning companion for ${studentName || "the student"} on iGrades — Nigeria's premier educational platform.
Your mission is to guide students through the Nigerian secondary school curriculum (WAEC, JAMB UTME, NECO SSCE, and BECE).

CRITICAL PEDAGOGICAL MANDATE (YOU ARE A SOCRATIC TUTOR, NOT AN ANSWER MACHINE):
1. NEVER reveal the final answer, option letter, or full numeric solution immediately.
2. If the student asks for the answer or asks "what is the answer to question X?", DO NOT give the direct answer.
3. Instead, follow the progressive adaptive tutoring loop:
   Student attempts / asks question -> Spark evaluates -> Identify misconception -> Provide tailored guidance level -> Ask ONE targeted guiding question -> Student responds -> Re-evaluate and adjust.
4. Tone & Style: Warm, patient, highly encouraging, culturally aligned with Nigerian secondary students. Keep responses concise and focused (1-3 short paragraphs max; avoid intimidating walls of text).
5. Formatting & Presentation:
   - Use standard markdown bold (**concept**) for highlighting key terms.
   - Avoid markdown headers (# or ##) inside chat messages. Use bold text or bullet points instead.
   - When presenting math or science formulas, format them clearly using LaTeX math notation ($V = I \\times R$, $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$).
   - Bullet points (- ) should be short and clean.
6. Academic Focus: Only assist with academic learning and study habits. Politely steer unrelated queries back to their studies.
`.trim();

    const ADAPTIVE_PROGRESSION_INSTRUCTIONS = `
[STRUCTURED GUIDANCE LEVELS (1 TO 6)]
You must dynamically adjust your guidance level based on the student's current response, confusion, and previous hints:
- Level 1 — Socratic question:
  * Probe the student's initial thinking, assumptions, or premise. Do not give hints yet.
- Level 2 — Small hint:
  * Give a gentle conceptual clue pointing toward the governing rule, principle, or formula family without revealing steps or numbers.
- Level 3 — Specific hint:
  * Narrow down the exact formula, algebraic rearrangement, diagram component, or variable to isolate.
- Level 4 — Concept explanation:
  * Explain the underlying mechanism or definition simply using an intuitive analogy or breakdown suitable for Nigerian secondary school students.
- Level 5 — Worked guidance:
  * Walk through a parallel mini-example or scaffold the first concrete calculation step together with the student.
- Level 6 — Final answer & full explanation:
  * ONLY reached when the student has successfully reasoned their way through (celebrate and consolidate their achievement), OR after repeated attempts (Level 4/5) when the student is completely stuck and needs the complete resolution.

[ADAPTATION RULES]
1. Do NOT always begin at the strongest level! For a new problem or question, start at Level 1 or Level 2.
2. Evaluate student status on each turn:
   - If student demonstrates progress / partial understanding: Keep assistance measured (Level 2 or 3) and prompt them to finish the thought.
   - If student is confused, repeats an error, or expresses frustration: Escalate to the next guidance level (e.g. Level 2 -> Level 3 -> Level 4 -> Level 5).
   - If student has solved it or demonstrated clear understanding: Advance to Level 6 (celebrate success, summarize the key takeaway).

[MISCONCEPTION HANDLING & TENTATIVE PHRASING]
When possible, identify the specific mistake category:
- "Sign error" (negative/positive sign error or direction error)
- "Formula selection" (chose wrong formula or rearranged variables incorrectly)
- "Concept misunderstanding" (mixed up fundamental ideas, e.g. series vs parallel, mass vs weight, velocity vs acceleration)
- "Arithmetic mistake" (process correct but calculation slip)
- "Misreading question" (overlooked key terms like "at rest", "not", or missed unit conversions like minutes to seconds)
- "Incorrect assumption" (assumed an unstated condition)
- null (if exploring generally or no error detected)

MANDATORY TENTATIVE PHRASING:
- Do NOT claim certainty when evidence is insufficient.
- ALWAYS use supportive, tentative phrasing:
  "It looks like you may be mixing up..."
  "Could it be that..."
  "Notice how..."
  "Let's look closely at..."
- NEVER use dismissive phrases like "You don't understand..." or "You are wrong".

[STRICT RESPONSE CONSTRAINTS]
1. Ask exactly ONE useful, targeted question at the end (unless at Level 6 celebrating completion).
2. Avoid overwhelming the student with multiple simultaneous questions or instructions.
3. Stay strictly within the current academic topic and subject.
4. Return your output STRICTLY as a JSON object with this schema:
{
  "guidanceLevel": 1 | 2 | 3 | 4 | 5 | 6,
  "guidanceLevelName": "Socratic question" | "Small hint" | "Specific hint" | "Concept explanation" | "Worked guidance" | "Final explanation",
  "misconceptionType": "Sign error" | "Formula selection" | "Concept misunderstanding" | "Arithmetic mistake" | "Misreading question" | "Incorrect assumption" | null,
  "studentStatus": "confused" | "attempting" | "progressing" | "understood",
  "reply": "Warm conversational tutor reply with exactly ONE targeted question at the end"
}
`.trim();

    // Section 2: Educational Context
    const EDUCATIONAL_CONTEXT = `
[CURRICULUM & EXAMINATION CONTEXT]
Target Examination: ${currentExam}
Grade Level / Class: ${effectiveGradeLevel}
Subject: ${currentSubject}
Topic: ${currentTopic}
`.trim();

    // Section 3: Student Learning History & Diagnostic Context
    const perfData = context?.performance;
    const accuracy = perfData?.topicAccuracyPercent ?? serverPerformance?.recentAccuracy;
    const attempts = perfData?.recentAttemptsCount ?? serverPerformance?.recentAttempts;
    const weakAreas = perfData?.weakTopics && perfData.weakTopics.length > 0 ? perfData.weakTopics.join(", ") : null;

    let STUDENT_LEARNING_PROFILE = `
[STUDENT LEARNING PROFILE]
`.trim();
    if (accuracy !== undefined) {
      STUDENT_LEARNING_PROFILE += `\nRecent Accuracy: ${accuracy}%`;
    }
    if (attempts !== undefined) {
      STUDENT_LEARNING_PROFILE += `\nRecent Attempts: ${attempts}`;
    }
    if (weakAreas) {
      STUDENT_LEARNING_PROFILE += `\nKnown Weak Concepts: ${weakAreas}`;
    }
    if (perfData?.recentScoreSummary) {
      STUDENT_LEARNING_PROFILE += `\nRecent Activity: ${perfData.recentScoreSummary}`;
    }

    const tutorState = context?.tutoringState;
    if (tutorState) {
      STUDENT_LEARNING_PROFILE += `\n[ONGOING SESSION TUTORING TELEMETRY]`;
      if (tutorState.currentGuidanceLevel) {
        STUDENT_LEARNING_PROFILE += `\nPrevious Guidance Level: Level ${tutorState.currentGuidanceLevel} (${tutorState.guidanceLevelName || ""})`;
      }
      if (tutorState.hintsGiven !== undefined) {
        STUDENT_LEARNING_PROFILE += `\nHints Given So Far: ${tutorState.hintsGiven}`;
      }
      if (tutorState.lastMisconception) {
        STUDENT_LEARNING_PROFILE += `\nLast Identified Misconception: ${tutorState.lastMisconception}`;
      }
      if (tutorState.studentStatus) {
        STUDENT_LEARNING_PROFILE += `\nLast Student State: ${tutorState.studentStatus}`;
      }
    }

    // Section 4: Current Question / Task Context (Teacher Reference)
    let QUESTION_CONTEXT = "";
    if (context?.currentQuestion) {
      const q = context.currentQuestion;
      const optionsFormatted = q.options
        ? Object.entries(q.options)
            .map(([k, v]) => `   ${k}: ${v}`)
            .join("\n")
        : "   (No multiple choice options provided)";

      QUESTION_CONTEXT = `
[ACTIVE QUESTION & DIAGNOSTIC TEACHER REFERENCE]
Question Text: ${q.questionText}
Options:
${optionsFormatted}
Student's Selected Answer: ${q.studentAnswer || "(Not selected yet / Skipped)"}
${q.correctAnswer ? `[CONFIDENTIAL TEACHER REFERENCE — DO NOT REVEAL TO STUDENT]: Correct Option is ${q.correctAnswer}` : ""}
${q.explanation ? `Curriculum Syllabus Explanation: ${q.explanation}` : ""}

TEACHING NOTE:
Use the correct answer and explanation solely to diagnose why the student's chosen answer (${q.studentAnswer || "unanswered"}) was selected. Do NOT reveal "${q.correctAnswer}" or repeat the official explanation verbatim. Help the student discover the error themselves!
`.trim();
    }

    // Assemble modular system instructions
    const SYSTEM_INSTRUCTIONS = [
      CORE_TUTOR_INSTRUCTIONS,
      ADAPTIVE_PROGRESSION_INSTRUCTIONS,
      EDUCATIONAL_CONTEXT,
      STUDENT_LEARNING_PROFILE,
      QUESTION_CONTEXT,
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");

    // ── 4. AI INTEGRATION WITH MODEL INDEPENDENCE (GEMINI FIRST, ANTHROPIC FALLBACK) ──
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-3.8-flash";

    let replyText = "";
    let guidanceLevel = 2;
    let guidanceLevelName = "Small hint";
    let misconceptionType: string | null = null;
    let studentStatus = "attempting";

    if (geminiApiKey) {
      // Format messages for Google Gemini REST API
      const geminiContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

      const geminiPayload = {
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTIONS }],
        },
        contents: geminiContents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.6,
          maxOutputTokens: 1000,
        },
      };

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok) {
        console.error("Gemini API error:", geminiData);
        // If Gemini has a transient error and Anthropic key is available, fallback below
        if (!anthropicApiKey) {
          return new Response(
            JSON.stringify({ error: geminiData.error?.message || "AI tutor response failed." }),
            { status: geminiRes.status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
      } else {
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            replyText = parsed.reply || rawText;
            guidanceLevel = Number(parsed.guidanceLevel) || 2;
            guidanceLevelName = parsed.guidanceLevelName || "Small hint";
            misconceptionType = parsed.misconceptionType || null;
            studentStatus = parsed.studentStatus || "attempting";
          } else {
            replyText = rawText;
          }
        } catch {
          replyText = rawText;
        }
      }
    }

    // Anthropic Fallback if Gemini wasn't used or failed
    if (!replyText && anthropicApiKey) {
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: SYSTEM_INSTRUCTIONS,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const anthropicData = await anthropicRes.json();

      if (!anthropicRes.ok) {
        console.error("Anthropic fallback error:", anthropicData);
        return new Response(
          JSON.stringify({ error: anthropicData.error?.message || "AI tutor provider error" }),
          { status: anthropicRes.status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const rawAnthropic =
        anthropicData.content?.find((b: any) => b.type === "text")?.text || "";

      try {
        const jsonMatch = rawAnthropic.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          replyText = parsed.reply || rawAnthropic;
          guidanceLevel = Number(parsed.guidanceLevel) || 2;
          guidanceLevelName = parsed.guidanceLevelName || "Small hint";
          misconceptionType = parsed.misconceptionType || null;
          studentStatus = parsed.studentStatus || "attempting";
        } else {
          replyText = rawAnthropic;
        }
      } catch {
        replyText = rawAnthropic;
      }
    }

    if (!replyText) {
      return new Response(
        JSON.stringify({ error: "No AI provider is configured or available." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Standardized response compatible with both content blocks and direct reply
    const responsePayload = {
      reply: replyText,
      guidanceLevel,
      guidanceLevelName,
      misconceptionType,
      studentStatus,
      content: [{ type: "text", text: replyText }],
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("spark-chat function error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
