const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type GraphNode = { id: string; label: string; type: string };
export type GraphLink = { source: string; target: string; label: string };
export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

export type ChatResponse = {
  reply: string;
  qa_id: string | null;
  context_used: string[];
};
export type SleepResponse = { status: string; detail: string };

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  chat: (message: string, session_id: string) =>
    req<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id }),
    }),
  remember: (text: string) =>
    req<void>("/remember", { method: "POST", body: JSON.stringify({ text }) }),
  sleep: () => req<SleepResponse>("/sleep", { method: "POST" }),
  forget: (opts: { dataset?: string; everything?: boolean }) =>
    req<void>("/forget", { method: "POST", body: JSON.stringify(opts) }),
  feedback: (qa_id: string, score: 1 | -1, text?: string) =>
    req<void>("/feedback", {
      method: "POST",
      body: JSON.stringify({ qa_id, score, text }),
    }),
  graph: () => req<GraphData>("/graph"),
};
