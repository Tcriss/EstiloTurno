import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class VerifyWebhookChallengeUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(mode: string, token: string, challenge: string): string | null {
    const verifyToken = this.configService.get<string>("WHATSAPP_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken && challenge) {
      return challenge;
    }

    return null;
  }
}
