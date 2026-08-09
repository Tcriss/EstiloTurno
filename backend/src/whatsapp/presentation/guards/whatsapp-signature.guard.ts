import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";

@Injectable()
export class WhatsappSignatureGuard implements CanActivate {
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
      throw new ForbiddenException("Missing WhatsApp webhook signature.");
    }

    const expectedSignature = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signatureHeader);

    const isValid =
      expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      throw new ForbiddenException("Invalid WhatsApp webhook signature.");
    }

    return true;
  }
}
