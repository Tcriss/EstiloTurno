import { Body, Controller, ForbiddenException, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Role } from "../../auth/domain/entities/role.enum";
import { Roles } from "../../auth/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/presentation/guards/roles.guard";
import { HandleIncomingMessageUseCase } from "../application/use-cases/handle-incoming-message.use-case";
import { SendTextMessageUseCase } from "../application/use-cases/send-text-message.use-case";
import { VerifyWebhookChallengeUseCase } from "../application/use-cases/verify-webhook-challenge.use-case";
import { SendTestMessageDto } from "./dto/send-test-message.dto";
import { WhatsappSignatureGuard } from "./guards/whatsapp-signature.guard";

@Controller("webhooks/whatsapp")
export class WhatsappController {
  constructor(
    private readonly verifyWebhookChallengeUseCase: VerifyWebhookChallengeUseCase,
    private readonly handleIncomingMessageUseCase: HandleIncomingMessageUseCase,
    private readonly sendTextMessageUseCase: SendTextMessageUseCase
  ) {}

  @Get()
  verifyWebhook(
    @Query("hub.mode") mode?: string,
    @Query("hub.verify_token") token?: string,
    @Query("hub.challenge") challenge?: string
  ) {
    const verifiedChallenge = this.verifyWebhookChallengeUseCase.execute(mode ?? "", token ?? "", challenge ?? "");

    if (!verifiedChallenge) {
      throw new ForbiddenException("Webhook verification failed.");
    }

    return verifiedChallenge;
  }

  @Post()
  @UseGuards(WhatsappSignatureGuard)
  handleIncomingWebhook(@Body() body: unknown) {
    this.handleIncomingMessageUseCase.execute(body);
    return { received: true };
  }

  @Post("send-test-message")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async sendTestMessage(@Req() request: { user: { businessId: number } }, @Body() body: SendTestMessageDto) {
    return this.sendTextMessageUseCase.execute(request.user.businessId, body.to ?? "", body.message ?? "");
  }
}
