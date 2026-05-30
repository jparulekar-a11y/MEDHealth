"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { AlertPanel } from "@/components/AlertPanel";
import { AppointmentList } from "@/components/AppointmentList";
import { ChatPanel } from "@/components/ChatPanel";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PatientList } from "@/components/PatientList";
import { RecordVitalsForm } from "@/components/RecordVitalsForm";
import { VitalsMonitor } from "@/components/VitalsMonitor";

type Patient = {
  id: string;
  user: { id: string; name: string };
};

type Staff = {
  id: string;
  name: string;
  role: string;
};

export default function DashboardPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((staff: Staff[]) => {
        const nurse = staff.find((s) => s.role === "NURSE") || staff[0];
        setCurrentStaff(nurse);
      });
  }, []);

  const handleSelectPatient = useCallback(async (id: string) => {
    setSelectedPatientId(id);
    const res = await fetch("/api/patients");
    if (res.ok) {
      const patients: Patient[] = await res.json();
      const patient = patients.find((p) => p.id === id);
      setSelectedPatientName(patient?.user.name || "");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900">MEDHealth</span>
          </Link>
          <div className="flex items-center gap-4">
            {currentStaff && (
              <span className="hidden text-sm text-slate-600 sm:inline">
                Signed in as <strong>{currentStaff.name}</strong>
              </span>
            )}
            <ConnectionStatus />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Care Dashboard</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <PatientList selectedId={selectedPatientId} onSelect={handleSelectPatient} />
          </div>

          <div className="space-y-6 lg:col-span-6">
            <VitalsMonitor patientId={selectedPatientId} patientName={selectedPatientName} />
            <RecordVitalsForm patientId={selectedPatientId} />
            <ChatPanel
              patientId={selectedPatientId}
              currentUserId={currentStaff?.id || ""}
              currentUserName={currentStaff?.name || "Staff"}
            />
          </div>

          <div className="space-y-6 lg:col-span-3">
            <AlertPanel />
            <AppointmentList />
          </div>
        </div>
      </main>
    </div>
  );
}
