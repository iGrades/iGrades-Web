"use client";

import { useChatbot } from "../../hooks/useChatBot";

export const AIChatbot = () => {
  const {
    messages, input, isLoading, isOpen, hasUnread, isExcluded,
    messagesEndRef, inputRef,
    setInput, sendMessage, clearMessages, toggleOpen, handleKeyDown,
  } = useChatbot();

  if (isExcluded) return null;

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
                  maxWidth: "78%",
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
                  whiteSpace: "pre-wrap",
                }}>{msg.content}</div>
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
          position: "fixed", bottom: "24px", right: "24px",
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