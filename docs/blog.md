# I gave my AI a sleep cycle

*Building REM — an AI whose brain you can watch — in one day on cognee, for the WeMakeDevs "Hangover Part AI" hackathon.*

Every AI chat demo shows *remembering*. Ask people what memory means and they'll say "it doesn't forget what I told it yesterday." But that's maybe a third of what a memory actually does. Human memory consolidates while we sleep — pruning what didn't matter, strengthening what kept coming up. It sharpens when someone corrects us. And crucially, it can let go.

So instead of building another chatbot-that-remembers, I built **REM: the AI that sleeps on it.** Split screen: chat on the left, and on the right a live force-directed knowledge graph — REM's actual brain, rendered straight from cognee's graph store. Every message you send becomes nodes and edges while you watch.

## The lifecycle is the product

[cognee](https://github.com/topoteretes/cognee) exposes memory as four operations, and REM uses every one of them as a first-class UI feature:

- **`remember()`** — chat turns are stored as typed `QAEntry` objects (question + answer), notes as raw text. Cognee chunks, extracts entities, and wires them into a hybrid graph-vector store. This is why the graph on the right fills with `doug`, `bellagio`, `person`, `location` — real extracted structure, not decoration.
- **`recall()`** — before every reply, REM queries its memory. Cognee auto-routes between semantic search and graph traversal. The UI shows "recalled 3 memories" under each answer, so you can see the difference between a grounded reply and a guess.
- **`improve()`** — the Sleep button. Cognee's memify pipeline prunes stale nodes, strengthens frequently-used connections, and bridges session memory into the permanent graph. In REM, the brain dims, breathes for a while, and wakes up reorganized. Memory consolidation, literally animated.
- **`forget()`** — the finale. Surgical deletion at item, dataset, or everything scope. Watch the nodes vanish. *Last night never happened.*

The self-improving part is my favorite: rate any reply +1/−1 and REM stores a `FeedbackEntry` **chained to that exact QA entry's id**. Future `recall()` calls take a `feedback_influence` weight and re-rank around it. Feedback isn't a log line — it becomes memory itself.

## What actually bit me

**Windows MAX_PATH + a starving laptop.** My first full pipeline run died with `RuntimeError: Graph edge indexing error`, which unwrapped to a LanceDB IO error: `failed to persist temp file … The system cannot find the path specified`. Two things were true at once: cognee's default database location was buried under `site-packages`, producing ~240-character transaction-file paths, and my 5.8 GB laptop hit its commit limit mid-write (`memory allocation of 5242880 bytes failed` was hiding 60 lines up the log). Fix: `DATA_ROOT_DIRECTORY`/`SYSTEM_ROOT_DIRECTORY` env vars to a short path, and don't run a Next.js dev server while cognify is working. If you're on Windows, set those two vars on day one.

**Typed entries need a session.** `remember(FeedbackEntry(...))` without a `session_id` raises `ValueError: session_id is required for typed memory entries`. Makes sense in hindsight — feedback lives in session memory before consolidation — but thread your session id through the whole stack from the start.

**Groq free tier is real money's worth of extraction.** The whole build — entity extraction for every memory, summaries, the improve pipeline — ran on Groq's free `llama-3.3-70b-versatile` with cognee's built-in rate limiter (`LLM_RATE_LIMIT_ENABLED=true`, 25 req/min) and local `fastembed` embeddings. Total LLM spend: **$0**. The entire memory layer — relational, vector, and graph stores — is SQLite + LanceDB + NetworkX on disk. No Docker, no cloud, no bill.

## The stack

Next.js 16 + react-force-graph on the front; FastAPI on the back. Every cognee call lives in one ~100-line file, `memory.py`. That's the honest pitch for a memory layer: the hard parts — extraction, graph construction, hybrid retrieval, consolidation — are cognee's, and your job is to give them a shape people can feel.

Mine looks like something that sleeps.

---

*REM was built for the WeMakeDevs × Cognee hackathon, July 2026. Code: [github.com/PhantomTee/rem](https://github.com/PhantomTee/rem)*
