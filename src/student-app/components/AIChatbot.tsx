"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useChatbot } from "../../hooks/useChatbot";

interface SparkMessageContentProps {
  content: string;
  isUser: boolean;
}

const SparkMessageContent = ({ content, isUser }: SparkMessageContentProps) => {
  if (isUser) {
    return <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  // Normalize LaTeX delimiters: convert \( ... \) to $...$ and \[ ... \] to $$...$$
  const formattedContent = content
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');

  return (
    <div className="spark-markdown">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p style={{ margin: "0 0 7px 0" }}>{children}</p>,
          strong: ({ children }) => <strong style={{ fontWeight: 650, color: "#0f172a" }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
          h1: ({ children }) => <div style={{ fontWeight: 700, fontSize: "14px", margin: "8px 0 4px", color: "#0f172a" }}>{children}</div>,
          h2: ({ children }) => <div style={{ fontWeight: 700, fontSize: "13.5px", margin: "8px 0 4px", color: "#0f172a" }}>{children}</div>,
          h3: ({ children }) => <div style={{ fontWeight: 700, fontSize: "13px", margin: "6px 0 3px", color: "#0f172a" }}>{children}</div>,
          ul: ({ children }) => <ul style={{ paddingLeft: "18px", margin: "4px 0 7px", listStyleType: "disc" }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: "18px", margin: "4px 0 7px", listStyleType: "decimal" }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: "3px solid #818cf8", paddingLeft: "8px", margin: "6px 0", color: "#475569", fontStyle: "italic" }}>
              {children}
            </blockquote>
          ),
          code: ({ children, inline }: any) =>
            inline ? (
              <code style={{ background: "#e2e8f0", padding: "1px 5px", borderRadius: "4px", fontFamily: "monospace", fontSize: "11.5px", color: "#1e293b" }}>
                {children}
              </code>
            ) : (
              <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "8px 10px", borderRadius: "6px", overflowX: "auto", margin: "6px 0", fontSize: "11.5px" }}>
                <code>{children}</code>
              </pre>
            ),
        }}
      >
        {formattedContent}
      </Markdown>
    </div>
  );
};

export const AIChatbot = () => {
  const {
    messages, input, isLoading, isOpen, hasUnread, isExcluded,
    messagesEndRef, inputRef,
    activeContext,
    setInput, sendMessage, sendCustomMessage, clearMessages, clearContext, toggleOpen, handleKeyDown,
  } = useChatbot();

  if (isExcluded) return null;

  // Context summary label
  const contextParts = [
    activeContext?.examination,
    activeContext?.subject,
    activeContext?.topic,
    activeContext?.currentQuestion?.questionNumber ? `Q${activeContext.currentQuestion.questionNumber}` : null,
  ].filter(Boolean);

  const quickPrompts = activeContext?.currentQuestion
    ? [
        { label: "💡 Give me a hint", prompt: "Could you give me a small hint to think through this question without spoiling the final answer?" },
        { label: "🔍 Where did I go wrong?", prompt: "I picked my answer, but can you help diagnose why that reasoning might be incorrect?" },
        { label: "📝 What's the key concept?", prompt: "What core formula or concept from the curriculum should I apply to solve this?" },
      ]
    : activeContext?.topic
    ? [
        { label: "💡 Core breakdown", prompt: `Can you break down the most essential ideas in ${activeContext.topic}?` },
        { label: "🎯 Common exam traps", prompt: `What are common mistakes students make in ${activeContext.topic} in ${activeContext.examination || "national"} exams?` },
        { label: "❓ Ask me a question", prompt: `Give me a short practice question on ${activeContext.topic} to test my understanding.` },
      ]
    : [
        { label: "🎯 What should I study next?", prompt: "What should I study next based on my current progress and exam readiness?" },
        { label: "💡 How should I study?", prompt: "What is an effective way to study and retain difficult topics for my exams?" },
        { label: "📝 Help me solve a problem", prompt: "I have an academic problem I need step-by-step guidance on." },
      ];

  return (
    <>
      <style>{`
        @keyframes sparkPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-5px); }
        }
        .spark-msg { animation: msgFadeIn 0.22s ease forwards; }
        .spark-dot:nth-child(1) { animation: dotBounce 1.1s infinite 0s; }
        .spark-dot:nth-child(2) { animation: dotBounce 1.1s infinite 0.18s; }
        .spark-dot:nth-child(3) { animation: dotBounce 1.1s infinite 0.36s; }
        .spark-scroll::-webkit-scrollbar       { width: 4px; }
        .spark-scroll::-webkit-scrollbar-track { background: transparent; }
        .spark-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .spark-input:focus { outline: none; }
        .spark-input::placeholder { color: #a0aec0; }
        .spark-markdown p { margin-bottom: 7px; }
        .spark-markdown p:last-child { margin-bottom: 0; }
        .spark-markdown .katex-display { margin: 6px 0; overflow-x: auto; overflow-y: hidden; }
        .spark-markdown .katex { font-size: 1.05em; }
      `}</style>

      {/* ── Chat panel ── */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "88px", right: "24px",
          width: "min(380px, calc(100vw - 48px))",
          height: "min(520px, calc(100vh - 120px))",
          background: "white", borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column",
          zIndex: 9999,
          animation: "chatSlideUp 0.26s cubic-bezier(.16,1,.3,1)",
          overflow: "hidden", border: "1px solid #edf2f7",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "16px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px",
              }}>⚡</div>
              <div>
                <div style={{ color: "white", fontWeight: "700", fontSize: "14px", lineHeight: 1.2 }}>
                  iGrades AI
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>
                  AI Tutor · Always here
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={clearMessages}
                title="Clear chat"
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px",
                  color: "white", cursor: "pointer", padding: "5px 8px",
                  fontSize: "11px", fontWeight: "600", letterSpacing: "0.02em",
                }}
              >Clear</button>
              <button
                onClick={toggleOpen}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px",
                  color: "white", cursor: "pointer", padding: "5px 7px",
                  fontSize: "16px", lineHeight: 1,
                  display: "flex", alignItems: "center",
                }}
              >×</button>
            </div>
          </div>

          {/* Active Context Banner */}
          {activeContext && contextParts.length > 0 && (
            <div style={{
              background: "#f0f4ff",
              borderBottom: "1px solid #e0e7ff",
              padding: "7px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "#4338ca",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", minWidth: 0 }}>
                <span style={{ fontSize: "13px", flexShrink: 0 }}>🎯</span>
                <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {contextParts.join(" · ")}
                </span>
              </div>
              <button
                onClick={clearContext}
                title="Clear learning context and switch to general mode"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "none",
                  color: "#4f46e5",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: "6px",
                  marginLeft: "8px",
                  flexShrink: 0,
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="spark-scroll" style={{
            flex: 1, overflowY: "auto", padding: "16px",
            display: "flex", flexDirection: "column", gap: "12px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} className="spark-msg" style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", flexShrink: 0, marginRight: "8px", marginTop: "2px",
                  }}>⚡</div>
                )}
                <div style={{
                  maxWidth: "82%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#f7f8fa",
                  color: msg.role === "user" ? "white" : "#2d3748",
                  borderRadius: msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  padding: "10px 14px", fontSize: "13px", lineHeight: "1.55",
                  boxShadow: msg.role === "user"
                    ? "0 2px 8px rgba(99,102,241,0.25)"
                    : "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                  {msg.role === "assistant" && msg.guidanceLevel && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "6px",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: msg.guidanceLevel === 6 ? "#059669" : "#4f46e5",
                      background: msg.guidanceLevel === 6 ? "#ecfdf5" : "#eef2ff",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      width: "fit-content",
                    }}>
                      <span>{msg.guidanceLevel === 6 ? "🎯" : "💡"}</span>
                      <span>Level {msg.guidanceLevel} · {msg.guidanceLevelName || "Guided Step"}</span>
                    </div>
                  )}
                  <SparkMessageContent content={msg.content} isUser={msg.role === "user"} />
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", flexShrink: 0,
                }}>⚡</div>
                <div style={{
                  background: "#f7f8fa", borderRadius: "18px 18px 18px 4px",
                  padding: "12px 16px", display: "flex", gap: "4px", alignItems: "center",
                }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="spark-dot" style={{
                      width: "6px", height: "6px", borderRadius: "50%", background: "#a0aec0",
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{
            padding: "8px 14px 4px",
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            background: "#fbfbfe",
            borderTop: "1px solid #f0f0f0",
            scrollbarWidth: "none",
            flexShrink: 0,
          }}>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => sendCustomMessage(qp.prompt)}
                disabled={isLoading}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "5px 11px",
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#4a5568",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  transition: "all 0.15s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.color = "#4f46e5";
                  e.currentTarget.style.background = "#f5f3ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#4a5568";
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 14px", borderTop: "1px solid #f0f0f0",
            display: "flex", gap: "8px", alignItems: "flex-end",
            flexShrink: 0, background: "white",
          }}>
            <textarea
              ref={inputRef}
              className="spark-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask iGrades AI anything academic…"
              rows={1}
              disabled={isLoading}
              style={{
                flex: 1, resize: "none", border: "1px solid #e2e8f0",
                borderRadius: "12px", padding: "9px 12px",
                fontSize: "13px", lineHeight: "1.5", fontFamily: "inherit",
                background: "#fafafa", color: "#2d3748",
                maxHeight: "96px", overflowY: "auto",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "white"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#fafafa"; }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                width: "38px", height: "38px", borderRadius: "12px", border: "none",
                background: !input.trim() || isLoading
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: !input.trim() || isLoading ? "#a0aec0" : "white",
                cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.15s", fontSize: "16px",
              }}
            >↑</button>
          </div>
        </div>
      )}

      {/* ── Floating button ── */}
      <button
        onClick={toggleOpen}
        title="Ask iGrades AI"
        style={{
          position: "fixed", bottom: "80px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%",
          background: isOpen
            ? "#4f46e5"
            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          border: "none", cursor: "pointer", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
          animation: !isOpen ? "sparkPulse 2.5s ease-in-out infinite" : "none",
          transition: "all 0.2s cubic-bezier(.16,1,.3,1)",
          transform: isOpen ? "scale(0.95)" : "scale(1)",
        }}
      >
        {isOpen
          ? <span style={{ color: "white", fontSize: "22px", lineHeight: 1 }}>×</span>
          : <span style={{ fontSize: "22px", lineHeight: 1 }}>⚡</span>
        }
        {hasUnread && !isOpen && (
          <span style={{
            position: "absolute", top: "4px", right: "4px",
            width: "10px", height: "10px", borderRadius: "50%",
            background: "#f56565", border: "2px solid white",
          }} />
        )}
      </button>
    </>
  );
};

export default AIChatbot;