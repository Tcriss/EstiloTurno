import { Role } from "../entities/role.enum";

export const TOKEN_ISSUER = Symbol("TOKEN_ISSUER");

export interface TokenPayload {
  sub: number;
  businessId: number;
  email: string;
  role: Role;
}

export interface TokenIssuer {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
