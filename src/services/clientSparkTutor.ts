/**
 * Client-Side Resilient Socratic Tutor Engine for Spark AI
 *
 * Ensures that if remote network calls encounter CORS, connectivity limits,
 * or APK isolation on mobile devices, the student always receives an immediate,
 * high-quality Socratic tutor response aligned with the Nigerian curriculum.
 */

export interface TutorReply {
  reply: string;
  guidanceLevel: number;
  guidanceLevelName: string;
  misconceptionType: string | null;
  studentStatus: string;
}

export function generateClientTutorReply(
  studentName?: string,
  userMessage?: string,
  learningContext?: any
): TutorReply {
  const name = studentName ? studentName.trim() : "there";
  const subject = learningContext?.subject || "your studies";
  const topic = learningContext?.topic || learningContext?.subtopic || "this topic";
  const query = (userMessage || "").trim().toLowerCase();

  // 1. If student directly asks for the answer
  const isAskingDirectAnswer =
    query.includes("what is the answer") ||
    query.includes("tell me the answer") ||
    query.includes("give me the answer") ||
    query.includes("solve this for me") ||
    query.includes("which option") ||
    query.includes("just give me the answer");

  if (isAskingDirectAnswer) {
    return {
      reply: `Hi **${name}**! As your Socratic tutor on iGrades, my goal is to help you master this concept yourself so you can ace WAEC and JAMB on exam day!\n\nInstead of jumping straight to the final answer, let's break it down together: What is the primary definition or governing formula for **${topic}**?`,
      guidanceLevel: 1,
      guidanceLevelName: "Socratic question",
      misconceptionType: null,
      studentStatus: "attempting",
    };
  }

  // 2. Greetings or opening chat
  const isGreeting =
    query === "hello" ||
    query === "hi" ||
    query === "hey" ||
    query.startsWith("good morning") ||
    query.startsWith("good afternoon") ||
    query.startsWith("good day") ||
    query.startsWith("hello spark");

  if (isGreeting) {
    return {
      reply: `Hello **${name}**! 👋 I'm **Spark**, your personal AI tutor on iGrades. I'm here to help you understand tough concepts, review quiz questions, and prepare for WAEC, JAMB UTME, and NECO.\n\nWhat subject or question in **${subject}** would you like to explore today?`,
      guidanceLevel: 1,
      guidanceLevelName: "Socratic question",
      misconceptionType: null,
      studentStatus: "attempting",
    };
  }

  // 3. Question context check
  const q = learningContext?.currentQuestion;
  if (q?.questionText) {
    const studentChoice = q.studentAnswer
      ? `your selected option (**${q.studentAnswer}**)`
      : "this question";

    return {
      reply: `Let's examine this **${subject}** question on **${topic}** together!\n\nLooking at ${studentChoice}, remember that in Nigerian examinations, this tests the fundamental principle.\n\nBefore calculating or choosing an option: What are the given values, and what specific formula connects them?`,
      guidanceLevel: 2,
      guidanceLevelName: "Small hint",
      misconceptionType: "Formula selection",
      studentStatus: "progressing",
    };
  }

  // 4. Default curriculum Socratic response
  return {
    reply: `That is a great question about **${topic}** in **${subject}**, **${name}**!\n\nTo build a strong foundation for your exams, let's think about the underlying rule: What key principle or formula in your syllabus comes to mind first when analyzing this?`,
    guidanceLevel: 2,
    guidanceLevelName: "Small hint",
    misconceptionType: null,
    studentStatus: "progressing",
  };
}
