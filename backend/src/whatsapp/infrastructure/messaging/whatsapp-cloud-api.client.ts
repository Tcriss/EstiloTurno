import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WhatsappMessenger } from "../../domain/ports/whatsapp-messenger";

@Injectable()
export class WhatsappCloudApiClient implements WhatsappMessenger {
  private readonly logger = new Logger(WhatsappCloudApiClient.name);

  constructor(private readonly configService: ConfigService) {}

  async sendText(to: string, message: string, phoneNumberId?: string): Promise<unknown> {
    const accessToken = this.configService.get<string>("WHATSAPP_ACCESS_TOKEN");
    const senderPhoneNumberId = phoneNumberId ?? this.configService.get<string>("WHATSAPP_PHONE_NUMBER_ID");

    if (!accessToken || !senderPhoneNumberId) {
      throw new InternalServerErrorException("WhatsApp credentials are not configured.");
    }

    const response = await fetch(`https://graph.facebook.com/v20.0/${senderPhoneNumberId}/messages`, {
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
      // "data" es la respuesta de error de Meta (código, mensaje, tipo) — nunca el texto del mensaje enviado.
      this.logger.error(`WhatsApp Cloud API error (status ${response.status}): ${JSON.stringify(data)}`);
      throw new InternalServerErrorException("Could not send the WhatsApp message.");
    }

    return data;
  }
}
