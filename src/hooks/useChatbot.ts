"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useLocation } from "react-router-dom";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXCLUDED_PATHS = ["/quiz", "/login", "/auth", "/signin", "/signup"];

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { authdStudent } = useAuthdStudentData();
  const { pathname } = useLocation();

  const studentName = authdStudent?.firstname || "there";
  const isExcluded = EXCLUDED_PATHS.some((p) => pathname?.includes(p));

  // Greet on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hey ${studentName}! 👋 I'm iGrades AI, your AI tutor. Ask me about any concept or question you're struggling with — I won't just give you the answer, but I'll help you think it through!`,
      }]);
    }
  }, [isOpen, studentName, messages.length]);

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

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spark-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            studentName,
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      const data = await response.json();
      const reply =
        data.content?.find((b: any) => b.type === "text")?.text ||
        "Sorry, I couldn't respond right now. Try again!";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hmm, something went wrong on my end. Try asking again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, studentName, isOpen]);

  const clearMessages = useCallback(() => setMessages([]), []);

  const toggleOpen = useCallback(() => setIsOpen((p) => !p), []);

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
    // Refs
    messagesEndRef,
    inputRef,
    // Actions
    setInput,
    sendMessage,
    clearMessages,
    toggleOpen,
    handleKeyDown,
  };
};