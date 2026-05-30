"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";
import { useSocket, useSocketEvent } from "@/lib/socket-client";
import type { VitalReadingPayload } from "@/lib/socket-events";
import { formatDateTime } from "@/lib/utils";
import { VitalCard } from "./VitalCard";

type Vital = VitalReadingPayload;

type Props = {
  patientId: string | null;
  patientName?: string;
};

export function VitalsMonitor({ patientId, patientName }: Props) {
  const { socket } = useSocket();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [latest, setLatest] = useState<Vital | null>(null);

  const fetchVitals = useCallback(async () => {
    if (!patientId) return;
    const res = await fetch(`/api/vitals?patientId=${patientId}&limit=20`);
    if (res.ok) {
      const data = await res.json();
      setVitals(data);
      setLatest(data[0] || null);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  useEffect(() => {
    if (!patientId) return;
    socket.emit("vitals:subscribe", patientId);
    return () => {
      socket.emit("vitals:unsubscribe", patientId);
    };
  }, [patientId, socket]);

  useSocketEvent(
    "vitals:new",
    useCallback(
      (reading: VitalReadingPayload) => {
        if (reading.patientId !== patientId) return;
        setLatest(reading);
        setVitals((prev) => [reading, ...prev.slice(0, 19)]);
      },
      [patientId]
    )
  );

  if (!patientId) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
        <p className="text-sm text-slate-500">Select a patient to view live vitals</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-600" />
          <div>
            <h2 className="font-semibold text-slate-900">Live Vitals</h2>
            <p className="text-xs text-slate-500">{patientName}</p>
          </div>
        </div>
        {latest && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(latest.recordedAt)}
          </div>
        )}
      </div>

      {latest ? (
        <>
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 sm:gap-3 sm:p-5 xl:grid-cols-5">
            <VitalCard
              label="Heart rate"
              value={latest.heartRate}
              unit="bpm"
              type="heartRate"
              numericValue={latest.heartRate}
            />
            <VitalCard
              label="Systolic"
              value={latest.systolicBP}
              unit="mmHg"
              type="systolicBP"
              numericValue={latest.systolicBP}
            />
            <VitalCard
              label="Diastolic"
              value={latest.diastolicBP}
              unit="mmHg"
              type="diastolicBP"
              numericValue={latest.diastolicBP}
            />
            <VitalCard
              label="SpO₂"
              value={latest.oxygenSat}
              unit="%"
              type="oxygenSat"
              numericValue={latest.oxygenSat}
            />
            <VitalCard
              label="Temp"
              value={latest.temperature.toFixed(1)}
              unit="°C"
              type="temperature"
              numericValue={latest.temperature}
            />
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recent Readings
            </h3>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {vitals.slice(1).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                >
                  <span className="text-slate-600">
                    HR {v.heartRate} · {v.systolicBP}/{v.diastolicBP} · SpO2 {v.oxygenSat}% ·{" "}
                    {v.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-slate-400">{formatDateTime(v.recordedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-sm text-slate-500">No vitals recorded yet</p>
      )}
    </div>
  );
}
