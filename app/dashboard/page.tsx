"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HeartPulse, LogOut } from "lucide-react";
import { AlertPanel } from "@/components/AlertPanel";
import { AppointmentList } from "@/components/AppointmentList";
import { ChatPanel } from "@/components/ChatPanel";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { LoginModal } from "@/components/LoginModal";
import { PatientList } from "@/components/PatientList";
import { RecordVitalsForm } from "@/components/RecordVitalsForm";
import { VitalsMonitor } from "@/components/VitalsMonitor";
import { clearSession, getSession, setSession, type SessionUser } from "@/lib/session";

type Patient = {
  id: string;
  user: { id: string; name: string };
};

export default function DashboardPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setCurrentUser(getSession());
    setAuthChecked(true);
  }, []);

  const handleLogin = (user: SessionUser) => {
    setSession(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const handleSelectPatient = useCallback(async (id: string) => {
    setSelectedPatientId(id);
    const res = await fetch("/api/patients");
    if (res.ok) {
      const patients: Patient[] = await res.json();
      const patient = patients.find((p) => p.id === id);
      setSelectedPatientName(patient?.user.name || "");
    }
  }, []);

  if (!authChecked) {
    return null;
  }

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
            {currentUser && (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  Signed in as <strong>{currentUser.name}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            )}
            <ConnectionStatus />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Care Dashboard</h1>
        </div>

        <div className={currentUser ? "" : "pointer-events-none select-none blur-sm"}>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <PatientList selectedId={selectedPatientId} onSelect={handleSelectPatient} />
            </div>

            <div className="space-y-6 lg:col-span-6">
              <VitalsMonitor patientId={selectedPatientId} patientName={selectedPatientName} />
              <RecordVitalsForm patientId={selectedPatientId} />
              <ChatPanel
                patientId={selectedPatientId}
                currentUserId={currentUser?.id || ""}
                currentUserName={currentUser?.name || "Staff"}
              />
            </div>

            <div className="space-y-6 lg:col-span-3">
              <AlertPanel />
              <AppointmentList />
            </div>
          </div>
        </div>
      </main>

      {!currentUser && <LoginModal onLogin={handleLogin} />}
    </div>
  );
}
