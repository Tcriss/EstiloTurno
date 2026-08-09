import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BusinessModule } from "../business/business.module";
import { ScheduleModule } from "../schedule/schedule.module";
import { HandleIncomingMessageUseCase } from "./application/use-cases/handle-incoming-message.use-case";
import { SendTextMessageUseCase } from "./application/use-cases/send-text-message.use-case";
import { VerifyWebhookChallengeUseCase } from "./application/use-cases/verify-webhook-challenge.use-case";
import { NluConversationService } from "./application/services/nlu-conversation.service";
import { CONVERSATION_STATE_REPOSITORY } from "./domain/ports/conversation-state.repository";
import { NLU_ENGINE, NluEngine } from "./domain/ports/nlu-engine";
import { WHATSAPP_MESSENGER } from "./domain/ports/whatsapp-messenger";
import { AnthropicNluAdapter } from "./infrastructure/nlu/anthropic-nlu.adapter";
import { OpenAiNluAdapter } from "./infrastructure/nlu/openai-nlu.adapter";
import { WhatsappCloudApiClient } from "./infrastructure/messaging/whatsapp-cloud-api.client";
import { DrizzleConversationStateRepository } from "./infrastructure/persistence/drizzle-conversation-state.repository";
import { WhatsappSignatureGuard } from "./presentation/guards/whatsapp-signature.guard";
import { WhatsappController } from "./presentation/whatsapp.controller";

@Module({
  imports: [ScheduleModule, BusinessModule],
  controllers: [WhatsappController],
  providers: [
    HandleIncomingMessageUseCase,
    SendTextMessageUseCase,
    VerifyWebhookChallengeUseCase,
    NluConversationService,
    WhatsappSignatureGuard,
    { provide: CONVERSATION_STATE_REPOSITORY, useClass: DrizzleConversationStateRepository },
    { provide: WHATSAPP_MESSENGER, useClass: WhatsappCloudApiClient },
    {
      provide: NLU_ENGINE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): NluEngine | null => {
        const provider = configService.get<string>("LLM_PROVIDER");
        const apiKey = configService.get<string>("LLM_API_KEY");
        const model = configService.get<string>("LLM_MODEL");

        if (!provider || !apiKey) {
          // Sin proveedor configurado, el bot cae al flujo de menús numéricos (fallback determinista)
          return null;
        }

        switch (provider) {
          case "anthropic":
            return new AnthropicNluAdapter(apiKey, model);
          case "openai":
            return new OpenAiNluAdapter(apiKey, model);
          default:
            return null;
        }
      },
    },
  ],
})
export class WhatsappModule {}
