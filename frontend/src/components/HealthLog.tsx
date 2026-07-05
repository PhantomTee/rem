"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Props = {
  sessionId: string;
};

type Kind = "medication" | "symptom";

export default function HealthLog({ sessionId }: Props) {
  const [kind, setKind] = useState<Kind>("medication");
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medications, setMedications] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const refreshSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const summary = await api.healthSummary(sessionId);
      setMedications(summary.medications);
      setSymptoms(summary.symptoms);
    } catch {
      /* backend not up yet */
    } finally {
      setLoadingSummary(false);
    }
  }, [sessionId]);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  async function submit() {
    setError(null);
    if (kind === "medication" && !name.trim()) {
      setError("Medication name is required.");
      return;
    }
    if (kind === "symptom" && !description.trim()) {
      setError("Symptom description is required.");
      return;
    }
    setBusy(true);
    try {
      if (kind === "medication") {
        await api.logMedication(
          name.trim(),
          dosage.trim() || undefined,
          frequency.trim() || undefined,
          sessionId
        );
        setName("");
        setDosage("");
        setFrequency("");
      } else {
        await api.logSymptom(description.trim(), severity, sessionId);
        setDescription("");
        setSeverity(5);
      }
      await refreshSummary();
    } catch {
      setError("Couldn't save that entry. Check the backend is running, then try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-panel-edge p-4">
        <p className="text-xs leading-relaxed text-ink-faint">
          REM is not a medical professional. Information is stored and recalled
          as reported — it is not verified, diagnostic, or a substitute for
          advice from a qualified healthcare provider.
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setKind("medication")}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                kind === "medication"
                  ? "bg-glow text-[#1d1305]"
                  : "border border-panel-edge text-ink-dim hover:text-ink"
              }`}
            >
              Medication
            </button>
            <button
              onClick={() => setKind("symptom")}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                kind === "symptom"
                  ? "bg-glow text-[#1d1305]"
                  : "border border-panel-edge text-ink-dim hover:text-ink"
              }`}
            >
              Symptom
            </button>
          </div>

          {kind === "medication" ? (
            <div className="space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Medication name"
                aria-label="Medication name"
                className="w-full rounded-xl border border-panel-edge bg-panel px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Dosage (e.g. 500mg)"
                  aria-label="Dosage"
                  className="w-1/2 rounded-xl border border-panel-edge bg-panel px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none"
                />
                <input
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="Frequency (e.g. twice daily)"
                  aria-label="Frequency"
                  className="w-1/2 rounded-xl border border-panel-edge bg-panel px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the symptom"
                aria-label="Symptom description"
                className="w-full rounded-xl border border-panel-edge bg-panel px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-glow focus:outline-none"
              />
              <label className="flex items-center gap-3 text-xs text-ink-dim">
                Severity
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-mono text-ink">{severity}/10</span>
              </label>
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-glow px-4 py-2.5 text-sm font-medium text-[#1d1305] transition-opacity disabled:opacity-40"
          >
            {busy ? "Logging… (takes 15–20s)" : `Log ${kind}`}
          </button>
          {error && <p className="mt-2 text-xs text-[#c9627e]">{error}</p>}
        </div>

        <div>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Current medications
          </h3>
          {loadingSummary && medications.length === 0 ? (
            <p className="text-xs text-ink-faint">recalling…</p>
          ) : medications.length === 0 ? (
            <p className="text-xs text-ink-faint">none recalled yet</p>
          ) : (
            <ul className="space-y-1.5">
              {medications.map((m, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-panel-edge bg-panel px-3 py-2 text-sm text-ink"
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Recent symptoms
          </h3>
          {loadingSummary && symptoms.length === 0 ? (
            <p className="text-xs text-ink-faint">recalling…</p>
          ) : symptoms.length === 0 ? (
            <p className="text-xs text-ink-faint">none recalled yet</p>
          ) : (
            <ul className="space-y-1.5">
              {symptoms.map((s, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-panel-edge bg-panel px-3 py-2 text-sm text-ink"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
