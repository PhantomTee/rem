"""Seed REM with the demo storyline (Vegas, obviously).

Act 1 of the demo: run this, watch the graph light up.
Run:  python backend/seed_demo.py
"""

import asyncio
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import cognee  # noqa: E402

MEMORIES = [
    "Doug is the groom. His wedding to Tracy is on Sunday at 5pm at the Bellagio chapel.",
    "Phil, Stu, and Alan are Doug's groomsmen. They were last seen at Caesars Palace on Friday night.",
    "Stu is a dentist. He is missing a tooth and doesn't remember how.",
    "Alan won $82,400 counting cards at blackjack on Friday night.",
    "There is a tiger in the bathroom of suite 2452 at Caesars Palace. It belongs to Mike Tyson.",
    "The hotel key found in Phil's pocket is for the Best Western, not Caesars Palace.",
    "Doug was on the roof of Caesars Palace the whole time — they moved the mattress as a prank.",
    "The wedding rehearsal dinner is Saturday at 7pm; Tracy's father is paying.",
]


async def main() -> None:
    for text in MEMORIES:
        await cognee.remember(text)
        print(f"remembered: {text[:60]}…")
    print(f"\n{len(MEMORIES)} memories stored. Ask REM: 'Where is Doug?'")


if __name__ == "__main__":
    asyncio.run(main())
