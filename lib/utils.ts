import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getVitalStatus(
  type: "heartRate" | "systolicBP" | "diastolicBP" | "oxygenSat" | "temperature",
  value: number
): "normal" | "warning" | "critical" {
  switch (type) {
    case "heartRate":
      if (value < 50 || value > 120) return "critical";
      if (value < 60 || value > 100) return "warning";
      return "normal";
    case "systolicBP":
      if (value < 90 || value > 160) return "critical";
      if (value < 100 || value > 140) return "warning";
      return "normal";
    case "diastolicBP":
      if (value < 60 || value > 100) return "critical";
      if (value < 70 || value > 90) return "warning";
      return "normal";
    case "oxygenSat":
      if (value < 90) return "critical";
      if (value < 95) return "warning";
      return "normal";
    case "temperature":
      if (value < 35 || value > 39.5) return "critical";
      if (value < 36.1 || value > 37.8) return "warning";
      return "normal";
  }
}

export function checkVitalsForAlerts(vitals: {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  oxygenSat: number;
  temperature: number;
}) {
  const alerts: { severity: "WARNING" | "CRITICAL"; title: string; message: string }[] = [];

  const checks: { key: keyof typeof vitals; label: string; unit: string }[] = [
    { key: "heartRate", label: "Heart Rate", unit: "bpm" },
    { key: "systolicBP", label: "Systolic BP", unit: "mmHg" },
    { key: "diastolicBP", label: "Diastolic BP", unit: "mmHg" },
    { key: "oxygenSat", label: "SpO2", unit: "%" },
    { key: "temperature", label: "Temperature", unit: "°C" },
  ];

  for (const check of checks) {
    const status = getVitalStatus(check.key, vitals[check.key]);
    if (status === "critical") {
      alerts.push({
        severity: "CRITICAL",
        title: `${check.label} Critical`,
        message: `${check.label} is ${vitals[check.key]}${check.unit} — immediate attention required.`,
      });
    } else if (status === "warning") {
      alerts.push({
        severity: "WARNING",
        title: `${check.label} Warning`,
        message: `${check.label} is ${vitals[check.key]}${check.unit} — outside normal range.`,
      });
    }
  }

  return alerts;
}
