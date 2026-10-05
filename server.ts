import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { pointsEngine } from "./server/pointsEngine";
import { registerTranslationRoutes } from "./server/translationEngine";
import { classChangeEngine } from "./server/classChangeEngine";
import { emailService } from "./server/emailNotificationService";
import { subscriptionEngine, type PlanTier } from "./server/subscriptionEngine";

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
  learningContext?: LearningContext,
  effectivePlan: PlanTier = "basic"
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

  // ── FEATURE AREA 2 (SOCRATIC GUIDANCE) & FEATURE AREA 3 (PERSONALIZED SUPPORT) BY TIER ──
  let TIER_PEDAGOGY_INSTRUCTIONS = "";
  if (effectivePlan === "basic") {
    TIER_PEDAGOGY_INSTRUCTIONS = `
[SUBSCRIPTION TIER MANDATE: BASIC (₦0 FREE PLAN)]
1. SPARK SOCRATIC GUIDANCE: LIMITED.
   - You must strictly limit your guidance to Level 1 (Socratic question) and Level 2 (Small hint).
   - DO NOT provide Level 4 concept explanations, Level 5 worked examples, or Level 6 final solutions.
   - If the student requests step-by-step worked solutions or asks you to solve the entire problem, give ONE small starter hint and kindly inform them: "To unlock full step-by-step worked breakdowns and complete Socratic resolutions, ask a parent to upgrade to Standard or Premium on iGrades!"
2. SPARK PERSONALIZED LEARNING SUPPORT: LIMITED / BASIC.
   - Offer only foundational curriculum pointers and broad exam advice.
   - Do NOT provide deep cross-topic diagnostic analysis or elaborate customized learning paths.
`.trim();
  } else if (effectivePlan === "standard") {
    TIER_PEDAGOGY_INSTRUCTIONS = `
[SUBSCRIPTION TIER MANDATE: STANDARD PLAN (₦15,000)]
1. SPARK SOCRATIC GUIDANCE: INCLUDED / GENEROUS.
   - Provide generous adaptive Socratic tutoring across all levels (Level 1 through Level 6), including Level 4 concept explanations, Level 5 worked guidance, and Level 6 final mastery celebrations.
2. SPARK PERSONALIZED LEARNING SUPPORT: PERSONALIZED GUIDANCE & MISCONCEPTION SUPPORT.
   - Actively identify and categorize misconception types (Sign error, Formula selection, Concept misunderstanding, Arithmetic mistake, Misreading question).
   - Address the student's known weak concepts directly and provide tailored study recommendations based on their performance telemetry.
`.trim();
  } else {
    // Premium
    TIER_PEDAGOGY_INSTRUCTIONS = `
[SUBSCRIPTION TIER MANDATE: PREMIUM PLAN (₦25,000)]
1. SPARK SOCRATIC GUIDANCE: ADVANCED.
   - Provide highest-tier cognitive scaffolding, deep step-by-step derivations, analogies, conceptual bridges between related topics, and multi-turn Socratic resolution.
2. SPARK PERSONALIZED LEARNING SUPPORT: ADVANCED PERSONALIZED TUTORING & MISCONCEPTION SUPPORT.
   - Fully integrate the student's complete longitudinal diagnostic profile, readiness scores, and repeated error history.
   - Offer elite personalized tutoring and targeted misconception remediation to guarantee top distinctions (A1 / 300+) in WAEC, JAMB, and NECO exams.
`.trim();
  }

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
  // If Basic plan, do not inject full personalized learning diagnostics
  if (effectivePlan !== "basic") {
    if (perfData?.topicAccuracyPercent !== undefined) {
      STUDENT_LEARNING_PROFILE += `\nRecent Accuracy: ${perfData.topicAccuracyPercent}%`;
    }
    if (perfData?.recentAttemptsCount !== undefined) {
      STUDENT_LEARNING_PROFILE += `\nRecent Attempts: ${perfData.recentAttemptsCount}`;
    }
    if (perfData?.weakTopics && perfData.weakTopics.length > 0) {
      STUDENT_LEARNING_PROFILE += `\nKnown Weak Concepts: ${perfData.weakTopics.join(", ")}`;
    }
    if (perfData?.recentScoreSummary && effectivePlan === "premium") {
      STUDENT_LEARNING_PROFILE += `\nRecent Activity & Diagnostics: ${perfData.recentScoreSummary}`;
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
  } else {
    STUDENT_LEARNING_PROFILE += `\nTier: Basic (Foundational Curriculum Overview)`;
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
    TIER_PEDAGOGY_INSTRUCTIONS,
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
  lastUserMessage?: string,
  effectivePlan: PlanTier = "basic"
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
    
    if (effectivePlan === "basic") {
      return {
        reply: `Hi **${name}**! Let's examine this **${subject}** question on **${topic}**.

You ${studentChoice}. In Nigerian examinations like WAEC and JAMB, this concept tests the primary definition.

Before calculating, what is the core formula or rule that relates the given quantities? *(Note: Upgrade to Standard or Premium for complete step-by-step worked breakdowns!)*`,
        guidanceLevel: 2,
        guidanceLevelName: "Small hint",
        misconceptionType: null,
        studentStatus: "attempting",
      };
    }

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
    if (effectivePlan === "basic") {
      return {
        reply: `I hear you, **${name}**! On the Basic plan, I'm here to provide guiding hints so you develop the skill yourself.

What information has this problem given you so far? *(Tip: Upgrade to Standard or Premium for complete step-by-step worked breakdowns!)*`,
        guidanceLevel: 1,
        guidanceLevelName: "Socratic question",
        misconceptionType: null,
        studentStatus: "attempting",
      };
    }

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

  app.use(express.json({ limit: "15mb" }));
  // Raw body parser for /api/supabase-proxy to capture binary uploads (PDFs, media, octet-stream) up to 150MB
  app.use("/api/supabase-proxy", express.raw({ type: "*/*", limit: "150mb" }));

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

  // Translation route for comprehensive app-wide localization
  registerTranslationRoutes(app);

  // Class Change Requests & Approval API
  app.get("/api/class-change-requests", (req, res) => {
    const { student_id, student_ids, parent_id, status } = req.query as {
      student_id?: string;
      student_ids?: string;
      parent_id?: string;
      status?: string;
    };
    const sIdList = student_ids ? student_ids.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
    const requests = classChangeEngine.getRequests({ student_id, student_ids: sIdList, parent_id, status });
    res.json(requests);
  });

  app.get("/api/class-change-requests/:id", (req, res) => {
    const { id } = req.params;
    const request = classChangeEngine.getRequestById(id);
    if (!request) {
      return res.status(404).json({ error: "Class change request not found" });
    }
    res.json(request);
  });

  app.post("/api/class-change-requests", async (req, res) => {
    try {
      const {
        student_id,
        student_name,
        student_email,
        current_class_name,
        current_class_id,
        requested_class_name,
        requested_class_id,
        reason,
        initiated_by_type,
        initiated_by_user_id,
        parent_id,
        parent_name,
        parent_email,
      } = req.body || {};

      const created = await classChangeEngine.createRequest({
        student_id,
        student_name,
        student_email,
        current_class_name,
        current_class_id,
        requested_class_name,
        requested_class_id,
        reason,
        initiated_by_type,
        initiated_by_user_id,
        parent_id,
        parent_name,
        parent_email,
      });

      res.status(201).json(created);
    } catch (err: any) {
      const msg = err?.message || "Failed to create class change request";
      const isAuthError = msg.toLowerCase().includes("not authorized") || msg.toLowerCase().includes("authorization");
      res.status(isAuthError ? 403 : 400).json({ error: msg });
    }
  });

  app.post("/api/class-change-requests/:id/review", async (req, res) => {
    try {
      const { id } = req.params;
      const { admin_id, admin_name, admin_email, action, review_reason } = req.body || {};

      if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Action must be 'approve' or 'reject'" });
      }

      const updated = await classChangeEngine.reviewRequest({
        requestId: id,
        admin_id: admin_id || "admin",
        admin_name: admin_name || "Administrator",
        admin_email,
        action,
        review_reason,
      });

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || "Failed to review request" });
    }
  });

  // Admin Notifications API
  app.get("/api/admin-notifications", (_req, res) => {
    const notifs = classChangeEngine.getAdminNotifications();
    res.json(notifs);
  });

  app.post("/api/admin-notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const ok = classChangeEngine.markNotificationAsRead(id);
    res.json({ success: ok });
  });

  app.post("/api/admin-notifications/read-all", (_req, res) => {
    classChangeEngine.markAllNotificationsAsRead();
    res.json({ success: true });
  });

  // Email Audit Log API (for admin inspection)
  app.get("/api/email-audit-logs", (_req, res) => {
    res.json(emailService.getLogs());
  });

  // Authoritative Subscription & Entitlement API
  app.get("/api/subscription/status/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
      const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const stRes = await fetch(`${supabaseBase}/rest/v1/students?id=eq.${studentId}&select=id,subscription,subscription_status`, {
        headers: { apikey: sbAnonKey || "", Authorization: `Bearer ${sbAnonKey}` },
      });
      const stData = await stRes.json();
      const student = Array.isArray(stData) && stData.length > 0 ? stData[0] : null;

      const normalized = subscriptionEngine.normalizePlan(student?.subscription, student?.subscription_status);
      res.json({
        student_id: studentId,
        raw_plan: normalized.plan,
        effective_plan: normalized.effectivePlan,
        is_active: normalized.isActive,
        is_expired: normalized.isExpired,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to fetch subscription status" });
    }
  });

  app.post("/api/subscription/verify-access", async (req, res) => {
    try {
      const { student_id, feature, plan, status, params } = req.body || {};
      let effectivePlan = plan;
      if (!effectivePlan && student_id) {
        const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
        const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const stRes = await fetch(`${supabaseBase}/rest/v1/students?id=eq.${student_id}&select=id,subscription,subscription_status`, {
          headers: { apikey: sbAnonKey || "", Authorization: `Bearer ${sbAnonKey}` },
        });
        const stData = await stRes.json();
        const student = Array.isArray(stData) && stData.length > 0 ? stData[0] : null;
        const norm = subscriptionEngine.normalizePlan(student?.subscription, student?.subscription_status);
        effectivePlan = norm.effectivePlan;
      } else {
        effectivePlan = subscriptionEngine.normalizePlan(plan, status).effectivePlan;
      }

      const evaluation = subscriptionEngine.evaluateAccess(effectivePlan || "basic", feature, params);
      res.json(evaluation);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || "Failed to verify access" });
    }
  });

  // Track daily timed quizzes on server
  const serverDailyTimedQuizMap = new Map<string, { count: number; date: string }>();

  function getServerDailyTimedQuizCount(studentId?: string): number {
    if (!studentId) return 0;
    const today = new Date().toISOString().split("T")[0];
    const rec = serverDailyTimedQuizMap.get(studentId);
    if (!rec || rec.date !== today) return 0;
    return rec.count;
  }

  function incrementServerDailyTimedQuizCount(studentId?: string): number {
    if (!studentId) return 0;
    const today = new Date().toISOString().split("T")[0];
    const rec = serverDailyTimedQuizMap.get(studentId);
    const count = (!rec || rec.date !== today ? 0 : rec.count) + 1;
    serverDailyTimedQuizMap.set(studentId, { count, date: today });
    return count;
  }

  app.get("/api/subscription/timed-quizzes-today/:studentId", (req, res) => {
    const { studentId } = req.params;
    const count = getServerDailyTimedQuizCount(studentId);
    res.json({ student_id: studentId, count, max_allowed: 3 });
  });

  app.post("/api/subscription/record-timed-quiz", (req, res) => {
    const { student_id } = req.body || {};
    const count = incrementServerDailyTimedQuizCount(student_id);
    res.json({ success: true, count, max_allowed: 3 });
  });

  // Monthly Exam Quiz Mode attempt tracking and authoritative verification
  const lastExamSessionTimeMap = new Map<string, number>();

  async function getStudentMonthlyExamAttempts(studentId: string): Promise<{
    distinctAttempts: number;
    effectivePlan: PlanTier;
  }> {
    const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
    const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const headers = { apikey: sbAnonKey || "", Authorization: `Bearer ${sbAnonKey || ""}` };

    let effectivePlan: PlanTier = "basic";
    try {
      const studentRes = await fetch(`${supabaseBase}/rest/v1/students?id=eq.${studentId}&select=subscription,subscription_status`, { headers });
      if (studentRes.ok) {
        const rows = await studentRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          effectivePlan = subscriptionEngine.normalizePlan(rows[0].subscription, rows[0].subscription_status).effectivePlan;
        }
      }
    } catch (e) {
      console.warn("Could not fetch student plan:", e);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    let distinctAttempts = 0;
    try {
      const attemptsRes = await fetch(
        `${supabaseBase}/rest/v1/attempts?student_id=eq.${studentId}&mode=eq.examination&started_at=gte.${startOfMonth}&started_at=lte.${endOfMonth}&select=id,started_at&order=started_at.asc`,
        { headers }
      );
      if (attemptsRes.ok) {
        const attempts = await attemptsRes.json();
        if (Array.isArray(attempts) && attempts.length > 0) {
          let lastTime = 0;
          attempts.forEach((a) => {
            const t = new Date(a.started_at || 0).getTime();
            if (t - lastTime > 120000) {
              distinctAttempts++;
              lastTime = t;
            }
          });
        }
      }
    } catch (e) {
      console.warn("Could not query monthly exam attempts:", e);
    }

    return { distinctAttempts, effectivePlan };
  }

  app.get("/api/subscription/exam-usage/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { distinctAttempts, effectivePlan } = await getStudentMonthlyExamAttempts(studentId);
      const evaluation = subscriptionEngine.evaluateExamModeAccess(effectivePlan, distinctAttempts);

      let formattedStatus = "";
      if (effectivePlan === "premium") {
        formattedStatus = "Unlimited exam access";
      } else if (effectivePlan === "standard") {
        formattedStatus = `${distinctAttempts} of 20 exam attempts used`;
      } else {
        formattedStatus = `${distinctAttempts} of 1 exam attempts used`;
      }

      res.json({
        studentId,
        effectivePlan,
        monthlyAttemptsUsed: distinctAttempts,
        maxAllowed: evaluation.maxAllowed,
        allowed: evaluation.allowed,
        formattedStatus,
        reason: evaluation.reason,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to fetch exam usage" });
    }
  });

  // Track daily Spark AI interactions on server
  const serverDailySparkUsageMap = new Map<string, { count: number; date: string }>();

  function getServerDailySparkCount(studentId?: string): number {
    if (!studentId) return 0;
    const today = new Date().toISOString().split("T")[0];
    const rec = serverDailySparkUsageMap.get(studentId);
    if (!rec || rec.date !== today) return 0;
    return rec.count;
  }

  function incrementServerDailySparkCount(studentId?: string): number {
    if (!studentId) return 0;
    const today = new Date().toISOString().split("T")[0];
    const rec = serverDailySparkUsageMap.get(studentId);
    const count = (!rec || rec.date !== today ? 0 : rec.count) + 1;
    serverDailySparkUsageMap.set(studentId, { count, date: today });
    return count;
  }

  app.get("/api/subscription/spark-usage-today/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const count = getServerDailySparkCount(studentId);
      
      const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
      const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      let effectivePlan: PlanTier = "basic";

      try {
        const stRes = await fetch(`${supabaseBase}/rest/v1/students?id=eq.${studentId}&select=subscription,subscription_status`, {
          headers: { apikey: sbAnonKey || "", Authorization: `Bearer ${sbAnonKey}` },
        });
        const stData = await stRes.json();
        const student = Array.isArray(stData) && stData.length > 0 ? stData[0] : null;
        effectivePlan = subscriptionEngine.normalizePlan(student?.subscription, student?.subscription_status).effectivePlan;
      } catch {
        // Fallback to basic
      }

      const limit = effectivePlan === "premium" ? 150 : effectivePlan === "standard" ? 30 : 5;
      res.json({
        student_id: studentId,
        count,
        max_allowed: limit,
        effective_plan: effectivePlan,
        remaining: Math.max(0, limit - count),
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to fetch Spark usage" });
    }
  });

  app.post("/api/subscription/record-spark-usage", (req, res) => {
    const { student_id, plan } = req.body || {};
    const count = incrementServerDailySparkCount(student_id);
    const effectivePlan: PlanTier = plan === "premium" ? "premium" : plan === "standard" ? "standard" : "basic";
    const limit = effectivePlan === "premium" ? 150 : effectivePlan === "standard" ? 30 : 5;
    res.json({ success: true, count, max_allowed: limit, remaining: Math.max(0, limit - count) });
  });

  // Track monthly proctored mock exams on server
  const serverMonthlyProctoredMocksMap = new Map<string, { count: number; month: string }>();

  function getServerMonthlyProctoredMocks(studentId?: string): number {
    if (!studentId) return 0;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const rec = serverMonthlyProctoredMocksMap.get(studentId);
    if (!rec || rec.month !== currentMonth) return 0;
    return rec.count;
  }

  function incrementServerMonthlyProctoredMocks(studentId?: string): number {
    if (!studentId) return 0;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const rec = serverMonthlyProctoredMocksMap.get(studentId);
    const count = (!rec || rec.month !== currentMonth ? 0 : rec.count) + 1;
    serverMonthlyProctoredMocksMap.set(studentId, { count, month: currentMonth });
    return count;
  }

  app.get("/api/subscription/proctored-mocks-count/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const count = getServerMonthlyProctoredMocks(studentId);

      const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
      const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      let effectivePlan: PlanTier = "basic";

      try {
        const stRes = await fetch(`${supabaseBase}/rest/v1/students?id=eq.${studentId}&select=subscription,subscription_status`, {
          headers: { apikey: sbAnonKey || "", Authorization: `Bearer ${sbAnonKey}` },
        });
        const stData = await stRes.json();
        const student = Array.isArray(stData) && stData.length > 0 ? stData[0] : null;
        effectivePlan = subscriptionEngine.normalizePlan(student?.subscription, student?.subscription_status).effectivePlan;
      } catch {
        // Fallback to basic
      }

      const limit = effectivePlan === "premium" ? 25 : effectivePlan === "standard" ? 3 : 0;
      res.json({
        student_id: studentId,
        count,
        max_allowed: limit,
        effective_plan: effectivePlan,
        remaining: Math.max(0, limit - count),
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to fetch proctored mock count" });
    }
  });

  app.post("/api/subscription/record-proctored-mock", (req, res) => {
    const { student_id, plan } = req.body || {};
    const count = incrementServerMonthlyProctoredMocks(student_id);
    const effectivePlan: PlanTier = plan === "premium" ? "premium" : plan === "standard" ? "standard" : "basic";
    const limit = effectivePlan === "premium" ? 25 : effectivePlan === "standard" ? 3 : 0;
    res.json({ success: true, count, max_allowed: limit, remaining: Math.max(0, limit - count) });
  });

  // Supabase proxy route to handle iframe cross-origin requests securely
  app.use("/api/supabase-proxy", async (req, res) => {
    try {
      const urlPath = req.url || "";

      // Security check: Protect student class from direct RPC update tampering
      if (urlPath.includes("/rpc/update_student_profile")) {
        const payload = req.body || {};
        const studentId = payload.p_id;
        if (studentId) {
          const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
          const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
          try {
            const checkRes = await fetch(`${supabaseBase}/rest/v1/students?id=eq.${studentId}&select=class`, {
              headers: { apikey: sbAnonKey || "", Authorization: `Bearer ${sbAnonKey}` },
            });
            const stData = await checkRes.json();
            if (Array.isArray(stData) && stData.length > 0 && stData[0].class) {
              // Lock p_class to existing database class to prevent student self-promotion
              payload.p_class = stData[0].class;
              req.body = payload;
            }
          } catch (e) {
            console.warn("Could not enforce p_class in proxy:", e);
          }
        }
      }

      // Security check: Protect students table from unauthorized class patch
      if (req.method === "PATCH" && urlPath.includes("/rest/v1/students")) {
        if (req.body && typeof req.body === "object" && "class" in req.body) {
          const authHeader = (req.headers["authorization"] as string) || "";
          const isAdmin = authHeader.includes("admin_token") || authHeader.includes("super_admin");
          if (!isAdmin) {
            delete req.body.class;
          }
        }
      }

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

      // Authoritative subscription paywall enforcement
      const studentPlanHeader = (req.headers["x-student-subscription"] as string) || "";
      const studentStatusHeader = (req.headers["x-student-status"] as string) || "";
      const norm = subscriptionEngine.normalizePlan(studentPlanHeader, studentStatusHeader);

      // 1. Authoritative Past Questions gating (Protected 5-year collection: [2026, 2025, 2024, 2023, 2022])
      if (urlPath.includes("/rest/v1/past_questions") && req.method.toUpperCase() === "GET") {
        const yearMatch = urlPath.match(/year=eq\.([^&]+)/);
        if (yearMatch) {
          const reqYear = decodeURIComponent(yearMatch[1]);
          const pqAccess = subscriptionEngine.evaluatePastQuestionAccess(norm.effectivePlan, reqYear);
          if (!pqAccess.allowed) {
            return res.status(403).json({
              error: pqAccess.reason || `Access Denied: Past questions from ${reqYear} require a higher tier subscription.`,
              code: "PAYWALL_RESTRICTION",
              required_plan: pqAccess.requiredPlan,
            });
          }
        }
      }

      // 2. Authoritative Exam Mode attempt gating
      // BASIC: 1 exam-mode attempt per calendar month
      // STANDARD: Up to 20 exam-mode attempts per calendar month
      // PREMIUM: Unlimited access
      const isAttemptInsert =
        (urlPath.includes("/rest/v1/quiz_attempts") || urlPath.includes("/rest/v1/attempts")) &&
        req.method.toUpperCase() === "POST";

      if (isAttemptInsert) {
        const bodyObj = typeof req.body === "object" ? req.body : {};
        const isExamMode = bodyObj.mode === "examination" || bodyObj.quiz_mode === "examination";
        const studentId = (req.headers["x-student-id"] as string) || (bodyObj && bodyObj.student_id ? bodyObj.student_id : "");

        if (isExamMode && studentId) {
          // Check if this attempt is part of an ongoing exam session started within the last 120 seconds
          // (e.g. multi-subject exam sitting where several subject attempts are created in batch)
          const lastSessionTime = lastExamSessionTimeMap.get(studentId) || 0;
          const isOngoingSession = Date.now() - lastSessionTime < 120000;

          if (!isOngoingSession) {
            const { distinctAttempts, effectivePlan } = await getStudentMonthlyExamAttempts(studentId);
            const examAccess = subscriptionEngine.evaluateExamModeAccess(effectivePlan, distinctAttempts);
            if (!examAccess.allowed) {
              return res.status(403).json({
                error: examAccess.reason || "Exam attempt limit reached for this billing period.",
                code: "EXAM_ATTEMPT_LIMIT_REACHED",
                required_plan: examAccess.requiredPlan,
                attempts_used: distinctAttempts,
                max_allowed: examAccess.maxAllowed,
              });
            }
            lastExamSessionTimeMap.set(studentId, Date.now());
          }
        }
      }

      const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
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

      const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (!headers["apikey"] && sbAnonKey) {
        headers["apikey"] = sbAnonKey;
      }
      if (!headers["authorization"] && sbAnonKey) {
        headers["authorization"] = `Bearer ${sbAnonKey}`;
      }

      const method = req.method.toUpperCase();
      let bodyPayload: any = undefined;
      if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        bodyPayload = req.body;
      } else if (typeof req.body === "string" && req.body.trim().length > 0) {
        bodyPayload = req.body;
      } else if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
        bodyPayload = JSON.stringify(req.body);
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && bodyPayload !== undefined) {
        fetchOptions.body = bodyPayload;
        const incomingContentType = req.headers["content-type"];
        if (incomingContentType) {
          headers["content-type"] = incomingContentType;
        } else if (Buffer.isBuffer(bodyPayload)) {
          headers["content-type"] = "application/octet-stream";
        } else {
          headers["content-type"] = "application/json";
        }
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
      const { messages, studentName, gradeLevel, learningContext, student_id } = req.body || {};

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid request: messages array is required." });
      }

      // ── 1. Authoritative Plan & Entitlement Lookup ──
      const studentId = student_id || (req.headers["x-student-id"] as string) || "";
      let effectivePlan: PlanTier = "basic";

      if (studentId) {
        const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
        const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        try {
          const stRes = await fetch(`${supabaseBase}/rest/v1/students?id=eq.${studentId}&select=subscription,subscription_status`, {
            headers: { apikey: sbAnonKey || "", Authorization: `Bearer ${sbAnonKey}` },
          });
          const stData = await stRes.json();
          const student = Array.isArray(stData) && stData.length > 0 ? stData[0] : null;
          if (student) {
            effectivePlan = subscriptionEngine.normalizePlan(student?.subscription, student?.subscription_status).effectivePlan;
          } else if (req.body?.plan) {
            effectivePlan = subscriptionEngine.normalizePlan(req.body.plan).effectivePlan;
          }
        } catch {
          if (req.body?.plan) {
            effectivePlan = subscriptionEngine.normalizePlan(req.body.plan).effectivePlan;
          }
        }
      } else if (req.body?.plan) {
        effectivePlan = subscriptionEngine.normalizePlan(req.body.plan).effectivePlan;
      }

      // ── 2. Feature Area 1: Daily Spark Interaction Limit Enforcement ──
      const dailySparkLimit = effectivePlan === "premium" ? 150 : effectivePlan === "standard" ? 30 : 5;
      const currentCount = getServerDailySparkCount(studentId);

      if (currentCount >= dailySparkLimit) {
        const requiredPlan: PlanTier = effectivePlan === "basic" ? "standard" : "premium";
        const limitReply = effectivePlan === "basic"
          ? "You have completed all 5 daily Spark AI interactions included in the Basic plan! Upgrade to Standard for 30 daily questions, or Premium for generous fair-use access."
          : effectivePlan === "standard"
          ? "You have reached your limit of 30 Spark AI interactions for today on the Standard plan! Upgrade to Premium for highest/generous daily usage subject to fair-use limits."
          : "You have reached today's generous fair-use threshold (150 interactions) for Spark AI tutoring. Your daily usage resets at midnight!";

        return res.status(403).json({
          error: "Daily Spark AI limit reached",
          limitReached: true,
          allowed: false,
          currentCount,
          dailyLimit: dailySparkLimit,
          effectivePlan,
          requiredPlan,
          reply: limitReply,
          content: [{ type: "text", text: limitReply }],
        });
      }

      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

      let ai: GoogleGenAI | null = null;
      try {
        ai = getGenAI();
      } catch (keyErr: any) {
        console.warn("Gemini client key warning, using pedagogical tutor fallback:", keyErr?.message);
      }

      if (ai) {
        // Pass effectivePlan to enforce Feature 2 (Socratic) & Feature 3 (Personalized Support)
        const systemInstruction = buildSystemInstructions(studentName, gradeLevel, learningContext, effectivePlan);

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

          // On successful interaction, increment daily count
          const newCount = incrementServerDailySparkCount(studentId);

          return res.json({
            reply: parsedPayload.reply,
            guidanceLevel: parsedPayload.guidanceLevel,
            guidanceLevelName: parsedPayload.guidanceLevelName,
            misconceptionType: parsedPayload.misconceptionType,
            studentStatus: parsedPayload.studentStatus,
            content: [{ type: "text", text: parsedPayload.reply }],
            sparkUsage: {
              count: newCount,
              dailyLimit: dailySparkLimit,
              effectivePlan,
              remaining: Math.max(0, dailySparkLimit - newCount),
            },
          });
        }
      }

      // Resilient educational fallback (used if API models encounter demand spikes or network outage)
      const fallback = generateResilientTutorReply(studentName, learningContext, lastUserMsg, effectivePlan);
      const newCount = incrementServerDailySparkCount(studentId);

      return res.json({
        reply: fallback.reply,
        guidanceLevel: fallback.guidanceLevel,
        guidanceLevelName: fallback.guidanceLevelName,
        misconceptionType: fallback.misconceptionType,
        studentStatus: fallback.studentStatus,
        content: [{ type: "text", text: fallback.reply }],
        sparkUsage: {
          count: newCount,
          dailyLimit: dailySparkLimit,
          effectivePlan,
          remaining: Math.max(0, dailySparkLimit - newCount),
        },
      });
    } catch (err: any) {
      console.error("Error in /api/spark-chat:", err);
      const fallback = generateResilientTutorReply(req.body?.studentName, req.body?.learningContext, undefined, "basic");
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
