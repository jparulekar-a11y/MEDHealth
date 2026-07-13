"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useSocket } from "@/lib/socket-client";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const { connected } = useSocket();
  const socketsDisabled = process.env.NEXT_PUBLIC_ENABLE_SOCKETS === "false";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        connected || socketsDisabled
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      )}
    >
      {connected ? (
        <>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <Wifi className="h-3.5 w-3.5" />
          Live
        </>
      ) : socketsDisabled ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          Syncing...
        </>
      )}
    </div>
  );
}
