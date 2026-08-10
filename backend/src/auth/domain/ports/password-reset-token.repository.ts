export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol("PASSWORD_RESET_TOKEN_REPOSITORY");

export interface PasswordResetTokenRecord {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface PasswordResetTokenRepository {
  create(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenRecord>;
  findValidByHash(tokenHash: string): Promise<PasswordResetTokenRecord | null>;
  markUsed(id: number): Promise<void>;
}
