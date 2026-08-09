export enum ChatState {
  START = "START",
  SELECTING_SERVICE = "SELECTING_SERVICE",
  SELECTING_DATE = "SELECTING_DATE",
  SELECTING_TIME = "SELECTING_TIME",
  CONFIRMING = "CONFIRMING",
}

export interface SessionMetadata {
  serviceId?: number;
  serviceName?: string;
  price?: string;
  date?: string; // Formato YYYY-MM-DD
  time?: string; // Formato HH:MM
  clientName?: string;
}

export interface IncomingMessageInfo {
  from: string; // Número de teléfono (wa_id)
  name: string; // Nombre del perfil
  body: string; // Cuerpo del mensaje
}

export function parseWhatsAppWebhook(body: any): IncomingMessageInfo | null {
  try {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];
    const contact = change?.contacts?.[0];

    if (!message || !contact) {
      return null;
    }

    return {
      from: contact.wa_id,
      name: contact.profile?.name || "Cliente",
      body: message.text?.body?.trim() || "",
    };
  } catch (error) {
    console.error("Error parsing WhatsApp webhook:", error);
    return null;
  }
}
