export type VitalReadingPayload = {
  id: string;
  patientId: string;
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  oxygenSat: number;
  temperature: number;
  recordedAt: string;
  source: string;
  patient?: {
    id: string;
    roomNumber: string | null;
    user: { name: string };
  };
};

export type AlertPayload = {
  id: string;
  patientId: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  acknowledged: boolean;
  createdAt: string;
  patient?: {
    user: { name: string };
    roomNumber: string | null;
  };
};

export type MessagePayload = {
  id: string;
  patientId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { name: string; role: string };
};

export type AppointmentPayload = {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  duration: number;
  reason: string;
  status: string;
  patient: { user: { name: string }; roomNumber: string | null };
  doctor: { name: string };
};

export type ServerToClientEvents = {
  "vitals:new": (reading: VitalReadingPayload) => void;
  "vitals:history": (readings: VitalReadingPayload[]) => void;
  "alert:new": (alert: AlertPayload) => void;
  "alert:updated": (alert: AlertPayload) => void;
  "message:new": (message: MessagePayload) => void;
  "appointment:updated": (appointment: AppointmentPayload) => void;
  "patients:online": (patientIds: string[]) => void;
};

export type ClientToServerEvents = {
  "vitals:subscribe": (patientId: string) => void;
  "vitals:unsubscribe": (patientId: string) => void;
  "chat:join": (patientId: string) => void;
  "chat:leave": (patientId: string) => void;
  "patient:online": (patientId: string) => void;
};

export type InterServerEvents = Record<string, never>;
export type SocketData = { userId?: string; role?: string };
