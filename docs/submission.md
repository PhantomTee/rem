# Submission kit — WeMakeDevs × Cognee "The Hangover Part AI"

Paste-ready content for the submission form, blog publish, and social posts.
Fill in the bracketed links once you have them.

## Project title

REM Health — the health companion that sleeps on it

## One-liner

A memory-first health companion built on cognee: log medications and symptoms,
watch a live knowledge graph grow, and see the full memory lifecycle — remember,
recall, sleep (consolidate), feedback, and forget — as first-class, visible features.

## Description (for the submission form)

Most AI memory demos only show *remembering*. REM Health shows the whole
lifecycle. Split-screen UI: a Health Log + chat on the left, a live
force-directed knowledge graph on the right, rendered straight from cognee's
graph store.

- **Remember** — medications, symptoms, and chat turns become typed memory
  (`QAEntry`, structured text) via `cognee.remember()`. Real entity extraction —
  `metformin`, `medication`, `symptom` — not decoration.
- **Recall** — every reply shows "recalled N memories" so you can see grounded
  answers vs. guesses. Hybrid graph-vector search, auto-routed by cognee.
- **Sleep** — hitting Sleep runs cognee's `improve()`/memify pipeline: prunes
  stale nodes, strengthens frequent connections, bridges session memory into
  the permanent graph. The graph visibly reorganizes.
- **Feedback** — rate any reply +1/−1; it's stored as a `FeedbackEntry` chained
  to that exact answer, and future recall re-weights around it.
- **Forget** — surgical deletion at item/dataset/everything scope, animated.
- **Archive** — after Sleep, the consolidated graph is pushed to **Cognee
  Cloud** (`cognee.push()`), so memory survives past the local machine.

Built with a real use case in mind: agent memory has a trust problem
(invisible, uncorrectable, unforgettable), and that's most dangerous for
health data specifically. REM Health makes every part of the lifecycle
inspectable and reversible.

**Stack**: Next.js 16 + react-force-graph (frontend, on Vercel), FastAPI
(backend, on Railway), self-hosted cognee (SQLite + LanceDB + NetworkX) with
optional Cognee Cloud archival, `gpt-4o-mini` via OpenRouter for
extraction/chat, local `fastembed` embeddings.

**Live demo**: [rem.vercel.app](https://rem.vercel.app)
**Repo**: [github.com/PhantomTee/rem](https://github.com/PhantomTee/rem)
**Demo video**: [ADD LINK]

## Tracks submitted for

- **Best Use of Open Source** — the entire memory lifecycle runs on
  self-hosted, open-source cognee (`remember`/`recall`/`improve`/`forget` all
  used as first-class UI features, not just called once).
- **Best Use of Cognee Cloud** — Sleep pushes the consolidated dataset to
  Cognee Cloud (`cognee.push()`, re-derive mode) as a persistent off-device
  archive step.

## AI tool usage disclosure (required — paste into the submission form)

This project was built with [Claude Code](https://claude.com/claude-code) as
a pair-programmer for architecture, implementation, deployment (including a
mid-build migration from Render to Railway), and debugging. Product direction,
the health-assistant concept, and final decisions are my own.

## Social posts (Social Buzz track — tag @wemakedevs and @cognee_)

**X/Twitter:**
> Woke up my AI and gave it a health memory it can't forget (or can, if you
> ask it to). Built REM Health for @wemakedevs' Hangover Part AI hackathon —
> a health companion where you *watch* the memory lifecycle: remember, recall,
> sleep, feedback, forget, all powered by @cognee_. Self-hosted, near-zero LLM cost,
> deployed live: rem.vercel.app 🧠
> #TheHangoverPartAI #cognee

**LinkedIn (longer):**
> I built an AI health companion whose memory you can actually watch form —
> and forget.
>
> For WeMakeDevs' "Hangover Part AI" hackathon, I built REM Health on top of
> cognee's open-source, self-hosted memory layer. Log a medication or symptom
> and it becomes nodes and edges in a live knowledge graph in real time. Hit
> Sleep and watch cognee's memify pipeline consolidate the session into
> permanent memory — the same way human memory consolidates overnight. Rate a
> reply and that feedback becomes memory itself, re-weighting future recall.
> Hit Forget and it's gone, surgically and permanently.
>
> Agent memory has a trust problem: it's invisible, uncorrectable, and you
> can't make it forget. That's most dangerous exactly where REM Health points
> it — health data. This makes the whole lifecycle visible and reversible.
>
> Built solo, self-hosted stack (SQLite + LanceDB + NetworkX), pennies-per-call
> LLM cost, optional Cognee Cloud archival after every Sleep cycle.
>
> Live: rem.vercel.app · Code: github.com/PhantomTee/rem
>
> @WeMakeDevs @cognee #TheHangoverPartAI
