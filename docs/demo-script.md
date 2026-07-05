# Demo video script (2–3 min)

Record at 1440×900+, dark room vibe. OBS: capture browser window only.
Before recording: `python backend/seed_demo.py` on a FRESH memory
(Forget everything first), backend + frontend running, close spare Chrome tabs.

## Act 0 — cold open (0:00–0:20)
Empty graph. Line: "Every AI wakes up like this — no memory of last night,
and no memory of your last appointment either. This is REM Health, and
its brain is on the right. Watch."

## Act 1 — remember (0:20–1:10)
- Switch to the Health Log tab, log: Medication "Metformin", 500mg, twice daily.
- Wait for nodes to bloom. Zoom into `metformin` → `medication`.
- Switch to Chat, ask: "What medications am I currently taking?" → point at
  "recalled N memories".
- Rate the reply +1 → "that feedback just became a memory, chained to this
  exact answer. REM re-weights future recall around it."

## Act 2 — sleep (1:10–1:50)
- Point out: the conversation you just had is NOT in the graph yet —
  it lives in session memory, like a day's experiences before bed.
- Click **Sleep**. Graph dims and breathes.
- Line: "Human brains consolidate the day's memories during sleep. So
  does REM — cognee bridges this session into the permanent graph and
  memify strengthens the connections that keep firing."
- The graph visibly BLOOMS (in testing: 60 → 65 nodes, 105 → 136 links).
  Toast says "this session's memories joined the permanent graph."
- Bonus cut: kill the backend, restart it, ask the same question —
  still remembers. "Not a context window. A memory."

## Act 3 — forget (1:50–2:20)
- Click **Forget** → confirm. Nodes vanish.
- Line: "And the part every real memory system needs: the right to be
  forgotten. Surgical, permanent, animated. Last night never happened."

## Close (2:20–2:40)
- README on screen: the 4-op lifecycle table.
- "Self-hosted cognee: SQLite, LanceDB, NetworkX. No Docker. LLM bill for
  everything you just watched: pennies. Links below."
