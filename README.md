# REM Health — the health companion that sleeps on it

Every AI chat demo shows *remembering*. REM shows the whole memory lifecycle — including sleep and forgetting — applied to something that actually needs it: your health history.

REM is a memory-first health companion with a visible brain: a live force-directed knowledge graph that grows as you log medications, symptoms, and appointments. Built for the WeMakeDevs × [Cognee](https://github.com/topoteretes/cognee) hackathon **"The Hangover Part AI"**, entirely on the open-source, self-hosted cognee stack (SQLite + LanceDB + NetworkX — no Docker, no external databases).

## Why it matters

Agent memory has a trust problem: it's invisible. That's especially dangerous for health — you need to see exactly what your assistant remembers about your medications and symptoms, correct what it got wrong, and be able to erase it entirely. REM is a working answer to all three — every memory is a node you can inspect, feedback rewires retrieval around the answers you rate, and forgetting is surgical and permanent. A dedicated Health Log tracks medications and symptoms as structured memory alongside free-form chat, so REM can recall "what am I currently taking?" across sessions instead of starting from zero every time. Chat is just the simplest surface to prove the pattern on — the same memory-first UI works for support bots, tutors, and research copilots.

## Why it's different

Human memory doesn't just store — it consolidates during sleep, strengthens with feedback, and lets go of what no longer matters. REM maps cognee's full memory lifecycle onto that biology, and makes every step *visible*:

| REM concept | cognee API | What you see |
|---|---|---|
| **Experience** | `remember()` — chat turns as `QAEntry`, medications/symptoms/notes as text, session-scoped | new nodes glow into the graph as you talk or log a Health Log entry |
| **Recall** | `recall()` — auto-routed hybrid graph-vector search, `feedback_influence`-weighted | "recalled 3 memories" under every reply |
| **Sleep** | `improve()` (memify) — prunes stale nodes, strengthens frequent connections, bridges session memory into the permanent graph | the brain dims, breathes, and wakes reorganized |
| **Feedback** | `FeedbackEntry` chained to a `QAEntry` id — feedback literally becomes memory | rate a reply +1/−1; future recall re-weights around it |
| **Forget** | `forget()` — surgical deletion at item/dataset/everything scope | nodes vanish; the right to be forgotten, animated |
| **Archive** | `push()` — after sleep, the consolidated brain is pushed to **Cognee Cloud** | "archived to Cognee Cloud" on waking |

## Local dreams, cloud memories

REM runs its whole memory lifecycle self-hosted — but sleep has one more biological step: what consolidation keeps, gets archived. With two env vars (`COGNEE_SERVICE_URL`, `COGNEE_API_KEY`), every sleep cycle ends by pushing the consolidated dataset to Cognee Cloud with `cognee.push()`. Dreams are processed locally; lasting memories are backed up off-device. Lose the laptop, keep the brain.

## Architecture

```
┌─────────────────────┐        ┌──────────────────────┐
│  Next.js frontend    │  HTTP  │  FastAPI backend      │
│  chat + live graph   │ ─────► │  backend/app.py       │
│  react-force-graph   │        │  backend/memory.py ───┼──► cognee
└─────────────────────┘        │  Groq (chat voice)    │     ├─ SQLite   (relational)
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

Optional: seed a demo patient history (`python backend/seed_demo.py`), then ask REM *"What medications is Maya on?"*

Verify the full lifecycle end-to-end: `python backend/smoke_test.py`

## The three-act demo

1. **Remember** — log medications and symptoms in the Health Log (or seed the demo history), watch the graph light up, ask questions across sessions.
2. **Sleep** — hit Sleep: cognee's memify pipeline consolidates; the graph visibly reorganizes.
3. **Forget** — surgically delete everything. *Last night never happened.*

## AI tool usage

Built with [Claude Code](https://claude.com/claude-code) as a pair-programmer throughout — architecture, backend/frontend implementation, the Render→Railway deployment migration, and debugging (including diagnosing the cognee storage-path and schema-migration issues described above). All product decisions, the health-assistant direction, and final review are my own. Disclosed per the hackathon rules.

## Team

Built solo by [PhantomTee](https://github.com/PhantomTee).
