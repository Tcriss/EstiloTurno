import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { PASSWORD_HASHER } from "./domain/ports/password-hasher";
import { TOKEN_ISSUER } from "./domain/ports/token-issuer";
import { USER_REPOSITORY } from "./domain/ports/user.repository";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher";
import { JwtTokenIssuer } from "./infrastructure/security/jwt-token-issuer";
import { DrizzleUserRepository } from "./infrastructure/persistence/drizzle-user.repository";
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
    JwtAuthGuard,
    RolesGuard,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_ISSUER, useClass: JwtTokenIssuer },
  ],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
