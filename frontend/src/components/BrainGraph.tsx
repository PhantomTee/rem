"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { GraphData } from "@/lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-xs text-ink-faint">
      waking the brain…
    </div>
  ),
});

const NODE_COLORS: Record<string, string> = {
  entity: "#8b7ec8",
  concept: "#1f9c93",
  document: "#c77e33",
  session: "#c9627e",
};

export function colorFor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("session") || t.includes("interaction") || t.includes("conversation"))
    return NODE_COLORS.session;
  if (t.includes("type") || t.includes("summary") || t.includes("concept"))
    return NODE_COLORS.concept;
  if (t.includes("chunk") || t.includes("document") || t.includes("text"))
    return NODE_COLORS.document;
  return NODE_COLORS.entity;
}

const LEGEND = [
  { label: "Entities", color: NODE_COLORS.entity },
  { label: "Concepts", color: NODE_COLORS.concept },
  { label: "Sources", color: NODE_COLORS.document },
  { label: "Sessions", color: NODE_COLORS.session },
];

type Props = {
  data: GraphData;
  sleeping: boolean;
  width: number;
  height: number;
};

export default function BrainGraph({ data, sleeping, width, height }: Props) {
  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({ ...l })),
    }),
    [data]
  );

  return (
    <div className="relative h-full w-full">
      {/* ambient glow behind the graph; breathes during sleep */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${sleeping ? "sleeping-veil" : "opacity-20"}`}
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, #2a2452 0%, transparent 70%)",
        }}
      />
      {/* faint oscilloscope rings — instrument framing for the brain */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {[140, 280, 420].map((r) => (
          <circle
            key={r}
            cx="50%"
            cy="47%"
            r={r}
            fill="none"
            stroke="#1a1731"
            strokeWidth="1"
          />
        ))}
      </svg>
      <ForceGraph2D
        width={width}
        height={height}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeLabel={(n) => `${(n as { label: string }).label}`}
        linkColor={() => (sleeping ? "#2b2547" : "#3b3363")}
        linkWidth={1}
        cooldownTicks={120}
        nodeCanvasObject={(node, ctx, scale) => {
          const n = node as { x?: number; y?: number; label: string; type: string };
          if (n.x === undefined || n.y === undefined) return;
          const color = colorFor(n.type);
          const r = 4;
          ctx.save();
          if (sleeping) ctx.globalAlpha = 0.45;
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          // 2px surface ring so overlapping nodes stay separable
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1.5 / scale;
          ctx.strokeStyle = "#0b0a14";
          ctx.stroke();
          if (scale > 2.2) {
            ctx.font = `${11 / scale}px var(--font-plex-mono), monospace`;
            ctx.fillStyle = "#9a93b0";
            ctx.textAlign = "center";
            ctx.fillText(n.label.slice(0, 28), n.x, n.y + r + 10 / scale);
          }
          ctx.restore();
        }}
      />
      <div className="pointer-events-none absolute bottom-4 left-4 flex gap-4 font-mono text-[11px] text-ink-dim">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>
      {data.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-2xl italic text-ink-dim">
            An empty mind.
          </p>
          <p className="max-w-xs text-sm text-ink-faint">
            Tell REM something worth keeping — every message becomes part of this
            graph.
          </p>
        </div>
      )}
    </div>
  );
}
