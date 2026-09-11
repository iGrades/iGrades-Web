"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useLocation } from "react-router-dom";
import { useSparkStore, type TutoringState } from "@/store/useSparkStore";
import { useLearningIntelligence } from "@/services/learningIntelligence";

export interface Message {
  role: "user" | "assistant";
  content: string;
  guidanceLevel?: number;
  guidanceLevelName?: string;
  misconceptionType?: string | null;
  studentStatus?: string;
}

const EXCLUDED_PATHS = ["/login", "/auth", "/signin", "/signup"];

export const useChatbot = () => {
  const { authdStudent } = useAuthdStudentData();
  const studentId = authdStudent?.id || "guest";
  const storageKey = `igrades_spark_chat_${studentId}`;
  const tutorStorageKey = `igrades_spark_tutor_state_${studentId}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(`igrades_spark_chat_${authdStudent?.id || "guest"}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [tutoringState, setTutoringState] = useState<TutoringState>(() => {
    try {
      const stored = localStorage.getItem(`igrades_spark_tutor_state_${authdStudent?.id || "guest"}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      currentGuidanceLevel: 1,
      hintsGiven: 0,
    };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { pathname } = useLocation();

  // Load from localStorage when studentId changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
      const storedTutor = localStorage.getItem(tutorStorageKey);
      if (storedTutor) {
        setTutoringState(JSON.parse(storedTutor));
      }
    } catch {
      // ignore
    }
  }, [storageKey, tutorStorageKey]);

  // Persist messages to localStorage on change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        const trimmed = messages.slice(-50);
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
      }
    } catch (e) {
      console.warn("Could not save Spark chat to localStorage:", e);
    }
  }, [messages, storageKey]);

  // Persist tutoring state on change
  useEffect(() => {
    try {
      localStorage.setItem(tutorStorageKey, JSON.stringify(tutoringState));
    } catch (e) {
      console.warn("Could not save Spark tutoring state to localStorage:", e);
    }
  }, [tutoringState, tutorStorageKey]);

  // Zustand Spark Store
  const isOpen = useSparkStore((s) => s.isOpen);
  const setIsOpen = useSparkStore((s) => s.setIsOpen);
  const toggleOpen = useSparkStore((s) => s.toggleSpark);
  const activeContext = useSparkStore((s) => s.activeContext);
  const clearContext = useSparkStore((s) => s.clearContext);
  const consumePendingPrompt = useSparkStore((s) => s.consumePendingPrompt);

  const studentName = authdStudent?.firstname || "there";
  const studentGradeLevel = authdStudent?.class || authdStudent?.grade_level || "Secondary";
  const isExcluded = !isOpen && EXCLUDED_PATHS.some((p) => pathname?.includes(p));

  // Greet on first open with context awareness
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeContent = `Hey ${studentName}! 👋\nI'm Spark, your iGrades AI learning companion.`;
      
      if (activeContext?.contextType === "quiz_review" && activeContext.currentQuestion) {
        welcomeContent += `\nI see you're reviewing Question ${activeContext.currentQuestion.questionNumber || ""} on ${activeContext.topic || activeContext.subject || "your quiz"}. What part would you like help with? I can provide a hint or diagnose where things went tricky!`;
      } else if (activeContext?.topic) {
        welcomeContent += `\nI see you're studying ${activeContext.topic} (${activeContext.subject || "Academic"}). What concept would you like to master today?`;
      } else {
        welcomeContent += `\nAsk me about any concept or problem you're tackling in your Nigerian curriculum — I won't just spoil the answer, but I'll guide you step-by-step so you truly understand!`;
      }

      setMessages([
        {
          role: "assistant",
          content: welcomeContent,
        },
      ]);
    }
  }, [isOpen, studentName, messages.length, activeContext]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input and clear unread when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const { intelligence } = useLearningIntelligence(authdStudent?.id, authdStudent?.class);

  const executeSend = useCallback(async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const performanceProfile = activeContext?.performance || (intelligence ? {
        topicAccuracyPercent: intelligence.activity?.overallAccuracy ?? 0,
        recentAttemptsCount: intelligence.activity?.practiceSessionsCount ?? 0,
        weakTopics: (intelligence.weakTopics || []).slice(0, 3).map((t) => `${t.topicName} (${t.accuracy}%)`),
        recentScoreSummary: `Overall readiness ${intelligence.readiness?.readinessBand ?? "Learning"} (${intelligence.readiness?.readinessScore ?? 0}%). Strongest: ${(intelligence.strongestSubjects || []).map((s) => s.subjectName).join(", ") || "foundation"}. Repeated mistakes in: ${(intelligence.repeatedMistakes || []).slice(0, 2).map((m) => m.topicName).join(", ") || "None"}.`,
      } : undefined);

      const primaryRec = intelligence?.primaryRecommendation;
      const recommendationProfile = primaryRec
        ? {
            id: primaryRec.id,
            type: primaryRec.type,
            title: primaryRec.title,
            description: primaryRec.description,
            subjectName: primaryRec.subjectName,
            topicName: primaryRec.topicName,
            priority: primaryRec.priority,
            reason: primaryRec.reason,
            sparkPromptHint: primaryRec.sparkPromptHint,
          }
        : undefined;

      const mergedContext = activeContext
        ? { ...activeContext, performance: performanceProfile, tutoringState, recommendation: recommendationProfile }
        : { contextType: "general_tutor" as const, performance: performanceProfile, tutoringState, recommendation: recommendationProfile };

      const payload = {
        student_id: authdStudent?.id || null,
        studentName,
        gradeLevel: studentGradeLevel,
        learningContext: mergedContext,
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      let response: Response | null = null;

      // 1. Try application server /api/spark-chat (powered by Gemini API)
      try {
        const localRes = await fetch("/api/spark-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (localRes.ok) {
          response = localRes;
        }
      } catch {
        // Continue to fallback
      }

      // 2. Fallback to Supabase edge function if local server route is unavailable
      if (!response && import.meta.env.VITE_SUPABASE_URL) {
        response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spark-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response) {
        throw new Error("No chat service available");
      }

      const data = await response.json();
      let reply =
        data.reply ||
        data.content?.find((b: any) => b.type === "text")?.text ||
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.text;

      if (!reply) {
        if (data.error) {
          const errText = typeof data.error === "string" ? data.error : data.error?.message || "";
          if (errText.includes("503") || errText.includes("demand") || errText.includes("UNAVAILABLE")) {
            reply = "I'm experiencing a brief network surge, but I'm right here with you! Let's examine the core concept together: what fundamental formula or definition applies to this question?";
          } else {
            reply = "Let's review this step-by-step together. What key formula or term in the curriculum comes to mind first for this topic?";
          }
        } else {
          reply = "I'm right here! Let's work through this question together: what's the first step or principle we should apply?";
        }
      }

      const guidanceLevel = typeof data.guidanceLevel === "number" ? data.guidanceLevel : undefined;
      const guidanceLevelName = data.guidanceLevelName || undefined;
      const misconceptionType = data.misconceptionType || null;
      const studentStatus = data.studentStatus || undefined;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          guidanceLevel,
          guidanceLevelName,
          misconceptionType,
          studentStatus,
        },
      ]);

      if (guidanceLevel) {
        setTutoringState((prev) => ({
          currentGuidanceLevel: guidanceLevel,
          guidanceLevelName,
          hintsGiven: (prev.hintsGiven || 0) + (guidanceLevel >= 2 && guidanceLevel <= 5 ? 1 : 0),
          lastMisconception: misconceptionType ?? prev.lastMisconception,
          studentStatus: studentStatus || prev.studentStatus,
        }));
      }

      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hmm, something went wrong on my end. Try asking again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, authdStudent?.id, studentName, studentGradeLevel, activeContext, tutoringState, isOpen, intelligence]);

  const sendMessage = useCallback(() => {
    executeSend(input);
  }, [executeSend, input]);

  const sendCustomMessage = useCallback((text: string) => {
    executeSend(text);
  }, [executeSend]);

  const executeSendRef = useRef(executeSend);
  executeSendRef.current = executeSend;

  // Check and consume pending initial prompt when opened
  useEffect(() => {
    if (isOpen) {
      const pending = consumePendingPrompt();
      if (pending) {
        executeSendRef.current(pending);
      }
    }
  }, [isOpen, consumePendingPrompt]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setTutoringState({ currentGuidanceLevel: 1, hintsGiven: 0 });
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(tutorStorageKey);
    } catch {
      // ignore
    }
  }, [storageKey, tutorStorageKey]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return {
    // State
    messages,
    input,
    isLoading,
    isOpen,
    hasUnread,
    isExcluded,
    studentName,
    activeContext,
    tutoringState,
    // Refs
    messagesEndRef,
    inputRef,
    // Actions
    setInput,
    sendMessage,
    sendCustomMessage,
    clearMessages,
    clearContext,
    toggleOpen,
    setIsOpen,
    handleKeyDown,
  };
};