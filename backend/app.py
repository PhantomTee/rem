"""REM backend — FastAPI over cognee + Claude.

Endpoints:
  POST /chat              {message, session_id} -> {reply, qa_id, context_used}
  POST /remember          {text}                -> 204
  POST /health/medication {name, dosage, ...}   -> 204 (structured memory)
  POST /health/symptom    {description, ...}    -> 204 (structured memory)
  GET  /health/summary    ?session_id           -> {medications, symptoms}
  POST /sleep             {session_ids?}        -> improve()/memify summary
  POST /forget            {dataset|everything}  -> deletion summary
  POST /feedback          {qa_id, score, text?} -> 204 (feedback becomes memory)
  GET  /graph                                   -> {nodes, links} for the live brain
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402

import memory  # noqa: E402
from runtime_paths import ensure_runtime_directories  # noqa: E402

ensure_runtime_directories()

SYSTEM_PROMPT = (
    "You are REM, a memory-first health companion. You are not a doctor and must "
    "never diagnose, prescribe, or claim certainty about a medical condition — "
    "you help someone track and recall their own health history (medications, "
    "symptoms, appointments) across sessions, and you gently suggest seeing a "
    "healthcare provider for anything serious or worsening. Relevant memories "
    "recalled from previous sessions are provided below; weave them in naturally "
    "and never claim you can't remember past conversations. Keep replies concise "
    "and warm.\n\n"
    "## Recalled memories\n{context}"
)

DISCLAIMER = (
    "REM is not a medical professional. Information is stored and recalled "
    "as reported — it is not verified, diagnostic, or a substitute for advice "
    "from a qualified healthcare provider."
)

app = FastAPI(title="REM")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup():
    await memory.ensure_ready()


_chat_client = None


def get_chat_client():
    """OpenAI-compatible chat client — points at Groq, OpenAI, or anything
    else via CHAT_BASE_URL / CHAT_API_KEY."""
    global _chat_client
    if _chat_client is None:
        from openai import AsyncOpenAI

        _chat_client = AsyncOpenAI(
            base_url=os.getenv("CHAT_BASE_URL") or None,
            api_key=os.getenv("CHAT_API_KEY") or os.getenv("LLM_API_KEY"),
        )
    return _chat_client


class ChatIn(BaseModel):
    message: str
    session_id: str = "default"


class RememberIn(BaseModel):
    text: str


class MedicationIn(BaseModel):
    name: str
    dosage: str | None = None
    frequency: str | None = None
    notes: str | None = None
    session_id: str = "default"


class SymptomIn(BaseModel):
    description: str
    severity: int | None = None  # 1-10
    notes: str | None = None
    session_id: str = "default"


class SleepIn(BaseModel):
    session_ids: list[str] | None = None


class ForgetIn(BaseModel):
    dataset: str | None = None
    everything: bool = False


class FeedbackIn(BaseModel):
    qa_id: str
    score: int  # +1 / -1
    text: str | None = None
    session_id: str = "default"


@app.post("/chat")
async def chat(body: ChatIn):
    context = await memory.recall_context(body.message, session_id=body.session_id)
    resp = await get_chat_client().chat.completions.create(
        model=os.getenv("CHAT_MODEL", "llama-3.3-70b-versatile"),
        max_tokens=1024,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT.format(
                    context="\n".join(f"- {c}" for c in context) or "(none yet)"
                ),
            },
            {"role": "user", "content": body.message},
        ],
    )
    reply = resp.choices[0].message.content or ""
    qa_id = await memory.remember_qa(body.message, reply, session_id=body.session_id)
    return {"reply": reply, "qa_id": qa_id, "context_used": context}


@app.post("/remember", status_code=204)
async def remember(body: RememberIn):
    await memory.remember_text(body.text)


@app.post("/health/medication", status_code=204)
async def log_medication(body: MedicationIn):
    parts = [f"Medication: {body.name}"]
    if body.dosage:
        parts.append(f"dosage {body.dosage}")
    if body.frequency:
        parts.append(f"taken {body.frequency}")
    if body.notes:
        parts.append(body.notes)
    await memory.remember_text(", ".join(parts) + ".")


@app.post("/health/symptom", status_code=204)
async def log_symptom(body: SymptomIn):
    parts = [f"Symptom reported: {body.description}"]
    if body.severity is not None:
        parts.append(f"severity {max(1, min(10, body.severity))}/10")
    if body.notes:
        parts.append(body.notes)
    await memory.remember_text(", ".join(parts) + ".")


async def _summarize_list(context: list[str], subject: str) -> list[str]:
    """Turn raw recalled graph context into a short, clean bullet list —
    context strings are entity/edge dumps meant for LLM prompts, not
    something we want to render verbatim in the UI."""
    if not context:
        return []
    resp = await get_chat_client().chat.completions.create(
        model=os.getenv("CHAT_MODEL", "llama-3.3-70b-versatile"),
        max_tokens=256,
        messages=[
            {
                "role": "system",
                "content": (
                    f"Extract a concise list of distinct {subject} from the memory "
                    "context below. One item per line, terse and factual (e.g. "
                    "'Metformin 500mg, twice daily'), no numbering or extra "
                    f"commentary. Only include items that are actually {subject} — "
                    "the context may mention related-but-different entities "
                    "(e.g. a medication while listing symptoms); leave those out. "
                    "If nothing relevant is present, output nothing.\n\n"
                    "## Context\n" + "\n".join(context)
                ),
            },
        ],
    )
    text = resp.choices[0].message.content or ""
    return [line.strip("-• \t") for line in text.splitlines() if line.strip()]


@app.get("/health/summary")
async def health_summary(session_id: str = "default"):
    med_context = await memory.recall_context(
        "What medications are currently being taken, with dosage and frequency?",
        session_id=session_id,
    )
    symptom_context = await memory.recall_context(
        "What symptoms have been reported recently, and how severe were they?",
        session_id=session_id,
    )
    medications = await _summarize_list(med_context, "medications")
    symptoms = await _summarize_list(symptom_context, "symptoms")
    return {"medications": medications, "symptoms": symptoms}


@app.post("/sleep")
async def sleep(body: SleepIn | None = None):
    return await memory.sleep(session_ids=body.session_ids if body else None)


@app.post("/forget")
async def forget(body: ForgetIn):
    if body.everything:
        return await memory.forget_everything()
    if body.dataset:
        return await memory.forget_dataset(body.dataset)
    raise HTTPException(400, "specify dataset or everything=true")


@app.post("/feedback", status_code=204)
async def feedback(body: FeedbackIn):
    if not body.qa_id:
        raise HTTPException(400, "qa_id required")
    await memory.give_feedback(body.qa_id, body.score, body.text, body.session_id)


@app.get("/graph")
async def graph():
    return await memory.export_graph()
