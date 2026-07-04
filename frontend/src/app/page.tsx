"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BrainGraph from "@/components/BrainGraph";
import ChatPanel from "@/components/ChatPanel";
import { api, type GraphData } from "@/lib/api";

const EMPTY: GraphData = { nodes: [], links: [] };

export default function Home() {
  const [graph, setGraph] = useState<GraphData>(EMPTY);
  const [sessionId] = useState(
    () => `session_${new Date().toISOString().slice(0, 10)}`
  );
  const [sleeping, setSleeping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingForget, setConfirmingForget] = useState(false);
  const graphBox = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 600, h: 600 });

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
    setSleeping(true);
    try {
      // bridge this session's chat memories into the permanent graph
      await api.sleep([sessionId]);
      const after = await api.graph();
      setGraph(after);
      const delta = after.nodes.length - before;
      flash(
        `REM slept on it. ${before} → ${after.nodes.length} nodes` +
          (delta === 0
            ? " — memory reviewed, nothing to consolidate"
            : delta > 0
              ? " — this session's memories joined the permanent graph"
              : " — stale memories pruned")
      );
    } catch {
      flash("Sleep failed — is the backend awake?");
    } finally {
      setSleeping(false);
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
      <header className="flex items-center justify-between border-b border-panel-edge px-5 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-2xl italic text-ink">REM</h1>
          <p className="hidden text-xs text-ink-dim sm:block">
            the AI that sleeps on it
          </p>
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
          aria-label="Chat with REM"
          className="flex h-1/2 flex-col border-b border-panel-edge md:h-auto md:w-[420px] md:border-b-0 md:border-r"
        >
          <ChatPanel sessionId={sessionId} onMemoryChanged={refreshGraph} />
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
            <div className="pointer-events-none absolute inset-x-0 top-6 text-center">
              <p className="font-display text-lg italic text-ink-dim">
                consolidating memories…
              </p>
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
