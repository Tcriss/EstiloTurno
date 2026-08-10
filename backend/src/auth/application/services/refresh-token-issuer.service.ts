import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REFRESH_TOKEN_REPOSITORY, RefreshTokenRepository } from "../../domain/ports/refresh-token.repository";
import { generateOpaqueToken, hashToken } from "../../infrastructure/security/token-hasher";

@Injectable()
export class RefreshTokenIssuerService {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService
  ) {}

  async issue(userId: number): Promise<string> {
    const refreshToken = generateOpaqueToken();
    const ttlDays = this.configService.get<number>("REFRESH_TOKEN_TTL_DAYS", 30);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.create(userId, hashToken(refreshToken), expiresAt);

    return refreshToken;
  }
}
