# REM — the AI that sleeps on it

Every AI chat demo shows *remembering*. REM shows the whole memory lifecycle — including sleep and forgetting.

REM is a memory-first AI companion with a visible brain: a live force-directed knowledge graph that grows as you talk to it. Built for the WeMakeDevs × [Cognee](https://github.com/topoteretes/cognee) hackathon **"The Hangover Part AI"**, entirely on the open-source, self-hosted cognee stack (SQLite + LanceDB + NetworkX — no Docker, no external databases).

## Why it matters

Agent memory has a trust problem: it's invisible. You can't see what your assistant knows about you, you can't correct what it got wrong, and you can't make it forget. REM is a working answer to all three — every memory is a node you can inspect, feedback rewires retrieval around the answers you rate, and forgetting is surgical and permanent. That's not a chatbot feature; it's what agent memory has to look like before anyone should trust it. Chat is just the simplest surface to prove the pattern on — the same memory-first UI works for support bots, tutors, and research copilots.

## Why it's different

Human memory doesn't just store — it consolidates during sleep, strengthens with feedback, and lets go of what no longer matters. REM maps cognee's full memory lifecycle onto that biology, and makes every step *visible*:

| REM concept | cognee API | What you see |
|---|---|---|
| **Experience** | `remember()` — chat turns as `QAEntry`, notes as text, session-scoped | new nodes glow into the graph as you talk |
| **Recall** | `recall()` — auto-routed hybrid graph-vector search, `feedback_influence`-weighted | "recalled 3 memories" under every reply |
| **Sleep** | `improve()` (memify) — prunes stale nodes, strengthens frequent connections, bridges session memory into the permanent graph | the brain dims, breathes, and wakes reorganized |
| **Feedback** | `FeedbackEntry` chained to a `QAEntry` id — feedback literally becomes memory | rate a reply +1/−1; future recall re-weights around it |
| **Forget** | `forget()` — surgical deletion at item/dataset/everything scope | nodes vanish; the right to be forgotten, animated |

## Architecture

```
┌─────────────────────┐        ┌──────────────────────┐
│  Next.js frontend    │  HTTP  │  FastAPI backend      │
│  chat + live graph   │ ─────► │  backend/app.py       │
│  react-force-graph   │        │  backend/memory.py ───┼──► cognee
└─────────────────────┘        │  Claude (chat voice)  │     ├─ SQLite   (relational)
                               └──────────────────────┘     ├─ LanceDB  (vectors)
                                                             └─ NetworkX (graph)
```

Every cognee call lives in [`backend/memory.py`](backend/memory.py) — ~100 lines is all it takes to give an agent a full memory lifecycle.

## Run it

```bash
# backend
python -m venv .venv && .venv/Scripts/activate   # or source .venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env                              # add your keys
uvicorn app:app --app-dir backend --port 8000

# frontend
cd frontend && npm install && npm run dev         # http://localhost:3000
```

Optional: seed the demo storyline (`python backend/seed_demo.py`), then ask REM *"Where is Doug?"*

Verify the full lifecycle end-to-end: `python backend/smoke_test.py`

## The three-act demo

1. **Remember** — seed the story, watch the graph light up, ask questions across sessions.
2. **Sleep** — hit Sleep: cognee's memify pipeline consolidates; the graph visibly reorganizes.
3. **Forget** — surgically delete everything. *Last night never happened.*

## Team

Built solo by [PhantomTee](https://github.com/PhantomTee).
