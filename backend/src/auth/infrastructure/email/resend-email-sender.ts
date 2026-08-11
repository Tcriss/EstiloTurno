import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { EmailSender, SendEmailInput } from "../../domain/ports/email-sender";

@Injectable()
export class ResendEmailSender implements EmailSender {
  private readonly logger = new Logger(ResendEmailSender.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    this.from = this.configService.get<string>("RESEND_FROM") ?? "onboarding@resend.dev";

    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async send(input: SendEmailInput): Promise<void> {
    // Sin API key configurada (dev local), logueamos el contenido en vez de fallar el flujo de reset.
    if (!this.resend) {
      this.logger.warn(`Resend no configurado — email simulado para ${input.to}: ${input.subject}`);
      this.logger.log(input.html);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  }
}
