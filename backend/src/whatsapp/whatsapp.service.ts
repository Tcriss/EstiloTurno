import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE, DrizzleDB, schema } from "../database/database.module";
import { ScheduleService } from "../schedule/schedule.service";
import { eq } from "drizzle-orm";
import { ChatState, parseWhatsAppWebhook } from "./types";
import { handleChatState } from "./state-handlers";

@Injectable()
export class WhatsappService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly scheduleService: ScheduleService
  ) {}

  verifyWebhook(mode: string, token: string, challenge: string) {
    const verifyToken = this.configService.get<string>("WHATSAPP_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken && challenge) {
      return challenge;
    }

    return null;
  }

  async handleIncomingWebhook(body: any) {
    console.log("Incoming WhatsApp payload:", JSON.stringify(body, null, 2));

    const parsed = parseWhatsAppWebhook(body);
    if (!parsed) {
      // Ignorar eventos que no sean mensajes de texto del cliente (status updates, etc.)
      return { received: true };
    }

    const { from: phoneNumber, name: clientName, body: messageBody } = parsed;

    try {
      // 1. Consultar el estado conversacional actual del cliente
      let currentSession = await this.db.query.conversationStates.findFirst({
        where: (cs, { eq }) => eq(cs.id, phoneNumber),
      });

      let state = ChatState.START;
      let metadata: any = {};


      if (currentSession) {
        state = currentSession.state as ChatState;
        metadata = currentSession.metadata;
      }

      // 2. Procesar el mensaje con la máquina de estados
      const result = await handleChatState(
        state,
        messageBody,
        metadata,
        clientName,
        phoneNumber,
        this.scheduleService
      );

      // 3. Persistir el nuevo estado y metadata en la base de datos (Upsert)
      await this.db
        .insert(schema.conversationStates)
        .values({
          id: phoneNumber,
          state: result.nextState,
          metadata: result.updatedMetadata,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.conversationStates.id,
          set: {
            state: result.nextState,
            metadata: result.updatedMetadata,
            updatedAt: new Date(),
          },
        });

      // 4. Responder al cliente en WhatsApp
      console.log(`Sending response to ${phoneNumber} [State: ${result.nextState}]: ${result.responseMessage}`);
      await this.sendTextMessage(phoneNumber, result.responseMessage);

      return { received: true };
    } catch (error) {
      console.error("Error processing incoming webhook message:", error);
      // Retornamos recibido aunque falle internamente para evitar que Meta reintente indefinidamente la petición
      return { received: true };
    }
  }

  async sendTextMessage(to: string, message: string) {
    if (!to || !message) {
      throw new BadRequestException("The destination phone number and message are required.");
    }

    const accessToken = this.configService.get<string>("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = this.configService.get<string>("WHATSAPP_PHONE_NUMBER_ID");

    if (!accessToken || !phoneNumberId) {
      throw new InternalServerErrorException("WhatsApp credentials are not configured.");
    }

    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message,
        },
      }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      console.error("WhatsApp Cloud API error:", data);
      throw new InternalServerErrorException("Could not send the WhatsApp message.");
    }

    return data;
  }
}
