"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

type Message = {
  role: "user" | "rem";
  text: string;
  qaId?: string | null;
  recalled?: number;
  feedback?: 1 | -1;
};

type Props = {
  sessionId: string;
  onMemoryChanged: () => void;
};

export default function ChatPanel({ sessionId, onMemoryChanged }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const res = await api.chat(text, sessionId);
      setMessages((m) => [
        ...m,
        {
          role: "rem",
          text: res.reply,
          qaId: res.qa_id,
          recalled: res.context_used.length,
        },
      ]);
      onMemoryChanged();
    } catch {
      setError("REM couldn't reach its memory. Check the backend is running, then try again.");
    } finally {
      setBusy(false);
    }
  }

  async function rate(index: number, score: 1 | -1) {
    const msg = messages[index];
    if (!msg.qaId || msg.feedback) return;
    setMessages((m) =>
      m.map((x, i) => (i === index ? { ...x, feedback: score } : x))
    );
    try {
      await api.feedback(msg.qaId, score);
      onMemoryChanged();
    } catch {
      setMessages((m) =>
        m.map((x, i) => (i === index ? { ...x, feedback: undefined } : x))
      );
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="mt-16 space-y-2 text-center">
            <p className="font-display text-xl italic text-ink-dim">
              Tell me something. I&apos;ll keep it.
            </p>
            <p className="text-xs text-ink-faint">
              Everything you say becomes part of the graph on the right.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-md bg-[#262147] text-ink"
                  : "rounded-bl-md bg-panel text-ink ring-1 ring-panel-edge"
              }`}
            >
              {m.text}
            </div>
            {m.role === "rem" && (
              <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-ink-faint">
                {m.recalled !== undefined && (
                  <span>
                    {m.recalled === 0
                      ? "no memories recalled"
                      : `recalled ${m.recalled} ${m.recalled === 1 ? "memory" : "memories"}`}
                  </span>
                )}
                {m.qaId && !m.feedback && (
                  <span className="flex gap-1.5">
                    <button
                      onClick={() => rate(i, 1)}
                      aria-label="Mark reply helpful"
                      className="rounded px-1 hover:text-glow"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => rate(i, -1)}
                      aria-label="Mark reply wrong"
                      className="rounded px-1 hover:text-[#c9627e]"
                    >
                      −1
                    </button>
                  </span>
                )}
                {m.feedback && (
                  <span className={m.feedback === 1 ? "text-glow" : "text-[#c9627e]"}>
                    {m.feedback === 1 ? "remembered as helpful" : "remembered as wrong"}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <p className="font-mono text-[11px] text-ink-faint">
            REM is recalling…
          </p>
        )}
        {error && <p className="text-xs text-[#c9627e]">{error}</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t border-panel-edge p-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something worth remembering…"
            aria-label="Message REM"
            className="flex-1 rounded-xl border border-panel-edge bg-panel px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl bg-glow px-4 py-2.5 text-sm font-medium text-[#1d1305] transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
