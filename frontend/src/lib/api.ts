const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type GraphNode = { id: string; label: string; type: string };
export type GraphLink = { source: string; target: string; label: string };
export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

export type ChatResponse = {
  reply: string;
  qa_id: string | null;
  context_used: string[];
};
export type SleepResponse = {
  status: string;
  archived: boolean;
  detail: string;
};
export type HealthSummary = {
  medications: string[];
  symptoms: string[];
};

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
  sleep: (session_ids?: string[]) =>
    req<SleepResponse>("/sleep", {
      method: "POST",
      body: JSON.stringify({ session_ids }),
    }),
  forget: (opts: { dataset?: string; everything?: boolean }) =>
    req<void>("/forget", { method: "POST", body: JSON.stringify(opts) }),
  feedback: (qa_id: string, score: 1 | -1, session_id: string, text?: string) =>
    req<void>("/feedback", {
      method: "POST",
      body: JSON.stringify({ qa_id, score, session_id, text }),
    }),
  graph: () => req<GraphData>("/graph"),
  logMedication: (
    name: string,
    dosage: string | undefined,
    frequency: string | undefined,
    session_id: string
  ) =>
    req<void>("/health/medication", {
      method: "POST",
      body: JSON.stringify({ name, dosage, frequency, session_id }),
    }),
  logSymptom: (
    description: string,
    severity: number | undefined,
    session_id: string
  ) =>
    req<void>("/health/symptom", {
      method: "POST",
      body: JSON.stringify({ description, severity, session_id }),
    }),
  healthSummary: (session_id: string) =>
    req<HealthSummary>(`/health/summary?session_id=${encodeURIComponent(session_id)}`),
};
