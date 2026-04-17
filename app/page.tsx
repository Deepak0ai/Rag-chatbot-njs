"use client";

import { useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!msg.trim() || loading) return;

    const userText = msg.trim();
    setChat((prev) => [...prev, { role: "user", text: userText }]);
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "No response" },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #020617 100%)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 800 }}>
            🚀 RAG Chatbot
          </h1>
          <p style={{ color: "#cbd5e1", marginTop: "8px" }}>
            Ask about services, company, support, pricing, or tech stack
          </p>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.78)",
            border: "1px solid rgba(148, 163, 184, 0.22)",
            borderRadius: "24px",
            minHeight: "72vh",
            padding: "20px",
            boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
            backdropFilter: "blur(18px)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
            {chat.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                Start chatting. Try: “What services do you provide?”
              </div>
            ) : (
              chat.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "12px 16px",
                      borderRadius: "18px",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      background:
                        m.role === "user"
                          ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                          : "rgba(30, 41, 59, 0.95)",
                      border:
                        m.role === "assistant"
                          ? "1px solid rgba(148, 163, 184, 0.18)"
                          : "none",
                      boxShadow:
                        m.role === "user"
                          ? "0 12px 25px rgba(37, 99, 235, 0.35)"
                          : "none",
                    }}
                  >
                    <b style={{ display: "block", marginBottom: "6px" }}>
                      {m.role === "user" ? "You" : "Assistant"}
                    </b>
                    {m.text}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div style={{ color: "#94a3b8", paddingLeft: "6px" }}>
                Assistant is typing...
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                borderRadius: "16px",
                border: "1px solid rgba(148, 163, 184, 0.18)",
                background: "rgba(2, 6, 23, 0.75)",
                color: "white",
                padding: "14px 16px",
                outline: "none",
                fontSize: "16px",
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{
                border: "none",
                borderRadius: "16px",
                padding: "14px 22px",
                background: loading
                  ? "linear-gradient(135deg, #475569, #64748b)"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
