export const WHATSAPP_MESSENGER = Symbol("WHATSAPP_MESSENGER");

export interface WhatsappMessenger {
  /**
   * Envía un texto al cliente. `phoneNumberId` permite enviar desde el número
   * del negocio correspondiente; sin él se usa el configurado por entorno.
   */
  sendText(to: string, message: string, phoneNumberId?: string): Promise<unknown>;
}
