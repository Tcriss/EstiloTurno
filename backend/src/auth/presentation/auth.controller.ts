import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { RegisterUserUseCase } from "../application/use-cases/register-user.use-case";
import { User } from "../domain/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

function toSafeUser(user: User) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

@Controller("auth")
@Throttle({ default: { limit: 5, ttl: 60_000 } })
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const { user, accessToken } = await this.registerUserUseCase.execute(dto);
    return { user: toSafeUser(user), accessToken };
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const { user, accessToken } = await this.loginUseCase.execute(dto);
    return { user: toSafeUser(user), accessToken };
  }
}
