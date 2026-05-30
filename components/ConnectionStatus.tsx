"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useSocket } from "@/lib/socket-client";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const { connected } = useSocket();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        connected
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      )}
    >
      {connected ? (
        <>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <Wifi className="h-3.5 w-3.5" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          Connecting...
        </>
      )}
    </div>
  );
}
