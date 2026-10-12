"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  IconButton,
  Image,
} from "@chakra-ui/react";
import {
  IoArrowBack,
  IoSearchOutline,
  IoEllipsisVertical,
  IoHappyOutline,
  IoMicOutline,
  IoAttachOutline,
  IoSend,
  IoPlay,
  IoPause,
  IoClose,
} from "react-icons/io5";
import { useChatbot, type Message } from "@/hooks/useChatbot";
import { useAuthdStudentData } from "@/student-app/context/studentDataContext";
import { useNavigationStore } from "@/store/usenavigationStore";
import logo from "@/assets/logo.png";

// Waveform bar heights array matching Messages-10.png
const WAVEFORM_BARS = [
  6, 10, 16, 22, 14, 8, 20, 26, 18, 12, 24, 16, 8, 22, 18, 10, 24, 16, 12, 20, 8, 14, 6,
];

// Helper to format date like "6th March, 2025"
function formatChatDate(date: Date = new Date()): string {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";

  return `${day}${suffix} ${month}, ${year}`;
}

export const SparkChatPage = () => {
  const {
    messages,
    input,
    isLoading,
    messagesEndRef,
    setInput,
    sendMessage,
    sendCustomMessage,
    sendVoiceMessage,
    clearMessages,
    handleKeyDown,
  } = useChatbot();

  const { authdStudent } = useAuthdStudentData();
  const { setCurrentStudentPage } = useNavigationStore();

  const studentFirstName = authdStudent?.firstname || "Adeeyo";

  // UI state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Audio note playback simulation
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, messagesEndRef]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleStopAndSendVoice = useCallback(() => {
    setIsRecordingVoice(false);
    const secs = Math.max(recordingSeconds, 4);
    const durationStr = `00:${secs < 10 ? `0${secs}` : secs}`;
    sendVoiceMessage(durationStr, "Can you provide Socratic guidance for this problem?");
  }, [recordingSeconds, sendVoiceMessage]);

  const handleCancelVoice = useCallback(() => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  }, []);

  // Audio playback toggle
  const togglePlayAudio = useCallback((index: number) => {
    if (playingMessageIndex === index) {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setPlayingMessageIndex(null);
      setPlaybackSeconds(0);
      return;
    }

    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    setPlayingMessageIndex(index);
    setPlaybackSeconds(0);

    // Play subtle synthetic beep/tone using Web Audio API if available
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // ignore
    }

    audioIntervalRef.current = setInterval(() => {
      setPlaybackSeconds((prev) => {
        if (prev >= 14) {
          if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
          setPlayingMessageIndex(null);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, [playingMessageIndex]);

  // Clean up audio playback interval
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Filter messages if search query is active
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <Box
      w="full"
      h="100dvh"
      maxW="480px"
      mx="auto"
      display="flex"
      flexDirection="column"
      bg="white"
      position="relative"
      overflow="hidden"
    >
      {/* ──────────────── Top Header Bar ──────────────── */}
      <Box
        px={3}
        py={2.5}
        bg="white"
        borderBottom={isSearchOpen ? "1px solid #F1F5F9" : "none"}
        flexShrink={0}
        zIndex={100}
      >
        <Flex align="center" justify="space-between">
          {/* Back Arrow */}
          <IconButton
            aria-label="Back to dashboard"
            variant="ghost"
            p={1.5}
            minW="38px"
            h="38px"
            borderRadius="full"
            color="#1E293B"
            _hover={{ bg: "gray.100" }}
            _active={{ transform: "scale(0.92)" }}
            onClick={() => setCurrentStudentPage("home")}
          >
            <IoArrowBack size={24} />
          </IconButton>

          {/* Center Brand Pill Capsule */}
          <Flex
            align="center"
            gap={2.5}
            bg="#EDF5FE"
            borderRadius="full"
            py={1}
            px={3.5}
            pl={1.5}
            minH="42px"
            maxW="210px"
          >
            {/* Circular Blue Avatar with Logo and Online Indicator */}
            <Box position="relative" flexShrink={0}>
              <Box
                w="32px"
                h="32px"
                borderRadius="full"
                bg="#206CE1"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                p={1.5}
                boxShadow="0 2px 6px rgba(32, 108, 225, 0.25)"
              >
                <Image
                  src={logo}
                  alt="iGrade Logo"
                  w="20px"
                  h="20px"
                  objectFit="contain"
                  filter="brightness(0) invert(1)"
                />
              </Box>
              {/* Online Green Indicator Dot */}
              <Box
                position="absolute"
                bottom="-1px"
                right="-1px"
                w="8.5px"
                h="8.5px"
                borderRadius="full"
                bg="#22C55E"
                border="1.5px solid white"
              />
            </Box>

            {/* Brand Title & Subtitle */}
            <Box textAlign="left" overflow="hidden">
              <Text
                fontSize="13.5px"
                fontWeight="700"
                color="#0F172A"
                lineHeight="1.2"
                truncate
              >
                iGrade AI
              </Text>
              <Text
                fontSize="10px"
                fontWeight="400"
                color="#94A3B8"
                lineHeight="1.2"
                truncate
              >
                AI Chat Assistance
              </Text>
            </Box>
          </Flex>

          {/* Right Header Actions */}
          <HStack gap={0.5}>
            <IconButton
              aria-label="Search chat"
              variant="ghost"
              p={1.5}
              minW="36px"
              h="36px"
              borderRadius="full"
              color="#1E293B"
              _hover={{ bg: "gray.100" }}
              _active={{ transform: "scale(0.92)" }}
              onClick={() => {
                setIsSearchOpen((prev) => !prev);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
            >
              <IoSearchOutline size={21} />
            </IconButton>

            <Box position="relative">
              <IconButton
                aria-label="More options"
                variant="ghost"
                p={1.5}
                minW="36px"
                h="36px"
                borderRadius="full"
                color="#1E293B"
                _hover={{ bg: "gray.100" }}
                _active={{ transform: "scale(0.92)" }}
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              >
                <IoEllipsisVertical size={20} />
              </IconButton>

              {/* More Dropdown Menu */}
              {isMoreMenuOpen && (
                <Box
                  position="absolute"
                  top="44px"
                  right="0"
                  w="190px"
                  bg="white"
                  borderRadius="16px"
                  boxShadow="0 10px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)"
                  border="1px solid #E2E8F0"
                  py={1.5}
                  zIndex={200}
                >
                  <Box
                    as="button"
                    w="full"
                    textAlign="left"
                    px={3.5}
                    py={2.5}
                    fontSize="13.5px"
                    fontWeight="500"
                    color="#DC2626"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    _hover={{ bg: "red.50" }}
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsClearModalOpen(true);
                    }}
                  >
                    Clear Chat
                  </Box>
                  <Box
                    as="button"
                    w="full"
                    textAlign="left"
                    px={3.5}
                    py={2.5}
                    fontSize="13.5px"
                    fontWeight="500"
                    color="#1E293B"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      sendCustomMessage("Can you give me a small hint for my latest curriculum topic?");
                    }}
                  >
                    Ask for a Hint
                  </Box>
                  <Box
                    as="button"
                    w="full"
                    textAlign="left"
                    px={3.5}
                    py={2.5}
                    fontSize="13.5px"
                    fontWeight="500"
                    color="#1E293B"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setCurrentStudentPage("rewards");
                    }}
                  >
                    View IGG Points
                  </Box>
                </Box>
              )}
            </Box>
          </HStack>
        </Flex>

        {/* Collapsible Search Bar */}
        {isSearchOpen && (
          <Flex align="center" gap={2} mt={2} px={1}>
            <Box
              flex={1}
              bg="#F8FAFC"
              borderRadius="full"
              px={3}
              py={1.5}
              border="1px solid #E2E8F0"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <IoSearchOutline size={16} color="#94A3B8" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in this conversation..."
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "13px",
                  color: "#0F172A",
                }}
              />
              {searchQuery && (
                <IconButton
                  aria-label="Clear search"
                  variant="ghost"
                  size="xs"
                  p={0.5}
                  minW="18px"
                  h="18px"
                  onClick={() => setSearchQuery("")}
                >
                  <IoClose size={14} color="#94A3B8" />
                </IconButton>
              )}
            </Box>
            <Button
              size="xs"
              variant="ghost"
              color="#64748B"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
            >
              Cancel
            </Button>
          </Flex>
        )}
      </Box>

      {/* ──────────────── Main Canvas / Chat Area ──────────────── */}
      <Box
        flex={1}
        overflowY="auto"
        display="flex"
        flexDirection="column"
        position="relative"
        bg="white"
        px={4}
        py={2}
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          MsOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        onClick={() => {
          if (isMoreMenuOpen) setIsMoreMenuOpen(false);
          if (isEmojiPickerOpen) setIsEmojiPickerOpen(false);
        }}
      >
        {/* ── EMPTY STATE (Messages-1.png) ── */}
        {messages.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            my="auto"
            py={6}
            textAlign="center"
          >
            {/* Stylized Chat Bubble Icon Illustration */}
            <Box mb={6} position="relative">
              {/* Top Card: Light Periwinkle */}
              <Box
                w="108px"
                h="54px"
                bg="#C7DDFD"
                borderRadius="14px"
                p="13px 12px"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                boxShadow="0 2px 8px rgba(199, 221, 253, 0.4)"
              >
                <Box w="38px" h="6.5px" bg="white" borderRadius="full" />
                <Box w="56px" h="6.5px" bg="white" borderRadius="full" />
              </Box>

              {/* Bottom Card: Darker Sky Blue shifted to right */}
              <Box
                w="62px"
                h="30px"
                bg="#88B8FB"
                borderRadius="10px"
                p="11px 10px"
                display="flex"
                alignItems="center"
                position="relative"
                mt="-6px"
                ml="40px"
                boxShadow="0 4px 10px rgba(136, 184, 251, 0.4)"
              >
                <Box w="32px" h="5.5px" bg="white" borderRadius="full" />
              </Box>
            </Box>

            {/* Gradient Greeting Heading */}
            <Text
              as="h2"
              fontSize={{ base: "26px", sm: "28px" }}
              fontWeight="800"
              letterSpacing="-0.02em"
              lineHeight="1.2"
              style={{
                background: "linear-gradient(90deg, #2563EB 0%, #8B5CF6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hello {studentFirstName},
            </Text>

            {/* Subtitle */}
            <Text
              fontSize="15px"
              fontWeight="400"
              color="#94A3B8"
              mt={2}
              letterSpacing="-0.01em"
            >
              What can I help with?
            </Text>

            {/* Subtle Starter Prompts */}
            <Flex wrap="wrap" justify="center" gap={2} mt={8} maxW="320px">
              {[
                "💡 Give me a hint",
                "📐 Solve step-by-step",
                "📚 Review difficult topic",
              ].map((chip, idx) => (
                <Box
                  key={idx}
                  as="button"
                  px={3.5}
                  py={1.5}
                  borderRadius="full"
                  bg="#F8FAFC"
                  border="1px solid #E2E8F0"
                  fontSize="12px"
                  fontWeight="500"
                  color="#475569"
                  _hover={{ bg: "#EDF5FE", color: "#2563EB", borderColor: "#BFDBFE" }}
                  _active={{ transform: "scale(0.96)" }}
                  transition="all 0.15s ease"
                  onClick={() => sendCustomMessage(chip)}
                >
                  {chip}
                </Box>
              ))}
            </Flex>
          </Flex>
        ) : (
          /* ── ACTIVE CHAT FEED (Messages-10.png) ── */
          <Flex direction="column" gap={4} py={2}>
            {/* Date Separator */}
            <Flex align="center" justify="center" my={2} position="relative">
              <Box position="absolute" left="0" right="0" height="1px" bg="#E5E7EB" />
              <Box
                position="relative"
                bg="white"
                px={3}
                fontSize="11.5px"
                fontWeight="400"
                color="#94A3B8"
              >
                {formatChatDate()}
              </Box>
            </Flex>

            {/* Messages Loop */}
            {filteredMessages.map((msg: Message, i: number) => {
              const isUser = msg.role === "user";
              const isAudio = msg.type === "audio";
              const timestamp = msg.timestamp || "12:00 AM";

              return (
                <Box
                  key={i}
                  display="flex"
                  flexDirection="column"
                  alignItems={isUser ? "flex-end" : "flex-start"}
                  w="full"
                >
                  {isAudio ? (
                    /* ── User Audio Note Message Bubble ── */
                    <Box
                      bg="#2563EB"
                      borderRadius="28px"
                      py={2}
                      px={3.5}
                      display="flex"
                      alignItems="center"
                      gap={3}
                      maxW="82%"
                      boxShadow="0 4px 14px rgba(37, 99, 235, 0.2)"
                    >
                      {/* White circular play/pause button */}
                      <Box
                        as="button"
                        w="32px"
                        h="32px"
                        borderRadius="full"
                        bg="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        cursor="pointer"
                        flexShrink={0}
                        _active={{ transform: "scale(0.92)" }}
                        onClick={() => togglePlayAudio(i)}
                      >
                        {playingMessageIndex === i ? (
                          <IoPause size={15} color="#2563EB" />
                        ) : (
                          <Box ml="2px" display="flex" alignItems="center">
                            <IoPlay size={15} color="#2563EB" />
                          </Box>
                        )}
                      </Box>

                      {/* Waveform Visualization Bars */}
                      <Flex align="center" gap="2.5px" h="28px">
                        {WAVEFORM_BARS.map((height, barIdx) => {
                          const isBarActive =
                            playingMessageIndex === i &&
                            barIdx < (playbackSeconds / 14) * WAVEFORM_BARS.length;

                          return (
                            <Box
                              key={barIdx}
                              w="2.5px"
                              h={`${height}px`}
                              borderRadius="full"
                              bg={isBarActive ? "#93C5FD" : "white"}
                              opacity={isBarActive ? 1 : 0.85}
                              transition="all 0.15s ease"
                            />
                          );
                        })}
                      </Flex>

                      {/* Duration string */}
                      <Text
                        fontSize="11.5px"
                        fontWeight="600"
                        color="white"
                        minW="34px"
                        textAlign="right"
                        letterSpacing="-0.01em"
                      >
                        {playingMessageIndex === i
                          ? `00:${playbackSeconds < 10 ? `0${playbackSeconds}` : playbackSeconds}`
                          : msg.audioDuration || "00:14"}
                      </Text>
                    </Box>
                  ) : (
                    /* ── Standard Text Message Bubble ── */
                    <Box
                      maxW="82%"
                      p="13px 17px"
                      borderRadius="22px"
                      bg={isUser ? "#2563EB" : "#F1F5F9"}
                      color={isUser ? "white" : "#1E293B"}
                      fontSize="14px"
                      lineHeight="1.55"
                      boxShadow={
                        isUser
                          ? "0 4px 14px rgba(37, 99, 235, 0.2)"
                          : "none"
                      }
                      letterSpacing="-0.01em"
                    >
                      {isUser ? (
                        <Text whiteSpace="pre-wrap">{msg.content}</Text>
                      ) : (
                        <Markdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({ children }) => (
                              <p style={{ margin: "0 0 6px 0", lineHeight: 1.55 }}>
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong style={{ fontWeight: 700, color: "#0F172A" }}>
                                {children}
                              </strong>
                            ),
                            ul: ({ children }) => (
                              <ul style={{ paddingLeft: "18px", margin: "4px 0 6px" }}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol style={{ paddingLeft: "18px", margin: "4px 0 6px" }}>
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li style={{ margin: "2px 0" }}>{children}</li>
                            ),
                            code: ({ children, inline }: any) =>
                              inline ? (
                                <code
                                  style={{
                                    background: "#E2E8F0",
                                    padding: "1px 5px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre
                                  style={{
                                    background: "#0F172A",
                                    color: "#F8FAFC",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    overflowX: "auto",
                                    fontSize: "12px",
                                    margin: "6px 0",
                                  }}
                                >
                                  <code>{children}</code>
                                </pre>
                              ),
                          }}
                        >
                          {msg.content
                            .replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$")
                            .replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$$1$$$$$")}
                        </Markdown>
                      )}
                    </Box>
                  )}

                  {/* Timestamp below bubble */}
                  <Text
                    fontSize="11px"
                    fontWeight="400"
                    color="#94A3B8"
                    mt="4px"
                    px="4px"
                    letterSpacing="-0.01em"
                  >
                    {timestamp}
                  </Text>
                </Box>
              );
            })}

            {/* AI Thinking / Typing Indicator Bubble (Messages-10.png) */}
            {isLoading && (
              <Box display="flex" flexDirection="column" alignItems="flex-start" w="full">
                <Box
                  bg="#F1F5F9"
                  borderRadius="20px"
                  py="12px"
                  px="18px"
                  display="flex"
                  alignItems="center"
                  gap="4px"
                >
                  <Box
                    w="7px"
                    h="7px"
                    borderRadius="full"
                    bg="#94A3B8"
                    animation="pulse 1.2s infinite ease-in-out"
                    style={{ animationDelay: "0ms" }}
                  />
                  <Box
                    w="7px"
                    h="7px"
                    borderRadius="full"
                    bg="#94A3B8"
                    animation="pulse 1.2s infinite ease-in-out"
                    style={{ animationDelay: "200ms" }}
                  />
                  <Box
                    w="7px"
                    h="7px"
                    borderRadius="full"
                    bg="#94A3B8"
                    animation="pulse 1.2s infinite ease-in-out"
                    style={{ animationDelay: "400ms" }}
                  />
                </Box>
                <Text
                  fontSize="11px"
                  fontWeight="400"
                  color="#94A3B8"
                  mt="4px"
                  px="4px"
                >
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Flex>
        )}
      </Box>

      {/* ──────────────── Emoji & Shortcuts Palette Drawer ──────────────── */}
      {isEmojiPickerOpen && (
        <Box
          bg="#F8FAFC"
          borderTop="1px solid #E2E8F0"
          p={3}
          flexShrink={0}
        >
          <Flex wrap="wrap" gap={1.5} justify="center">
            {[
              "💡 Hint",
              "📐 Formula",
              "🔍 Error check",
              "📚 WAEC Math",
              "🧪 JAMB Science",
              "👍 Got it!",
              "🤔 Unsure",
              "✏️ Practice question",
            ].map((shortcut, idx) => (
              <Box
                key={idx}
                as="button"
                px={3}
                py={1.5}
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="full"
                fontSize="12px"
                fontWeight="500"
                color="#334155"
                _hover={{ bg: "#EDF5FE", color: "#2563EB", borderColor: "#BFDBFE" }}
                _active={{ transform: "scale(0.95)" }}
                onClick={() => {
                  setIsEmojiPickerOpen(false);
                  sendCustomMessage(shortcut);
                }}
              >
                {shortcut}
              </Box>
            ))}
          </Flex>
        </Box>
      )}

      {/* ──────────────── Bottom Input Bar (Messages-1.png & Messages-10.png) ──────────────── */}
      <Box
        px={{ base: 3.5, sm: 4 }}
        pt={2}
        pb="max(env(safe-area-inset-bottom, 12px), 12px)"
        bg="white"
        flexShrink={0}
      >
        {isRecordingVoice ? (
          /* Live Voice Recording Pill Mode */
          <Flex
            align="center"
            justify="space-between"
            bg="#EFF6FF"
            border="1.5px solid #BFDBFE"
            borderRadius="28px"
            h="52px"
            px={4}
          >
            <HStack gap={2.5}>
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg="#EF4444"
                animation="ping 1s cubic-bezier(0, 0, 0.2, 1) infinite"
              />
              <Text fontSize="13.5px" fontWeight="600" color="#1E40AF">
                Recording audio question… 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
              </Text>
            </HStack>

            <HStack gap={1.5}>
              <Button
                size="xs"
                variant="ghost"
                color="#64748B"
                onClick={handleCancelVoice}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                bg="#2563EB"
                color="white"
                borderRadius="full"
                px={3}
                onClick={handleStopAndSendVoice}
              >
                Send Note
              </Button>
            </HStack>
          </Flex>
        ) : (
          /* Standard Input Bar (Pill + Standalone Squircle Send Button) */
          <Flex align="center" gap={2.5}>
            {/* Elongated Input Pill */}
            <Flex
              flex={1}
              align="center"
              bg="#F8FAFC"
              border="1px solid #E2E8F0"
              borderRadius="28px"
              h="52px"
              px={3.5}
              gap={2.5}
            >
              {/* Left Emoji/Smiley Icon Button */}
              <IconButton
                aria-label="Insert emoji or shortcut"
                variant="ghost"
                minW="28px"
                h="28px"
                p={0}
                color="#3B82F6"
                _hover={{ bg: "transparent" }}
                _active={{ transform: "scale(0.9)" }}
                onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
              >
                <IoHappyOutline size={22} />
              </IconButton>

              {/* Text Input Field */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown as any}
                placeholder="Type message here"
                disabled={isLoading}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  color: "#0F172A",
                  lineHeight: "1.5",
                  letterSpacing: "-0.01em",
                }}
              />

              {/* Right Inside Pill: Microphone Icon */}
              <IconButton
                aria-label="Record voice note"
                variant="ghost"
                minW="28px"
                h="28px"
                p={0}
                color="#3B82F6"
                _hover={{ bg: "transparent" }}
                _active={{ transform: "scale(0.9)" }}
                onClick={() => setIsRecordingVoice(true)}
              >
                <IoMicOutline size={22} />
              </IconButton>

              {/* Right Inside Pill: Attachment / Paperclip Icon */}
              <IconButton
                aria-label="Attach homework photo or file"
                variant="ghost"
                minW="28px"
                h="28px"
                p={0}
                color="#3B82F6"
                _hover={{ bg: "transparent" }}
                _active={{ transform: "scale(0.9)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <IoAttachOutline size={22} />
              </IconButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    sendCustomMessage(`I attached a file: ${file.name}. Can you help explain or solve it?`);
                  }
                }}
              />
            </Flex>

            {/* Standalone Squircle Send Button (Messages-1.png & Messages-10.png) */}
            <Box
              as="button"
              w="50px"
              h="50px"
              borderRadius="18px"
              bg="#2563EB"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              boxShadow="0 4px 14px rgba(37, 99, 235, 0.28)"
              cursor="pointer"
              transition="all 0.15s ease"
              _hover={{ bg: "#1D4ED8" }}
              _active={{ transform: "scale(0.93)" }}
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              opacity={input.trim() ? 1 : 0.9}
            >
              <Box transform="rotate(-15deg)" ml="2px">
                <IoSend size={20} color="white" />
              </Box>
            </Box>
          </Flex>
        )}
      </Box>

      {/* ──────────────── CLEAR CHAT BOTTOM SHEET MODAL (Messages-13.png) ──────────────── */}
      {isClearModalOpen && (
        <>
          {/* Dimmed Overlay Backdrop */}
          <Box
            position="fixed"
            inset="0"
            bg="rgba(15, 23, 42, 0.45)"
            backdropFilter="blur(2px)"
            zIndex={2000}
            onClick={() => setIsClearModalOpen(false)}
          />

          {/* Slide-Up Bottom Sheet */}
          <Box
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            maxW="480px"
            mx="auto"
            bg="white"
            borderTopRadius="36px"
            zIndex={2001}
            px={{ base: 6, sm: 8 }}
            pb={{ base: 8, sm: 10 }}
            pt={3}
            boxShadow="0 -10px 40px rgba(0, 0, 0, 0.15)"
          >
            {/* Iconic Circular Exclamation Badge in Cutout */}
            <Box position="relative" mt="-48px" mb={3} display="flex" justifyContent="center">
              {/* Outer Soft Pink Ring with White Cutout Border */}
              <Box
                w="86px"
                h="86px"
                borderRadius="full"
                bg="#FEE2E2"
                border="6px solid white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 14px rgba(0, 0, 0, 0.08)"
              >
                {/* Inner Bright Red Circle Outline */}
                <Box
                  w="56px"
                  h="56px"
                  borderRadius="full"
                  border="3px solid #EF4444"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Exclamation Mark */}
                  <Text
                    fontSize="28px"
                    fontWeight="900"
                    color="#EF4444"
                    lineHeight="1"
                    fontFamily="inherit"
                  >
                    !
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Modal Title */}
            <Text
              fontSize="21px"
              fontWeight="800"
              color="#0F172A"
              textAlign="center"
              letterSpacing="-0.02em"
              mt={1}
            >
              Clear Chat?
            </Text>

            {/* Modal Subtitle */}
            <Text
              fontSize="14px"
              fontWeight="400"
              color="#475569"
              textAlign="center"
              mt={1.5}
              mb={7}
              letterSpacing="-0.01em"
            >
              You are about to clear this chat.
            </Text>

            {/* Side-by-Side Pill Action Buttons */}
            <Flex gap={3.5} w="full">
              {/* Cancel Button */}
              <Button
                flex={1}
                h="50px"
                borderRadius="full"
                bg="white"
                border="1.5px solid #2563EB"
                color="#2563EB"
                fontSize="15px"
                fontWeight="700"
                letterSpacing="-0.01em"
                _hover={{ bg: "#EFF6FF" }}
                _active={{ transform: "scale(0.97)" }}
                onClick={() => setIsClearModalOpen(false)}
              >
                Cancel
              </Button>

              {/* Proceed Button */}
              <Button
                flex={1}
                h="50px"
                borderRadius="full"
                bg="#2563EB"
                color="white"
                fontSize="15px"
                fontWeight="700"
                letterSpacing="-0.01em"
                boxShadow="0 4px 14px rgba(37, 99, 235, 0.3)"
                _hover={{ bg: "#1D4ED8" }}
                _active={{ transform: "scale(0.97)" }}
                onClick={() => {
                  clearMessages();
                  setIsClearModalOpen(false);
                }}
              >
                Proceed
              </Button>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SparkChatPage;
