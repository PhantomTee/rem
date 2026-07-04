# Demo video script (2–3 min)

Record at 1440×900+, dark room vibe. OBS: capture browser window only.
Before recording: `python backend/seed_demo.py` on a FRESH memory
(Forget everything first), backend + frontend running, close spare Chrome tabs.

## Act 0 — cold open (0:00–0:20)
Empty graph. Line: "Every AI wakes up like this — no memory of last night.
This is REM, and its brain is on the right. Watch."

## Act 1 — remember (0:20–1:10)
- Type: "Doug is the groom. The wedding is Sunday at the Bellagio."
- Wait for nodes to bloom. Zoom into `doug` → `person`.
- Ask: "Where is Doug getting married?" → point at "recalled N memories".
- Rate the reply +1 → "that feedback just became a memory, chained to this
  exact answer. REM re-weights future recall around it."

## Act 2 — sleep (1:10–1:50)
- Click **Sleep**. Graph dims and breathes.
- Line: "Human brains consolidate memory during sleep. So does REM —
  cognee's memify pipeline prunes stale nodes and strengthens the
  connections that keep firing."
- Toast shows node delta. Ask the same question again — still grounded.

## Act 3 — forget (1:50–2:20)
- Click **Forget** → confirm. Nodes vanish.
- Line: "And the part every real memory system needs: the right to be
  forgotten. Surgical, permanent, animated. Last night never happened."

## Close (2:20–2:40)
- README on screen: the 4-op lifecycle table.
- "Self-hosted cognee: SQLite, LanceDB, NetworkX. No Docker. LLM bill for
  everything you just watched: zero dollars. Links below."
