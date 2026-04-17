"use client";

import { useEffect, useRef, useState, KeyboardEvent, FormEvent } from "react";
import type { Message, ChatRequestBody, ChatResponseBody } from "@/types";

const SUGGESTIONS: string[] = [
  "What services do you provide?",
  "What technology do you use?",
  "How do I contact support?",
  "Tell me about pricing",
];

export default function ChatPage(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(overrideText?: string): Promise<void> {
    const text: string = (overrideText ?? input).trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const requestBody: ChatRequestBody = { messages: nextMessages };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data: ChatResponseBody = await res.json();

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.content },
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Send message error:", message);

      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    sendMessage();
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 3px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        .msg-bubble { animation: fadeUp 0.22s ease; }
        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #94a3b8; animation: pulse 1.2s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        .send-btn:hover:not(:disabled) { transform: scale(1.04); }
        .send-btn { transition: transform 0.15s, background 0.15s; }
        .chip { transition: background 0.15s, color 0.15s; cursor: pointer; }
        .chip:hover { background: rgba(59,130,246,0.2) !important; color: #93c5fd !important; }
        textarea:focus { outline: none; }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse at 20% 20%, #0f2744 0%, #0a1628 50%, #020812 100%)",
          color: "white",
          display: "flex",
          justifyContent: "center",
          padding: "24px 16px",
          fontFamily:
            "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "820px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            minHeight: "calc(100vh - 48px)",
          }}
        >
          {/* Header */}
          <header style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div style={{ fontSize: "36px", marginBottom: "6px" }}>🤖</div>
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.3px",
              }}
            >
              RAG Chatbot
            </h1>
            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "14px" }}>
              Powered by Google Gemini · Ask me anything
            </p>
          </header>

          {/* Chat Window */}
          <section
            style={{
              flex: 1,
              background: "rgba(10, 20, 40, 0.85)",
              border: "1px solid rgba(148,163,184,0.15)",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
              overflow: "hidden",
            }}
          >
            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                minHeight: "55vh",
                maxHeight: "55vh",
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "20px",
                    padding: "20px",
                  }}
                >
                  <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
                    Try one of these:
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    {SUGGESTIONS.map((suggestion: string) => (
                      <button
                        key={suggestion}
                        className="chip"
                        onClick={() => sendMessage(suggestion)}
                        style={{
                          background: "rgba(30,58,138,0.25)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: "20px",
                          padding: "8px 16px",
                          color: "#93c5fd",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message: Message, index: number) => (
                    <div
                      key={index}
                      className="msg-bubble"
                      style={{
                        display: "flex",
                        justifyContent:
                          message.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      {message.role === "assistant" && (
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg,#1d4ed8,#6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            flexShrink: 0,
                            marginRight: "8px",
                            alignSelf: "flex-end",
                          }}
                        >
                          🤖
                        </div>
                      )}
                      <div
                        style={{
                          maxWidth: "72%",
                          padding: "12px 16px",
                          borderRadius:
                            message.role === "user"
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          fontSize: "14.5px",
                          background:
                            message.role === "user"
                              ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                              : "rgba(30,41,59,0.9)",
                          border:
                            message.role === "assistant"
                              ? "1px solid rgba(148,163,184,0.15)"
                              : "none",
                          color: "white",
                          boxShadow:
                            message.role === "user"
                              ? "0 8px 20px rgba(37,99,235,0.3)"
                              : "none",
                        }}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div
                      className="msg-bubble"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg,#1d4ed8,#6366f1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        🤖
                      </div>
                      <div
                        style={{
                          background: "rgba(30,41,59,0.9)",
                          border: "1px solid rgba(148,163,184,0.15)",
                          borderRadius: "18px 18px 18px 4px",
                          padding: "14px 18px",
                          display: "flex",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              style={{
                borderTop: "1px solid rgba(148,163,184,0.1)",
                padding: "16px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-end",
                background: "rgba(5,10,25,0.6)",
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  borderRadius: "14px",
                  border: "1px solid rgba(148,163,184,0.2)",
                  background: "rgba(2,6,23,0.8)",
                  color: "white",
                  padding: "12px 16px",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  fontFamily: "inherit",
                  maxHeight: "120px",
                  overflowY: "auto",
                }}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={loading || !input.trim()}
                style={{
                  border: "none",
                  borderRadius: "14px",
                  padding: "12px 20px",
                  background:
                    loading || !input.trim()
                      ? "rgba(71,85,105,0.5)"
                      : "linear-gradient(135deg,#1d4ed8,#2563eb)",
                  color: "white",
                  fontWeight: 700,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  boxShadow:
                    !loading && input.trim()
                      ? "0 8px 20px rgba(37,99,235,0.35)"
                      : "none",
                }}
              >
                {loading ? "..." : "Send →"}
              </button>
            </form>
          </section>

          <footer
            style={{
              textAlign: "center",
              color: "#334155",
              fontSize: "12px",
              paddingBottom: "8px",
            }}
          >
            Built with Next.js 15 · TypeScript · Google Gemini · Vercel
          </footer>
        </div>
      </main>
    </>
  );
}
