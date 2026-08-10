import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GetBusinessUseCase } from "./application/use-cases/get-business.use-case";
import { ResolveBusinessForWebhookUseCase } from "./application/use-cases/resolve-business-for-webhook.use-case";
import { UpdateBusinessSettingsUseCase } from "./application/use-cases/update-business-settings.use-case";
import { BUSINESS_REPOSITORY } from "./domain/ports/business.repository";
import { DrizzleBusinessRepository } from "./infrastructure/persistence/drizzle-business.repository";
import { BusinessController } from "./presentation/business.controller";

@Module({
  imports: [AuthModule],
  controllers: [BusinessController],
  providers: [
    GetBusinessUseCase,
    UpdateBusinessSettingsUseCase,
    ResolveBusinessForWebhookUseCase,
    { provide: BUSINESS_REPOSITORY, useClass: DrizzleBusinessRepository },
  ],
  exports: [GetBusinessUseCase, UpdateBusinessSettingsUseCase, ResolveBusinessForWebhookUseCase, BUSINESS_REPOSITORY],
})
export class BusinessModule {}
