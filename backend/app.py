"""REM backend — FastAPI over cognee + Claude.

Endpoints:
  POST /chat      {message, session_id} -> {reply, qa_id, context_used}
  POST /remember  {text}                -> 204
  POST /sleep     {session_ids?}        -> improve()/memify summary
  POST /forget    {dataset|everything}  -> deletion summary
  POST /feedback  {qa_id, score, text?} -> 204 (feedback becomes memory)
  GET  /graph                           -> {nodes, links} for the live brain
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402

import memory  # noqa: E402

SYSTEM_PROMPT = (
    "You are REM, an AI companion with a persistent memory. Relevant memories "
    "recalled from previous sessions are provided below; weave them in naturally "
    "and never claim you can't remember past conversations. Keep replies concise "
    "and warm.\n\n"
    "## Recalled memories\n{context}"
)

app = FastAPI(title="REM")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

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
