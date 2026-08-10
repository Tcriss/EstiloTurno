import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

/**
 * Firma el parámetro `state` del flow OAuth para (a) protección CSRF y (b) viajar
 * el businessId sin depender de sesión de servidor entre el redirect y el callback.
 */
@Injectable()
export class OAuthStateSigner {
  private readonly secret: string;

  constructor(secret: string) {
    if (!secret) {
      throw new InternalServerErrorException("CALENDAR_TOKEN_ENCRYPTION_KEY no está configurada.");
    }
    this.secret = secret;
  }

  sign(businessId: number): string {
    const payload = `${businessId}.${Date.now()}`;
    const signature = createHmac("sha256", this.secret).update(payload).digest("hex");
    return Buffer.from(`${payload}.${signature}`).toString("base64url");
  }

  /** Devuelve el businessId si la firma es válida y no vencida, o null. */
  verify(state: string, maxAgeMs = 10 * 60 * 1000): number | null {
    try {
      const decoded = Buffer.from(state, "base64url").toString("utf8");
      const [businessIdRaw, timestampRaw, signature] = decoded.split(".");
      const payload = `${businessIdRaw}.${timestampRaw}`;
      const expected = createHmac("sha256", this.secret).update(payload).digest("hex");

      const signatureBuf = Buffer.from(signature ?? "", "hex");
      const expectedBuf = Buffer.from(expected, "hex");
      if (signatureBuf.length !== expectedBuf.length || !timingSafeEqual(signatureBuf, expectedBuf)) {
        return null;
      }

      const timestamp = Number(timestampRaw);
      if (!Number.isFinite(timestamp) || Date.now() - timestamp > maxAgeMs) {
        return null;
      }

      const businessId = Number(businessIdRaw);
      return Number.isInteger(businessId) ? businessId : null;
    } catch {
      return null;
    }
  }
}
