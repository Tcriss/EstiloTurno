export enum ChatState {
  START = "START",
  SELECTING_SERVICE = "SELECTING_SERVICE",
  SELECTING_DATE = "SELECTING_DATE",
  SELECTING_TIME = "SELECTING_TIME",
  CONFIRMING = "CONFIRMING",
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionMetadata {
  serviceId?: number;
  serviceName?: string;
  price?: string;
  date?: string; // Formato YYYY-MM-DD
  time?: string; // Formato HH:MM
  clientName?: string;
  tempSlots?: string[]; // Turnos ofrecidos en SELECTING_DATE, mapeados en SELECTING_TIME (solo fallback de menús)
  history?: HistoryMessage[]; // Historial de la conversación para el motor NLU
}

export interface ChatSession {
  state: ChatState;
  metadata: SessionMetadata;
}
