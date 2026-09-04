import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/spark-chat", async (req, res) => {
    try {
      const { messages, studentName, gradeLevel, learningContext } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid request: messages array is required." });
      }

      const ai = getGenAI();
      const systemInstruction = buildSystemInstructions(studentName, gradeLevel, learningContext);

      // Map to Gemini contents format
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || "" }],
      }));

      const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.8-flash"];
      let responseText: string | null = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
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
          console.warn(`Model ${modelName} failed, trying next:`, mErr?.message || mErr);
          lastError = mErr;
        }
      }

      if (!responseText) {
        throw lastError || new Error("Unable to obtain a response from Spark.");
      }

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
    } catch (err: any) {
      console.error("Error in /api/spark-chat:", err);
      return res.status(500).json({
        error: err?.message || "An unexpected error occurred while communicating with Spark.",
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
