export const REFRESH_TOKEN_REPOSITORY = Symbol("REFRESH_TOKEN_REPOSITORY");

export interface RefreshTokenRecord {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface RefreshTokenRepository {
  create(userId: number, tokenHash: string, expiresAt: Date): Promise<RefreshTokenRecord>;
  findValidByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revoke(id: number): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
}
