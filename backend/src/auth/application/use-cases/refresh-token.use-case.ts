import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { REFRESH_TOKEN_REPOSITORY, RefreshTokenRepository } from "../../domain/ports/refresh-token.repository";
import { TOKEN_ISSUER, TokenIssuer } from "../../domain/ports/token-issuer";
import { USER_REPOSITORY, UserRepository } from "../../domain/ports/user.repository";
import { hashToken } from "../../infrastructure/security/token-hasher";
import { RefreshTokenIssuerService } from "../services/refresh-token-issuer.service";

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(TOKEN_ISSUER) private readonly tokenIssuer: TokenIssuer,
    private readonly refreshTokenIssuer: RefreshTokenIssuerService
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    const record = await this.refreshTokenRepository.findValidByHash(hashToken(refreshToken));
    if (!record) {
      throw new UnauthorizedException("Refresh token inválido o expirado.");
    }

    const user = await this.userRepository.findById(record.userId);
    if (!user) {
      throw new UnauthorizedException("Refresh token inválido o expirado.");
    }

    // Rotación: el token usado se revoca y se emite uno nuevo — evita replay del mismo refresh token.
    await this.refreshTokenRepository.revoke(record.id);

    const accessToken = await this.tokenIssuer.sign({
      sub: user.id,
      businessId: user.businessId,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = await this.refreshTokenIssuer.issue(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
