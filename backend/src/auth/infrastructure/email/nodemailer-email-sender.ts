import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type Transporter } from "nodemailer";
import { EmailSender, SendEmailInput } from "../../domain/ports/email-sender";

@Injectable()
export class NodemailerEmailSender implements EmailSender {
  private readonly logger = new Logger(NodemailerEmailSender.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>("SMTP_HOST");
    this.from = this.configService.get<string>("SMTP_FROM") ?? "no-reply@estiloturno.com";

    this.transporter = host
      ? createTransport({
          host,
          port: this.configService.get<number>("SMTP_PORT", 587),
          secure: this.configService.get<number>("SMTP_PORT", 587) === 465,
          auth: {
            user: this.configService.get<string>("SMTP_USER"),
            pass: this.configService.get<string>("SMTP_PASS"),
          },
        })
      : null;
  }

  async send(input: SendEmailInput): Promise<void> {
    // Sin SMTP configurado (dev local), logueamos el contenido en vez de fallar el flujo de reset.
    if (!this.transporter) {
      this.logger.warn(`SMTP no configurado — email simulado para ${input.to}: ${input.subject}`);
      this.logger.log(input.html);
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  }
}
