import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { RefreshTokenIssuerService } from "./application/services/refresh-token-issuer.service";
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { RequestPasswordResetUseCase } from "./application/use-cases/request-password-reset.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";
import { EMAIL_SENDER } from "./domain/ports/email-sender";
import { PASSWORD_HASHER } from "./domain/ports/password-hasher";
import { PASSWORD_RESET_TOKEN_REPOSITORY } from "./domain/ports/password-reset-token.repository";
import { REFRESH_TOKEN_REPOSITORY } from "./domain/ports/refresh-token.repository";
import { TOKEN_ISSUER } from "./domain/ports/token-issuer";
import { USER_REPOSITORY } from "./domain/ports/user.repository";
import { ResendEmailSender } from "./infrastructure/email/resend-email-sender";
import { DrizzlePasswordResetTokenRepository } from "./infrastructure/persistence/drizzle-password-reset-token.repository";
import { DrizzleRefreshTokenRepository } from "./infrastructure/persistence/drizzle-refresh-token.repository";
import { DrizzleUserRepository } from "./infrastructure/persistence/drizzle-user.repository";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher";
import { JwtTokenIssuer } from "./infrastructure/security/jwt-token-issuer";
import { AuthController } from "./presentation/auth.controller";
import { JwtAuthGuard } from "./presentation/guards/jwt-auth.guard";
import { RolesGuard } from "./presentation/guards/roles.guard";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "8h" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    GetCurrentUserUseCase,
    RefreshTokenIssuerService,
    JwtAuthGuard,
    RolesGuard,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_ISSUER, useClass: JwtTokenIssuer },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: DrizzleRefreshTokenRepository },
    { provide: PASSWORD_RESET_TOKEN_REPOSITORY, useClass: DrizzlePasswordResetTokenRepository },
    { provide: EMAIL_SENDER, useClass: ResendEmailSender },
  ],
  // TOKEN_ISSUER debe exportarse: JwtAuthGuard lo inyecta, y @Global() solo expone
  // los providers listados acá — sin esto, cualquier módulo que use @UseGuards(JwtAuthGuard)
  // fuera de AuthModule falla al bootear (Nest intenta resolver la dependencia en el módulo consumidor).
  exports: [JwtAuthGuard, RolesGuard, TOKEN_ISSUER],
})
export class AuthModule {}
