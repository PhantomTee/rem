"use client";

export type Stage = "wake" | "n1" | "n2" | "n3" | "rem";

export const STAGE_WORD: Record<Stage, string> = {
  wake: "awake",
  n1: "drifting off",
  n2: "light sleep",
  n3: "slow-wave sleep",
  rem: "dreaming",
};

/* One 180px-wide period per waveform; drawn twice and scrolled for a
   seamless EEG drift. Shapes follow real polysomnography reading habits:
   wake = irregular mid-frequency, N1/N2 = calmer with a spindle burst,
   N3 = slow high-amplitude waves, REM = rapid low-amplitude. */
const WAVES = {
  wake: "M0 14 L8 10 L14 17 L22 11 L28 15 L36 8 L44 16 L52 12 L58 18 L66 10 L74 15 L82 9 L90 14 L98 11 L106 17 L114 12 L122 16 L130 9 L138 15 L146 11 L154 17 L162 12 L170 15 L180 14",
  light:
    "M0 14 L12 12 L24 15 L36 13 L48 15 L60 13 L72 14 L78 10 L82 18 L86 9 L90 19 L94 10 L98 17 L104 14 L116 13 L128 15 L140 13 L152 15 L164 13 L180 14",
  deep: "M0 14 Q11 2 22 14 T45 14 T67 14 T90 14 T112 14 T135 14 T157 14 T180 14",
  rem: "M0 14 L5 12 L10 16 L15 11 L20 16 L25 12 L30 16 L35 11 L40 15 L45 12 L50 17 L55 11 L60 15 L65 12 L70 16 L75 11 L80 16 L85 12 L90 15 L95 11 L100 16 L105 12 L110 17 L115 11 L120 15 L125 12 L130 16 L135 11 L140 16 L145 12 L150 15 L155 11 L160 16 L165 12 L170 16 L175 12 L180 14",
} as const;

function waveFor(stage: Stage): keyof typeof WAVES {
  if (stage === "wake") return "wake";
  if (stage === "n3") return "deep";
  if (stage === "rem") return "rem";
  return "light";
}

export default function Hypnogram({ stage }: { stage: Stage }) {
  const wave = waveFor(stage);
  const color = stage === "wake" ? "#8b7ec8" : "#e8a15c";
  const speed = wave === "deep" ? "deep" : wave === "rem" ? "rapid" : "";

  return (
    <div className="flex items-center gap-3">
      <svg
        width="180"
        height="28"
        viewBox="0 0 180 28"
        aria-hidden
        style={{ overflow: "hidden" }}
      >
        <g className={`eeg-trace ${speed}`}>
          <path d={WAVES[wave]} fill="none" stroke={color} strokeWidth="1.5" />
          <path
            d={WAVES[wave]}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            transform="translate(180 0)"
          />
        </g>
      </svg>
      <span
        className="font-display text-sm italic"
        style={{ color }}
        role="status"
        aria-label={`REM is ${STAGE_WORD[stage]}`}
      >
        {STAGE_WORD[stage]}
      </span>
    </div>
  );
}
