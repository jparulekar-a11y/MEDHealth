"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";

type Props = {
  patientId: string | null;
  onRecorded?: () => void;
};

export function RecordVitalsForm({ patientId, onRecorded }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    heartRate: "72",
    systolicBP: "120",
    diastolicBP: "80",
    oxygenSat: "98",
    temperature: "36.6",
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientId || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          ...form,
          source: "manual",
        }),
      });
      if (res.ok) {
        setOpen(false);
        onRecorded?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!patientId) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Record Vitals</h2>
          <p className="text-xs text-slate-500">Saved to database & broadcast live</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          {open ? "Close" : "New Reading"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="border-t border-slate-100 px-5 py-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(
              [
                ["heartRate", "Heart Rate", "bpm"],
                ["systolicBP", "Systolic BP", "mmHg"],
                ["diastolicBP", "Diastolic BP", "mmHg"],
                ["oxygenSat", "SpO2", "%"],
                ["temperature", "Temp", "°C"],
              ] as const
            ).map(([key, label, unit]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {label} ({unit})
                </label>
                <input
                  type="number"
                  step={key === "temperature" ? "0.1" : "1"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  required
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save & Broadcast"}
          </button>
        </form>
      )}
    </div>
  );
}
