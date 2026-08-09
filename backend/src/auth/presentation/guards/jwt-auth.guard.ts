import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { TOKEN_ISSUER, TokenIssuer } from "../../domain/ports/token-issuer";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_ISSUER) private readonly tokenIssuer: TokenIssuer) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Falta el token de autenticación.");
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      request.user = await this.tokenIssuer.verify(token);
    } catch {
      throw new UnauthorizedException("Token inválido o expirado.");
    }

    return true;
  }
}
