"""Seed REM Health with a demo patient history.

Act 1 of the demo: run this, watch the graph light up.
Run:  python backend/seed_demo.py
"""

import asyncio
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import cognee  # noqa: E402

MEMORIES = [
    "Patient is Maya Chen, 34, diagnosed with Type 2 diabetes and mild hypertension.",
    "Medication: Metformin 500mg, taken twice daily, started 2026-06-01 for blood sugar control.",
    "Medication: Lisinopril 10mg, taken once daily in the morning, for blood pressure.",
    "Allergy: penicillin causes a rash — noted by Dr. Osei at the June checkup.",
    "Symptom reported: dizziness after taking Metformin, severity 4/10, mostly in the afternoon.",
    "Symptom reported: mild headache, severity 3/10, resolved after drinking more water.",
    "Appointment: follow-up with Dr. Osei on Thursday at 2pm to review blood sugar logs.",
    "Home blood pressure reading on 2026-07-01: 128/82, slightly improved from last month.",
]


async def main() -> None:
    for text in MEMORIES:
        await cognee.remember(text)
        print(f"remembered: {text[:60]}…")
    print(f"\n{len(MEMORIES)} memories stored. Ask REM: 'What medications is Maya on?'")


if __name__ == "__main__":
    asyncio.run(main())
