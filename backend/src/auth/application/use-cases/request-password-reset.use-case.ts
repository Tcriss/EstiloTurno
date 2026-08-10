import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EMAIL_SENDER, EmailSender } from "../../domain/ports/email-sender";
import {
  PASSWORD_RESET_TOKEN_REPOSITORY,
  PasswordResetTokenRepository,
} from "../../domain/ports/password-reset-token.repository";
import { USER_REPOSITORY, UserRepository } from "../../domain/ports/user.repository";
import { generateOpaqueToken, hashToken } from "../../infrastructure/security/token-hasher";

const RESET_TOKEN_TTL_MINUTES = 30;

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    @Inject(EMAIL_SENDER) private readonly emailSender: EmailSender,
    private readonly configService: ConfigService
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // Silencioso si el email no existe: no revelamos qué correos están registrados.
    if (!user) {
      return;
    }

    const token = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await this.passwordResetTokenRepository.create(user.id, hashToken(token), expiresAt);

    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3000");
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailSender.send({
      to: user.email,
      subject: "Restablecé tu contraseña de EstiloTurno",
      html: `<p>Hacé click en el siguiente enlace para crear una nueva contraseña. El enlace expira en ${RESET_TOKEN_TTL_MINUTES} minutos.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });
  }
}
