import { Inject, Injectable } from "@nestjs/common";
import { REFRESH_TOKEN_REPOSITORY, RefreshTokenRepository } from "../../domain/ports/refresh-token.repository";
import { hashToken } from "../../infrastructure/security/token-hasher";

@Injectable()
export class LogoutUseCase {
  constructor(@Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(refreshToken: string): Promise<void> {
    const record = await this.refreshTokenRepository.findValidByHash(hashToken(refreshToken));
    if (!record) {
      // Token ya inválido/expirado — el logout es idempotente, no es un error.
      return;
    }

    await this.refreshTokenRepository.revoke(record.id);
  }
}
