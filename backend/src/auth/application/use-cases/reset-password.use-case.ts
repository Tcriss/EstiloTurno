import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PASSWORD_HASHER, PasswordHasher } from "../../domain/ports/password-hasher";
import {
  PASSWORD_RESET_TOKEN_REPOSITORY,
  PasswordResetTokenRepository,
} from "../../domain/ports/password-reset-token.repository";
import { REFRESH_TOKEN_REPOSITORY, RefreshTokenRepository } from "../../domain/ports/refresh-token.repository";
import { USER_REPOSITORY, UserRepository } from "../../domain/ports/user.repository";
import { hashToken } from "../../infrastructure/security/token-hasher";

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const record = await this.passwordResetTokenRepository.findValidByHash(hashToken(input.token));
    if (!record) {
      throw new BadRequestException("El enlace de recuperación no es válido o ya expiró.");
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePasswordHash(record.userId, passwordHash);
    await this.passwordResetTokenRepository.markUsed(record.id);

    // Cambiar la contraseña invalida todas las sesiones activas por seguridad.
    await this.refreshTokenRepository.revokeAllForUser(record.userId);
  }
}
