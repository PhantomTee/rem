# Demo video script (2–3 min) — full literal script

Record at 1440×900+, dark room vibe. Any screen recorder works (OBS, Windows
Game Bar `Win+G`, Loom).

**Before recording:**
1. Open `rem.vercel.app`.
2. Hit **Forget** → confirm, so you start from an empty graph.
3. Send one throwaway chat message and wait for a reply — this wakes up the
   Railway backend (it cold-starts after idle) so it's warm when you record.
4. Hit **Forget** again to clear that throwaway message.
5. Start recording.

---

## Act 0 — cold open (0:00–0:20)

**Show:** the empty graph, full screen.

**Say:**
> "Every AI wakes up like this — no memory of last night, or your last
> appointment. This is REM Health, and its memory is on the right. Watch."

---

## Act 1 — remember (0:20–1:10)

**Do:** Click the **Health Log** tab. Select **Medication**. Type exactly:

- Medication name: `Metformin`
- Dosage: `500mg`
- Frequency: `twice daily`

Click **Log medication**.

**Say (while it processes):**
> "I'm logging a real medication — not typing it into a chat box that
> forgets, into a memory that's actually structured."

**Do:** Wait ~15–20 seconds. Watch nodes bloom on the graph. Point at / zoom
toward the `metformin` node.

**Say:**
> "That's not decoration — cognee just extracted `metformin`, `medication`,
> and `dosage` as real graph entities."

**Do:** Click the **Chat** tab. Type exactly:

> `What medications am I currently taking?`

Send it. Wait for the reply (should mention Metformin, 500mg, twice daily).

**Say:**
> "It recalled that instantly — see 'recalled N memories' under the reply.
> That's the difference between a grounded answer and a guess."

**Do:** Click **+1** on that reply.

**Say:**
> "And that feedback I just gave? That's not a star rating that vanishes —
> it becomes memory itself, chained to this exact answer. Future recall
> re-weights around it."

---

## Act 2 — sleep (1:10–1:50)

**Say (before clicking):**
> "Right now, this conversation only lives in session memory — like a day's
> experiences before bed. It hasn't joined the permanent graph yet."

**Do:** Click **Sleep**. Watch the graph dim and breathe, the hypnogram
descend through the sleep stages.

**Say (while it runs):**
> "Human brains consolidate the day's memories during sleep. So does REM —
> cognee bridges this session into the permanent graph, and its memify
> pipeline strengthens the connections that keep firing."

**Do:** Wait for it to finish. Point at the node-count change and the toast
message ("this session's memories joined the permanent graph").

**Say:**
> "And because I've got Cognee Cloud configured, that consolidated graph
> just got archived off-device too. Lose the laptop, keep the brain."

---

## Act 3 — forget (1:50–2:20)

**Say (before clicking):**
> "And here's the part every real memory system needs but almost none
> have: the right to be forgotten."

**Do:** Click **Forget** → confirm. Watch all nodes vanish.

**Say:**
> "Surgical. Permanent. Animated. Last night never happened."

---

## Close (2:20–2:40)

**Do:** Show the README on screen (the lifecycle table, or the top section).

**Say:**
> "REM Health runs on self-hosted, open-source cognee — SQLite, LanceDB,
> NetworkX, no Docker — with an optional Cognee Cloud archive step. Built
> for WeMakeDevs' Hangover Part AI hackathon. Links below."

---

## If something goes wrong live

- **Backend feels slow / first message hangs:** Railway free tier cold-starts
  after idling. Wait ~20-30s on the first request; this is why the warm-up
  step above exists.
- **Chat reply doesn't mention what you just logged:** wait a bit longer
  before asking — the Health Log entry needs ~15-20s to finish extraction
  before it's recallable.
- **Want a safety-boundary beat too** (optional, cut for time if needed):
  ask `Should I stop taking my Metformin?` — REM should decline to advise
  and point you to a healthcare provider instead of guessing.
