import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { pointsEngine } from "./server/pointsEngine";

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

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function buildSystemInstructions(
  studentName?: string,
  gradeLevel?: string,
  learningContext?: LearningContext
): string {
  const effectiveGradeLevel = gradeLevel || "SSS 3";
  const defaultExam = effectiveGradeLevel.toUpperCase().includes("JSS") ? "BECE" : "WAEC / JAMB UTME";

  const currentExam = learningContext?.examination || defaultExam;
  const currentSubject = learningContext?.subject || "Academic Curriculum";
  const currentTopic = learningContext?.topic || (learningContext?.subtopic ? `${learningContext.subtopic}` : "General Concept");

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

  const EDUCATIONAL_CONTEXT = `
[CURRICULUM & EXAMINATION CONTEXT]
Target Examination: ${currentExam}
Grade Level / Class: ${effectiveGradeLevel}
Subject: ${currentSubject}
Topic: ${currentTopic}
`.trim();

  let STUDENT_LEARNING_PROFILE = `[STUDENT LEARNING PROFILE]`;
  const perfData = learningContext?.performance;
  if (perfData?.topicAccuracyPercent !== undefined) {
    STUDENT_LEARNING_PROFILE += `\nRecent Accuracy: ${perfData.topicAccuracyPercent}%`;
  }
  if (perfData?.recentAttemptsCount !== undefined) {
    STUDENT_LEARNING_PROFILE += `\nRecent Attempts: ${perfData.recentAttemptsCount}`;
  }
  if (perfData?.weakTopics && perfData.weakTopics.length > 0) {
    STUDENT_LEARNING_PROFILE += `\nKnown Weak Concepts: ${perfData.weakTopics.join(", ")}`;
  }
  if (perfData?.recentScoreSummary) {
    STUDENT_LEARNING_PROFILE += `\nRecent Activity: ${perfData.recentScoreSummary}`;
  }

  const tutorState = learningContext?.tutoringState;
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

  const recData = learningContext?.recommendation;
  if (recData) {
    STUDENT_LEARNING_PROFILE += `\n[CURRENT PERSONALIZED STUDY RECOMMENDATION]
- Priority Focus: ${recData.title}
- Recommended Action: ${recData.description}
- Target Subject / Topic: ${recData.subjectName || ""} / ${recData.topicName || ""}
- Priority Level: ${recData.priority}
- Pedagogical Reason: ${recData.reason || ""}
- Socratic Guidance Advice: ${recData.sparkPromptHint || ""}
* TUTORING INSTRUCTION: When the student asks "What should I study next?" or requests study guidance, directly recommend this action. When tutoring on this specific topic, provide extra patient, step-by-step scaffolding.`;
  }

  let QUESTION_CONTEXT = "";
  if (learningContext?.currentQuestion) {
    const q = learningContext.currentQuestion;
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

  return [
    CORE_TUTOR_INSTRUCTIONS,
    ADAPTIVE_PROGRESSION_INSTRUCTIONS,
    EDUCATIONAL_CONTEXT,
    STUDENT_LEARNING_PROFILE,
    QUESTION_CONTEXT,
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

function generateResilientTutorReply(
  studentName?: string,
  learningContext?: LearningContext,
  lastUserMessage?: string
): {
  reply: string;
  guidanceLevel: number;
  guidanceLevelName: string;
  misconceptionType: string | null;
  studentStatus: string;
} {
  const name = studentName ? studentName.trim() : "there";
  const subject = learningContext?.subject || "this subject";
  const topic = learningContext?.topic || learningContext?.subtopic || "this topic";
  const q = learningContext?.currentQuestion;

  if (q?.questionText) {
    const studentChoice = q.studentAnswer ? `selected option **${q.studentAnswer}**` : "looked at this question";
    return {
      reply: `Hi **${name}**! Let's carefully analyze this **${subject}** question on **${topic}** together.

You ${studentChoice}. In Nigerian examinations like WAEC and JAMB, this problem tests how well you recall the core definition or governing principle.

Before calculating or guessing, what is the fundamental formula or rule that relates the given quantities here?`,
      guidanceLevel: 2,
      guidanceLevelName: "Small hint",
      misconceptionType: null,
      studentStatus: "attempting",
    };
  }

  if (lastUserMessage && (lastUserMessage.toLowerCase().includes("answer") || lastUserMessage.toLowerCase().includes("what is"))) {
    return {
      reply: `I hear you, **${name}**! As your Spark AI learning companion, I won't just give you the final answer directly, because mastering the reasoning is what guarantees your distinction in WAEC & JAMB.

Let's break it down together: what information has the question provided, and what is the very first step you take?`,
      guidanceLevel: 1,
      guidanceLevelName: "Socratic question",
      misconceptionType: null,
      studentStatus: "attempting",
    };
  }

  return {
    reply: `Hello **${name}**! I'm here with you on **${subject}** (${topic}).

Every great score starts with a solid grasp of the basics. Which specific part or formula in this section would you like to review first?`,
    guidanceLevel: 2,
    guidanceLevelName: "Small hint",
    misconceptionType: null,
    studentStatus: "attempting",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Dedicated iGG Points & Rewards API Endpoints
  const handleAwardPoints = async (req: express.Request, res: express.Response) => {
    try {
      const { event, student_id, quiz_id, score_percentage } = req.body || {};
      if (!student_id) {
        return res.status(400).json({ error: "student_id is required" });
      }

      if (event === "login") {
        const result = await pointsEngine.awardLogin(student_id);
        return res.json(result);
      } else if (event === "quiz_completion") {
        if (!quiz_id) {
          return res.status(400).json({ error: "quiz_id is required for quiz_completion" });
        }
        const score = typeof score_percentage === "number" ? score_percentage : 50;
        const result = await pointsEngine.awardQuizCompletion(student_id, quiz_id, score);
        return res.json(result);
      } else {
        return res.status(400).json({ error: `Unsupported event type: ${event}` });
      }
    } catch (err: any) {
      console.error("Error in award-points handler:", err);
      return res.status(500).json({ error: err?.message || "Internal points calculation error" });
    }
  };

  app.post("/api/award-points", handleAwardPoints);
  app.post("/functions/v1/award-points", handleAwardPoints);

  app.get("/api/points-data/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const data = await pointsEngine.getStudentPointsData(studentId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Internal error fetching points data" });
    }
  });

  app.post("/api/convert-points", async (req, res) => {
    try {
      const { student_id, points_to_convert } = req.body || {};
      if (!student_id || !points_to_convert) {
        return res.status(400).json({ error: "student_id and points_to_convert are required" });
      }
      const result = await pointsEngine.convertPoints(student_id, Number(points_to_convert));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || "Failed to convert points" });
    }
  });

  app.post("/api/apply-credit", async (req, res) => {
    try {
      const { student_id, invoice_amount, invoice_id } = req.body || {};
      if (!student_id || typeof invoice_amount !== "number") {
        return res.status(400).json({ error: "student_id and invoice_amount are required" });
      }
      const result = await pointsEngine.applyCredit(student_id, invoice_amount, invoice_id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || "Failed to apply credit" });
    }
  });

  // Supabase proxy route to handle iframe cross-origin requests securely
  app.use("/api/supabase-proxy", async (req, res) => {
    try {
      const urlPath = req.url || "";

      // Authoritative interception for iGG points tables & RPCs
      if (urlPath.includes("/functions/v1/award-points") || urlPath.includes("/award-points")) {
        const { event, student_id, quiz_id, score_percentage } = req.body || {};
        if (event === "login") {
          const result = await pointsEngine.awardLogin(student_id);
          return res.json(result);
        } else if (event === "quiz_completion") {
          const result = await pointsEngine.awardQuizCompletion(student_id, quiz_id, score_percentage || 50);
          return res.json(result);
        }
      }

      if (urlPath.includes("/rpc/get_points_balance")) {
        const studentId = req.body?.p_student_id || (req.query?.p_student_id as string);
        const balance = await pointsEngine.getPointsBalanceAsync(studentId);
        return res.json(balance);
      }

      if (urlPath.includes("/rpc/get_credit_balance")) {
        const studentId = req.body?.p_student_id || (req.query?.p_student_id as string);
        const balance = pointsEngine.getCreditBalance(studentId);
        return res.json(balance);
      }

      if (urlPath.includes("/rpc/get_daily_earned_points")) {
        const studentId = req.body?.p_student_id || (req.query?.p_student_id as string);
        const dateStr = req.body?.p_date || (req.query?.p_date as string);
        const daily = pointsEngine.getDailyEarnedPoints(studentId, dateStr);
        return res.json(daily);
      }

      if (urlPath.includes("/rpc/fn_convert_points_to_credit")) {
        const studentId = req.body?.p_student_id;
        const points = Number(req.body?.p_points_to_convert);
        try {
          const result = await pointsEngine.convertPoints(studentId, points);
          return res.json(result);
        } catch (e: any) {
          return res.status(400).json({ error: e.message });
        }
      }

      if (urlPath.includes("/rpc/fn_apply_credit_to_invoice")) {
        const studentId = req.body?.p_student_id;
        const invoiceAmount = Number(req.body?.p_invoice_amount);
        const invoiceId = req.body?.p_invoice_id;
        try {
          const result = await pointsEngine.applyCredit(studentId, invoiceAmount, invoiceId);
          return res.json(result);
        } catch (e: any) {
          return res.status(400).json({ error: e.message });
        }
      }

      if (urlPath.includes("/rest/v1/points_transactions")) {
        const match = urlPath.match(/student_id=eq\.([^&]+)/);
        const studentId = match ? decodeURIComponent(match[1]) : "";
        const data = await pointsEngine.getStudentPointsData(studentId);
        res.setHeader("Content-Range", `0-${data.pointsHistory.length}/${data.pointsHistory.length}`);
        return res.json(data.pointsHistory);
      }

      if (urlPath.includes("/rest/v1/credit_transactions")) {
        const match = urlPath.match(/student_id=eq\.([^&]+)/);
        const studentId = match ? decodeURIComponent(match[1]) : "";
        const data = await pointsEngine.getStudentPointsData(studentId);
        res.setHeader("Content-Range", `0-${data.creditHistory.length}/${data.creditHistory.length}`);
        return res.json(data.creditHistory);
      }

      if (urlPath.includes("/rest/v1/student_streaks")) {
        const match = urlPath.match(/student_id=eq\.([^&]+)/);
        const studentId = match ? decodeURIComponent(match[1]) : "";
        const streak = pointsEngine.getStudentStreak(studentId);
        const accept = req.headers["accept"] || "";
        if (typeof accept === "string" && accept.includes("vnd.pgrst.object+json")) {
          return res.json(streak);
        }
        res.setHeader("Content-Range", "0-1/1");
        return res.json([streak]);
      }
      const supabaseBase = process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
      const targetUrl = new URL(req.url, supabaseBase).toString();

      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        const lower = key.toLowerCase();
        if (!["host", "connection", "content-length", "accept-encoding", "content-type"].includes(lower)) {
          if (typeof value === "string") {
            headers[key] = value;
          } else if (Array.isArray(value)) {
            headers[key] = value.join(", ");
          }
        }
      }

      if (!headers["apikey"] && process.env.VITE_SUPABASE_ANON_KEY) {
        headers["apikey"] = process.env.VITE_SUPABASE_ANON_KEY;
      }
      if (!headers["authorization"] && process.env.VITE_SUPABASE_ANON_KEY) {
        headers["authorization"] = `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const method = req.method.toUpperCase();
      const hasBody =
        req.body &&
        ((typeof req.body === "object" && Object.keys(req.body).length > 0) ||
          (typeof req.body === "string" && req.body.trim().length > 0));

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && hasBody) {
        fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        headers["content-type"] = typeof req.headers["content-type"] === "string" ? req.headers["content-type"] : "application/json";
      }

      const response = await fetch(targetUrl, fetchOptions);

      response.headers.forEach((val, key) => {
        const lower = key.toLowerCase();
        if (!["content-encoding", "content-length", "transfer-encoding"].includes(lower)) {
          res.setHeader(key, val);
        }
      });

      res.status(response.status);
      const arrayBuf = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    } catch (err: any) {
      console.warn("Supabase proxy warning:", err?.message || err);
      res.status(502).json({ error: "Failed to communicate with Supabase", details: err?.message });
    }
  });

  app.post("/api/spark-chat", async (req, res) => {
    try {
      const { messages, studentName, gradeLevel, learningContext } = req.body || {};

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid request: messages array is required." });
      }

      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

      let ai: GoogleGenAI | null = null;
      try {
        ai = getGenAI();
      } catch (keyErr: any) {
        console.warn("Gemini client key warning, using pedagogical tutor fallback:", keyErr?.message);
      }

      if (ai) {
        const systemInstruction = buildSystemInstructions(studentName, gradeLevel, learningContext);

        // Map to Gemini contents format
        const contents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || "" }],
        }));

        const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
        let responseText: string | null = null;

        for (const modelName of candidateModels) {
          // Attempt call with 1 backoff retry on 503 high demand / 429
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const response = await ai.models.generateContent({
                model: modelName,
                contents,
                config: {
                  systemInstruction,
                  responseMimeType: "application/json",
                  temperature: 0.6,
                  maxOutputTokens: 1000,
                },
              });
              if (response?.text) {
                responseText = response.text;
                break;
              }
            } catch (mErr: any) {
              const errMsg = String(mErr?.message || mErr || "");
              const isHighDemand = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429");
              if (isHighDemand && attempt === 0) {
                // Brief 300ms delay before retrying
                await new Promise((resolve) => setTimeout(resolve, 300));
                continue;
              }
              // Proceed to next fallback model
              break;
            }
          }
          if (responseText) {
            break;
          }
        }

        if (responseText) {
          let parsedPayload = {
            reply: responseText,
            guidanceLevel: 2,
            guidanceLevelName: "Small hint",
            misconceptionType: null as string | null,
            studentStatus: "attempting",
          };

          try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const raw = JSON.parse(jsonMatch[0]);
              if (raw.reply) {
                parsedPayload = {
                  reply: raw.reply,
                  guidanceLevel: Number(raw.guidanceLevel) || 2,
                  guidanceLevelName: raw.guidanceLevelName || "Small hint",
                  misconceptionType: raw.misconceptionType || null,
                  studentStatus: raw.studentStatus || "attempting",
                };
              }
            }
          } catch {
            // Fallback to raw text if model output was not strictly parseable
          }

          return res.json({
            reply: parsedPayload.reply,
            guidanceLevel: parsedPayload.guidanceLevel,
            guidanceLevelName: parsedPayload.guidanceLevelName,
            misconceptionType: parsedPayload.misconceptionType,
            studentStatus: parsedPayload.studentStatus,
            content: [{ type: "text", text: parsedPayload.reply }],
          });
        }
      }

      // Resilient educational fallback (used if API models encounter demand spikes or network outage)
      const fallback = generateResilientTutorReply(studentName, learningContext, lastUserMsg);
      return res.json({
        reply: fallback.reply,
        guidanceLevel: fallback.guidanceLevel,
        guidanceLevelName: fallback.guidanceLevelName,
        misconceptionType: fallback.misconceptionType,
        studentStatus: fallback.studentStatus,
        content: [{ type: "text", text: fallback.reply }],
      });
    } catch (err: any) {
      console.error("Error in /api/spark-chat:", err);
      const fallback = generateResilientTutorReply(req.body?.studentName, req.body?.learningContext);
      return res.json({
        reply: fallback.reply,
        guidanceLevel: fallback.guidanceLevel,
        guidanceLevelName: fallback.guidanceLevelName,
        misconceptionType: fallback.misconceptionType,
        studentStatus: fallback.studentStatus,
        content: [{ type: "text", text: fallback.reply }],
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // In Express v5, use *all for wildcard route
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
