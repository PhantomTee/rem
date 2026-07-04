"""End-to-end smoke test of the cognee memory lifecycle used by REM.

remember (text + QAEntry) -> recall -> feedback -> improve (sleep) -> forget

Run:  python backend/smoke_test.py
Needs LLM_API_KEY (see .env.example).
"""

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import cognee  # noqa: E402


async def main() -> int:
    if not (os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")):
        print("No LLM_API_KEY set — stopping before live calls.")
        return 1

    print("== forget: clean slate ==")
    out = await cognee.forget(everything=True)
    print(f"  {out!r}"[:300])

    print("== remember: text ==")
    await cognee.remember("Doug is the groom. The wedding is on Sunday at the Bellagio.")
    await cognee.remember("Phil lost the hotel key. Stu is missing a tooth.")
    print("  2 memories stored")

    print("== remember: QA entry (chat turn) ==")
    result = await cognee.remember(
        cognee.QAEntry(
            question="Who is getting married?",
            answer="Doug is the groom; the wedding is Sunday at the Bellagio.",
        ),
        session_id="smoke_session",
    )
    info = result.to_dict() if hasattr(result, "to_dict") else {}
    print(f"  RememberResult.to_dict() -> {info!r}"[:500])
    qa_id = next((str(info[k]) for k in ("entry_id", "qa_id", "id") if info.get(k)), None)
    print(f"  qa_id = {qa_id}")

    print("== recall ==")
    results = await cognee.recall(
        query_text="Where is the wedding and who is the groom?", top_k=5
    )
    for r in (results or [])[:3]:
        print(f"  [{type(r).__name__}] {r!r}"[:300])

    if qa_id:
        print("== feedback: chain to QA ==")
        await cognee.remember(
            cognee.FeedbackEntry(qa_id=qa_id, feedback_score=1, feedback_text="Correct.")
        )
        print("  feedback stored")

    print("== recall with feedback_influence ==")
    results = await cognee.recall(
        query_text="Who is the groom?", top_k=5, feedback_influence=0.4
    )
    print(f"  {len(results or [])} results")

    print("== improve: sleep cycle ==")
    out = await cognee.improve("main_dataset")
    print(f"  {out!r}"[:300])

    print("== graph export ==")
    from memory import export_graph

    g = await export_graph()
    print(f"  {len(g['nodes'])} nodes, {len(g['links'])} links")
    for n in g["nodes"][:5]:
        print(f"  node: {n}")

    print("== forget: wipe ==")
    await cognee.forget(everything=True)
    print("  done — full lifecycle verified")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
