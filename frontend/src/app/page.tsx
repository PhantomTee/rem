"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BrainGraph from "@/components/BrainGraph";
import ChatPanel from "@/components/ChatPanel";
import HealthLog from "@/components/HealthLog";
import Hypnogram, { type Stage } from "@/components/Hypnogram";
import { api, type GraphData } from "@/lib/api";

const EMPTY: GraphData = { nodes: [], links: [] };

const SLEEP_CAPTION: Record<Exclude<Stage, "wake">, string> = {
  n1: "drifting off…",
  n2: "sleep spindles firing…",
  n3: "slow-wave sleep — reviewing the day…",
  rem: "dreaming — consolidating memories into the graph…",
};

const LADDER: Stage[] = ["wake", "n1", "n2", "n3", "rem"];

export default function Home() {
  const [graph, setGraph] = useState<GraphData>(EMPTY);
  const [sessionId] = useState(
    () => `session_${new Date().toISOString().slice(0, 10)}`
  );
  const [stage, setStage] = useState<Stage>("wake");
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingForget, setConfirmingForget] = useState(false);
  const [tab, setTab] = useState<"chat" | "health">("chat");
  const graphBox = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 600, h: 600 });
  const sleeping = stage !== "wake";

  const refreshGraph = useCallback(async () => {
    try {
      setGraph(await api.graph());
    } catch {
      /* backend not up yet — the empty state explains itself */
    }
  }, []);

  useEffect(() => {
    refreshGraph();
    const t = setInterval(refreshGraph, 8000);
    return () => clearInterval(t);
  }, [refreshGraph]);

  useEffect(() => {
    const el = graphBox.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: e.contentRect.width, h: e.contentRect.height })
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 6000);
  }

  async function sleep() {
    if (sleeping) return;
    const before = graph.nodes.length;
    // descend the hypnogram while cognee consolidates; hold in REM until done
    const descent: [Stage, number][] = [
      ["n1", 0],
      ["n2", 3000],
      ["n3", 7000],
      ["rem", 13000],
    ];
    const timers = descent.map(([s, ms]) => setTimeout(() => setStage(s), ms));
    try {
      const slept = await api.sleep([sessionId]);
      const after = await api.graph();
      setGraph(after);
      const delta = after.nodes.length - before;
      flash(
        `REM woke up. ${before} → ${after.nodes.length} nodes` +
          (delta === 0
            ? " — memory reviewed, nothing to consolidate"
            : delta > 0
              ? " — this session's memories joined the permanent graph"
              : " — stale memories pruned") +
          (slept.archived ? " · archived to Cognee Cloud" : "")
      );
    } catch {
      flash("Sleep failed — is the backend awake?");
    } finally {
      timers.forEach(clearTimeout);
      setStage("wake");
    }
  }

  async function forgetEverything() {
    setConfirmingForget(false);
    try {
      await api.forget({ everything: true });
      await refreshGraph();
      flash("Forgotten. The graph is empty — last night never happened.");
    } catch {
      flash("Forget failed — is the backend awake?");
    }
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-panel-edge px-5 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-2xl italic text-ink">REM Health</h1>
          <p className="hidden text-xs text-ink-dim sm:block">
            the health companion that sleeps on it
          </p>
        </div>
        <div className="hidden lg:block">
          <Hypnogram stage={stage} />
        </div>
        <div className="flex items-center gap-5">
          <dl className="hidden gap-4 font-mono text-[11px] text-ink-dim md:flex">
            <div className="flex gap-1.5">
              <dt>memories</dt>
              <dd className="text-ink">{graph.nodes.length}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>connections</dt>
              <dd className="text-ink">{graph.links.length}</dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <button
              onClick={sleep}
              disabled={sleeping}
              className="rounded-xl border border-glow/50 px-3.5 py-1.5 text-sm text-glow transition-colors hover:bg-glow/10 disabled:opacity-50"
            >
              {sleeping ? "Sleeping…" : "Sleep"}
            </button>
            <button
              onClick={() => setConfirmingForget(true)}
              className="rounded-xl border border-panel-edge px-3.5 py-1.5 text-sm text-ink-dim transition-colors hover:border-[#c9627e] hover:text-[#c9627e]"
            >
              Forget
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section
          aria-label="REM Health"
          className="flex h-1/2 flex-col border-b border-panel-edge md:h-auto md:w-[420px] md:border-b-0 md:border-r"
        >
          <div className="flex border-b border-panel-edge">
            <button
              onClick={() => setTab("chat")}
              className={`flex-1 px-4 py-2.5 text-sm transition-colors ${
                tab === "chat"
                  ? "border-b-2 border-glow text-ink"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setTab("health")}
              className={`flex-1 px-4 py-2.5 text-sm transition-colors ${
                tab === "health"
                  ? "border-b-2 border-glow text-ink"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              Health Log
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {tab === "chat" ? (
              <ChatPanel sessionId={sessionId} onMemoryChanged={refreshGraph} />
            ) : (
              <HealthLog sessionId={sessionId} />
            )}
          </div>
        </section>
        <section
          ref={graphBox}
          aria-label="REM's memory graph"
          className="relative min-h-0 flex-1"
        >
          <BrainGraph
            data={graph}
            sleeping={sleeping}
            width={box.w}
            height={box.h}
          />
          {sleeping && (
            <div className="pointer-events-none absolute inset-x-0 top-8 flex flex-col items-center gap-3 text-center">
              <p className="font-display text-lg italic text-glow">
                {SLEEP_CAPTION[stage]}
              </p>
              <ol className="flex gap-3 font-mono text-[11px] tracking-widest">
                {LADDER.map((s) => (
                  <li
                    key={s}
                    className={
                      s === stage
                        ? "text-glow"
                        : LADDER.indexOf(s) < LADDER.indexOf(stage)
                          ? "text-ink-dim"
                          : "text-ink-faint"
                    }
                  >
                    {s.toUpperCase()}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-xl border border-panel-edge bg-panel px-4 py-2.5 text-sm text-ink shadow-xl"
        >
          {notice}
        </div>
      )}

      {confirmingForget && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-panel-edge bg-panel p-5">
            <h2 className="font-display text-lg italic">Forget everything?</h2>
            <p className="mt-2 text-sm text-ink-dim">
              This surgically deletes REM&apos;s entire memory — every node and
              connection in the graph. There is no undo.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmingForget(false)}
                className="rounded-xl px-3.5 py-1.5 text-sm text-ink-dim hover:text-ink"
              >
                Keep memories
              </button>
              <button
                onClick={forgetEverything}
                className="rounded-xl bg-[#c9627e] px-3.5 py-1.5 text-sm font-medium text-[#230812]"
              >
                Forget everything
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
