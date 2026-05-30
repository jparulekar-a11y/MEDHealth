"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./socket-events";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    if (s.connected) setConnected(true);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket: getSocket(), connected };
}

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K]
) {
  useEffect(() => {
    const s = getSocket();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    s.on(event, handler as any);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.off(event, handler as any);
    };
  }, [event, handler]);
}
