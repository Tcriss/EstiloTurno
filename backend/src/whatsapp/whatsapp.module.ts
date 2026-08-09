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
import { GeminiNluAdapter } from "./infrastructure/nlu/gemini-nlu.adapter";
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
        if (!provider) {
          // Sin proveedor configurado, el bot cae al flujo de menús numéricos (fallback determinista)
          return null;
        }

        // Vars específicas por proveedor (ANTHROPIC_API_KEY, GEMINI_MODEL, etc.) tienen prioridad
        // sobre las genéricas LLM_API_KEY / LLM_MODEL, así se pueden tener las tres keys cargadas
        // en simultáneo y alternar de proveedor solo tocando LLM_PROVIDER.
        const resolve = (prefix: string) => ({
          apiKey: configService.get<string>(`${prefix}_API_KEY`) ?? configService.get<string>("LLM_API_KEY"),
          model: configService.get<string>(`${prefix}_MODEL`) ?? configService.get<string>("LLM_MODEL"),
        });

        switch (provider) {
          case "anthropic": {
            const { apiKey, model } = resolve("ANTHROPIC");
            return apiKey ? new AnthropicNluAdapter(apiKey, model) : null;
          }
          case "openai": {
            const { apiKey, model } = resolve("OPENAI");
            return apiKey ? new OpenAiNluAdapter(apiKey, model) : null;
          }
          case "gemini": {
            const { apiKey, model } = resolve("GEMINI");
            return apiKey ? new GeminiNluAdapter(apiKey, model) : null;
          }
          default: {
            return null;
          }
        }
      },
    },
  ],
})
export class WhatsappModule {}
