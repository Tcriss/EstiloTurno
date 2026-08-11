import { Inject, Injectable, Logger, Optional } from "@nestjs/common";
import { ResolveBusinessForWebhookUseCase } from "../../../business/application/use-cases/resolve-business-for-webhook.use-case";
import { CreateAppointmentUseCase } from "../../../schedule/application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "../../../schedule/application/use-cases/get-available-slots.use-case";
import { GetServicesUseCase } from "../../../schedule/application/use-cases/get-services.use-case";
import { ChatState, SessionMetadata } from "../../domain/entities/chat-session.entity";
import {
  CONVERSATION_STATE_REPOSITORY,
  ConversationStateRepository,
} from "../../domain/ports/conversation-state.repository";
import { NLU_ENGINE, NluEngine } from "../../domain/ports/nlu-engine";
import { WHATSAPP_MESSENGER, WhatsappMessenger } from "../../domain/ports/whatsapp-messenger";
import { parseWhatsAppWebhook } from "../../infrastructure/messaging/whatsapp-webhook.mapper";
import { handleChatState } from "../services/conversation-flow";
import { NluConversationService } from "../services/nlu-conversation.service";

// Enmascara el teléfono en logs, ej: 18095551234 -> ***1234. Nunca logueamos el texto del mensaje.
function maskPhone(phone: string): string {
  return phone.length <= 4 ? "***" : `***${phone.slice(-4)}`;
}

@Injectable()
export class HandleIncomingMessageUseCase {
  private readonly logger = new Logger(HandleIncomingMessageUseCase.name);

  constructor(
    @Inject(CONVERSATION_STATE_REPOSITORY) private readonly conversationStateRepository: ConversationStateRepository,
    @Inject(WHATSAPP_MESSENGER) private readonly whatsappMessenger: WhatsappMessenger,
    @Optional() @Inject(NLU_ENGINE) private readonly nluEngine: NluEngine | null,
    private readonly nluConversationService: NluConversationService,
    private readonly resolveBusinessForWebhookUseCase: ResolveBusinessForWebhookUseCase,
    private readonly getServicesUseCase: GetServicesUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly createAppointmentUseCase: CreateAppointmentUseCase
  ) {}

  async execute(rawBody: unknown): Promise<{ received: true }> {
    const parsed = parseWhatsAppWebhook(rawBody);
    if (!parsed) {
      // Ignorar eventos que no sean mensajes de texto del cliente (status updates, etc.)
      return { received: true };
    }

    const { from: phoneNumber, name: clientName, body: messageBody, phoneNumberId } = parsed;
    this.logger.log(`Mensaje entrante de ${maskPhone(phoneNumber)}`);

    try {
      const business = await this.resolveBusinessForWebhookUseCase.execute(phoneNumberId);
      if (!business || !business.botEnabled) {
        return { received: true };
      }

      const senderPhoneNumberId = business.whatsappPhoneNumberId ?? undefined;
      const session = await this.conversationStateRepository.find(phoneNumber, business.id);

      if (this.nluEngine) {
        // Camino principal: conversación en lenguaje natural con slot-filling vía LLM
        const result = await this.nluConversationService.handleMessage(
          this.nluEngine,
          business,
          phoneNumber,
          clientName,
          messageBody,
          session?.metadata.history ?? []
        );

        await this.conversationStateRepository.save(phoneNumber, business.id, {
          state: ChatState.START,
          metadata: { history: result.history },
        });

        await this.whatsappMessenger.sendText(phoneNumber, result.reply, senderPhoneNumberId);
        return { received: true };
      }

      // Fallback determinista: máquina de estados por menús numéricos (sin LLM configurado)
      const state: ChatState = session?.state ?? ChatState.START;
      const metadata: SessionMetadata = session?.metadata ?? {};

      const result = await handleChatState(business.id, state, messageBody, metadata, clientName, phoneNumber, {
        getServices: this.getServicesUseCase,
        getAvailableSlots: this.getAvailableSlotsUseCase,
        createAppointment: this.createAppointmentUseCase,
      });

      await this.conversationStateRepository.save(phoneNumber, business.id, {
        state: result.nextState,
        metadata: result.updatedMetadata,
      });

      await this.whatsappMessenger.sendText(phoneNumber, result.responseMessage, senderPhoneNumberId);
      return { received: true };
    } catch (error) {
      this.logger.error("Error processing incoming webhook message:", error as Error);
      // Respondemos 200 igual para evitar que Meta reintente indefinidamente
      return { received: true };
    }
  }
}
