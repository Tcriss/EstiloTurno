import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";

@Injectable()
export class WhatsappSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WhatsappSignatureGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const appSecret = this.configService.get<string>("WHATSAPP_APP_SECRET");

    if (!appSecret) {
      throw new InternalServerErrorException("WHATSAPP_APP_SECRET is not configured.");
    }

    const signatureHeader = request.headers["x-hub-signature-256"];
    const rawBody: Buffer | undefined = request.rawBody;

    if (typeof signatureHeader !== "string" || !rawBody) {
      this.logger.warn("Webhook de WhatsApp rechazado: falta el header de firma.");
      throw new ForbiddenException("Missing WhatsApp webhook signature.");
    }

    const expectedSignature = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signatureHeader);

    const isValid =
      expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      this.logger.warn("Webhook de WhatsApp rechazado: firma inválida (WHATSAPP_APP_SECRET no coincide).");
      throw new ForbiddenException("Invalid WhatsApp webhook signature.");
    }

    return true;
  }
}
