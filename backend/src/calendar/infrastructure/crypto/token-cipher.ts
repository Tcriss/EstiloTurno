import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/**
 * Cifra los tokens de OAuth antes de guardarlos en Postgres (que no cifra columnas por
 * defecto). La clave sale de CALENDAR_TOKEN_ENCRYPTION_KEY — nunca del repo.
 */
@Injectable()
export class TokenCipher {
  private readonly key: Buffer;

  constructor(secret: string) {
    if (!secret) {
      throw new InternalServerErrorException("CALENDAR_TOKEN_ENCRYPTION_KEY no está configurada.");
    }
    // scrypt deriva una clave de 32 bytes aunque el secreto de entrada tenga otra longitud.
    this.key = scryptSync(secret, "estiloturno-calendar-tokens", 32);
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
  }

  decrypt(cipherText: string): string {
    const raw = Buffer.from(cipherText, "base64");
    const iv = raw.subarray(0, IV_LENGTH);
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = raw.subarray(IV_LENGTH + 16);
    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  }
}
