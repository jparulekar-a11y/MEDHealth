"use client";

import { cn, getVitalStatus } from "@/lib/utils";

type VitalCardProps = {
  label: string;
  value: string | number;
  unit: string;
  type: "heartRate" | "systolicBP" | "diastolicBP" | "oxygenSat" | "temperature";
  numericValue: number;
};

const statusStyles = {
  normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  critical: "border-red-200 bg-red-50 text-red-700",
};

export function VitalCard({ label, value, unit, type, numericValue }: VitalCardProps) {
  const status = getVitalStatus(type, numericValue);

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border p-3 transition-colors sm:p-4",
        statusStyles[status]
      )}
    >
      <p className="mb-1.5 truncate text-[11px] font-medium leading-tight opacity-80 sm:text-xs">
        {label}
      </p>
      <p className="text-xl font-bold tabular-nums sm:text-2xl">
        {value}
        <span className="ml-0.5 text-xs font-normal opacity-70 sm:ml-1 sm:text-sm">{unit}</span>
      </p>
    </div>
  );
}
