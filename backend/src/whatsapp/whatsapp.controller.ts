import { Body, Controller, ForbiddenException, Get, Post, Query } from "@nestjs/common";
import { WhatsappService } from "./whatsapp.service";

type SendTestMessageBody = {
  to?: string;
  message?: string;
};

@Controller("webhooks/whatsapp")
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get()
  verifyWebhook(
    @Query("hub.mode") mode?: string,
    @Query("hub.verify_token") token?: string,
    @Query("hub.challenge") challenge?: string,
  ) {
    const verifiedChallenge = this.whatsappService.verifyWebhook(mode ?? "", token ?? "", challenge ?? "");

    if (!verifiedChallenge) {
      throw new ForbiddenException("Webhook verification failed.");
    }

    return verifiedChallenge;
  }

  @Post()
  handleIncomingWebhook(@Body() body: unknown) {
    this.whatsappService.handleIncomingWebhook(body);
    return { received: true };
  }

  @Post("send-test-message")
  async sendTestMessage(@Body() body: SendTestMessageBody) {
    return this.whatsappService.sendTextMessage(body.to ?? "", body.message ?? "");
  }
}
