"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { useSocketEvent } from "@/lib/socket-client";
import type { AppointmentPayload } from "@/lib/socket-events";
import { cn, formatDateTime } from "@/lib/utils";

type Appointment = AppointmentPayload;

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-600",
};

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = useCallback(async () => {
    const res = await fetch("/api/appointments");
    if (res.ok) setAppointments(await res.json());
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useSocketEvent(
    "appointment:updated",
    useCallback((appt: AppointmentPayload) => {
      setAppointments((prev) => {
        const exists = prev.find((a) => a.id === appt.id);
        if (exists) {
          return prev.map((a) => (a.id === appt.id ? appt : a));
        }
        return [...prev, appt].sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
      });
    }, [])
  );

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Calendar className="h-5 w-5 text-brand-600" />
        <h2 className="font-semibold text-slate-900">Appointments</h2>
      </div>

      <div className="divide-y divide-slate-100">
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No appointments scheduled</p>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{appt.patient.user.name}</p>
                  <p className="text-sm text-slate-600">{appt.reason}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {appt.doctor.name} · {formatDateTime(appt.scheduledAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusColors[appt.status] || statusColors.SCHEDULED
                  )}
                >
                  {appt.status.replace("_", " ")}
                </span>
              </div>
              {appt.status === "SCHEDULED" && (
                <button
                  onClick={() => updateStatus(appt.id, "IN_PROGRESS")}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Start visit <ChevronRight className="h-3 w-3" />
                </button>
              )}
              {appt.status === "IN_PROGRESS" && (
                <button
                  onClick={() => updateStatus(appt.id, "COMPLETED")}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Complete visit <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
