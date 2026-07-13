"use client";

import { useCallback, useEffect, useState } from "react";
import { User } from "lucide-react";
import { useSocketEvent } from "@/lib/socket-client";
import type { VitalReadingPayload } from "@/lib/socket-events";
import { cn, formatTime } from "@/lib/utils";

type Patient = {
  id: string;
  roomNumber: string | null;
  condition: string | null;
  user: { id: string; name: string; avatar: string | null };
  vitals: {
    heartRate: number;
    systolicBP: number;
    diastolicBP: number;
    oxygenSat: number;
    temperature: number;
    recordedAt: string;
  }[];
  alerts: { severity: string }[];
};

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function PatientList({ selectedId, onSelect }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);

  const fetchPatients = useCallback(async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const id = setInterval(fetchPatients, 4000);
    return () => clearInterval(id);
  }, [fetchPatients]);

  useSocketEvent(
    "vitals:new",
    useCallback((reading: VitalReadingPayload) => {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === reading.patientId
            ? {
                ...p,
                vitals: [
                  {
                    heartRate: reading.heartRate,
                    systolicBP: reading.systolicBP,
                    diastolicBP: reading.diastolicBP,
                    oxygenSat: reading.oxygenSat,
                    temperature: reading.temperature,
                    recordedAt: reading.recordedAt,
                  },
                ],
              }
            : p
        )
      );
    }, [])
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Patients</h2>
        <p className="text-xs text-slate-500">{patients.length} monitored</p>
      </div>

      <div className="divide-y divide-slate-100">
        {patients.map((patient) => {
          const latest = patient.vitals[0];
          const hasCritical = patient.alerts.some((a) => a.severity === "CRITICAL");
          const hasWarning = patient.alerts.some((a) => a.severity === "WARNING");

          return (
            <button
              key={patient.id}
              onClick={() => onSelect(patient.id)}
              className={cn(
                "flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50",
                selectedId === patient.id && "bg-brand-50 hover:bg-brand-50"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {patient.user.avatar || <User className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-slate-900">{patient.user.name}</p>
                  {hasCritical && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse-dot" />
                  )}
                  {!hasCritical && hasWarning && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Room {patient.roomNumber || "—"} · {patient.condition}
                </p>
                {latest && (
                  <p className="mt-1 text-xs text-slate-400">
                    HR {latest.heartRate} · BP {latest.systolicBP}/{latest.diastolicBP} · SpO2{" "}
                    {latest.oxygenSat}% · {formatTime(latest.recordedAt)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
