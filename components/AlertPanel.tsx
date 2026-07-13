"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { useSocketEvent } from "@/lib/socket-client";
import type { AlertPayload } from "@/lib/socket-events";
import { cn, formatDateTime } from "@/lib/utils";

type Alert = AlertPayload & {
  patient?: { user: { name: string }; roomNumber: string | null };
};

export function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts");
    if (res.ok) setAlerts(await res.json());
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    const id = setInterval(fetchAlerts, 4000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  useSocketEvent("alert:new", useCallback((alert: AlertPayload) => {
    setAlerts((prev) => [alert as Alert, ...prev]);
  }, []));

  useSocketEvent("alert:updated", useCallback((alert: AlertPayload) => {
    if (alert.acknowledged) {
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    }
  }, []));

  const acknowledge = async (id: string) => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, acknowledged: true }),
    });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const severityIcon = {
    INFO: "text-blue-500",
    WARNING: "text-amber-500",
    CRITICAL: "text-red-500",
  };

  const severityBg = {
    INFO: "border-blue-200 bg-blue-50",
    WARNING: "border-amber-200 bg-amber-50",
    CRITICAL: "border-red-200 bg-red-50 animate-slide-in",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-slate-900">Live Alerts</h2>
        </div>
        {alerts.length > 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            {alerts.length}
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto p-3">
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No active alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn("rounded-xl border p-3", severityBg[alert.severity])}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <AlertTriangle
                      className={cn("mt-0.5 h-4 w-4 shrink-0", severityIcon[alert.severity])}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{alert.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {alert.patient?.user.name}
                        {alert.patient?.roomNumber && ` · Room ${alert.patient.roomNumber}`}
                        {" · "}
                        {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledge(alert.id)}
                    className="shrink-0 rounded-lg bg-white/80 p-1.5 text-slate-500 transition hover:bg-white hover:text-emerald-600"
                    title="Acknowledge"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
