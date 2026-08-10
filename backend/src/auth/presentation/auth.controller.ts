import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { GetCurrentUserUseCase } from "../application/use-cases/get-current-user.use-case";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { LogoutUseCase } from "../application/use-cases/logout.use-case";
import { RefreshTokenUseCase } from "../application/use-cases/refresh-token.use-case";
import { RegisterUserUseCase } from "../application/use-cases/register-user.use-case";
import { RequestPasswordResetUseCase } from "../application/use-cases/request-password-reset.use-case";
import { ResetPasswordUseCase } from "../application/use-cases/reset-password.use-case";
import { User } from "../domain/entities/user.entity";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

function toSafeUser(user: User) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

@Controller("auth")
@Throttle({ default: { limit: 5, ttl: 60_000 } })
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const { user, accessToken, refreshToken } = await this.registerUserUseCase.execute(dto);
    return { user: toSafeUser(user), accessToken, refreshToken };
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const { user, accessToken, refreshToken } = await this.loginUseCase.execute(dto);
    return { user: toSafeUser(user), accessToken, refreshToken };
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: LogoutDto) {
    await this.logoutUseCase.execute(dto.refreshToken);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.requestPasswordResetUseCase.execute(dto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute({ token: dto.token, newPassword: dto.newPassword });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: { user: { sub: number } }) {
    const user = await this.getCurrentUserUseCase.execute(request.user.sub);
    return toSafeUser(user);
  }
}
