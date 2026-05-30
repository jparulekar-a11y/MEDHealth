import type { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./lib/socket-events";

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function initSocketServer(httpServer: HTTPServer) {
  if (io) return io;

  io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  const onlinePatients = new Set<string>();

  io.on("connection", (socket) => {
    socket.on("vitals:subscribe", (patientId) => {
      socket.join(`vitals:${patientId}`);
    });

    socket.on("vitals:unsubscribe", (patientId) => {
      socket.leave(`vitals:${patientId}`);
    });

    socket.on("chat:join", (patientId) => {
      socket.join(`chat:${patientId}`);
    });

    socket.on("chat:leave", (patientId) => {
      socket.leave(`chat:${patientId}`);
    });

    socket.on("patient:online", (patientId) => {
      onlinePatients.add(patientId);
      io?.emit("patients:online", Array.from(onlinePatients));
    });

    socket.on("disconnect", () => {
      // Individual patient offline tracking would need per-socket mapping
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function emitVitalReading(reading: Parameters<ServerToClientEvents["vitals:new"]>[0]) {
  getIO().to(`vitals:${reading.patientId}`).emit("vitals:new", reading);
  getIO().emit("vitals:new", reading);
}

export function emitAlert(alert: Parameters<ServerToClientEvents["alert:new"]>[0]) {
  getIO().emit("alert:new", alert);
}

export function emitAlertUpdate(alert: Parameters<ServerToClientEvents["alert:updated"]>[0]) {
  getIO().emit("alert:updated", alert);
}

export function emitMessage(message: Parameters<ServerToClientEvents["message:new"]>[0]) {
  getIO().to(`chat:${message.patientId}`).emit("message:new", message);
}

export function emitAppointmentUpdate(
  appointment: Parameters<ServerToClientEvents["appointment:updated"]>[0]
) {
  getIO().emit("appointment:updated", appointment);
}
