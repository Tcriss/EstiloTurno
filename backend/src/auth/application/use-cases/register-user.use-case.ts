import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { User } from "../../domain/entities/user.entity";
import { PASSWORD_HASHER, PasswordHasher } from "../../domain/ports/password-hasher";
import { TOKEN_ISSUER, TokenIssuer } from "../../domain/ports/token-issuer";
import { USER_REPOSITORY, UserRepository } from "../../domain/ports/user.repository";
import { RefreshTokenIssuerService } from "../services/refresh-token-issuer.service";

export interface RegisterUserInput {
  businessName: string;
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_ISSUER) private readonly tokenIssuer: TokenIssuer,
    private readonly refreshTokenIssuer: RefreshTokenIssuerService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException("El correo ya está registrado.");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    // Quien se registra es el dueño dando de alta su negocio: se crean ambos juntos.
    // El alta de empleados por un admin queda para una fase futura.
    const user = await this.userRepository.createBusinessOwner({
      businessName: input.businessName,
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const accessToken = await this.tokenIssuer.sign({
      sub: user.id,
      businessId: user.businessId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.refreshTokenIssuer.issue(user.id);

    return { user, accessToken, refreshToken };
  }
}
