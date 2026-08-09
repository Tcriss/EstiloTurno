export interface IncomingMessageInfo {
  from: string; // Número de teléfono (wa_id)
  name: string; // Nombre del perfil
  body: string; // Cuerpo del mensaje
  phoneNumberId: string | null; // Número del negocio que recibió el mensaje (routing multi-tenant)
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
      phoneNumberId: change?.metadata?.phone_number_id ?? null,
    };
  } catch (error) {
    console.error("Error parsing WhatsApp webhook:", error);
    return null;
  }
}
