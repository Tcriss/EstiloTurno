import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../domain/entities/user.entity";
import { PASSWORD_HASHER, PasswordHasher } from "../../domain/ports/password-hasher";
import { TOKEN_ISSUER, TokenIssuer } from "../../domain/ports/token-issuer";
import { USER_REPOSITORY, UserRepository } from "../../domain/ports/user.repository";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  accessToken: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_ISSUER) private readonly tokenIssuer: TokenIssuer
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    const isPasswordValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    const accessToken = await this.tokenIssuer.sign({
      sub: user.id,
      businessId: user.businessId,
      email: user.email,
      role: user.role,
    });

    return { user, accessToken };
  }
}
