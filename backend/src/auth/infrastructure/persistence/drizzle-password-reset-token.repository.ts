import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gt, isNull } from "drizzle-orm";
import { DRIZZLE, DrizzleDB, schema } from "../../../database/database.module";
import {
  PasswordResetTokenRecord,
  PasswordResetTokenRepository,
} from "../../domain/ports/password-reset-token.repository";

@Injectable()
export class DrizzlePasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenRecord> {
    const [row] = await this.db
      .insert(schema.passwordResetTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return this.toDomain(row);
  }

  async findValidByHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    const results = await this.db
      .select()
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.tokenHash, tokenHash),
          isNull(schema.passwordResetTokens.usedAt),
          gt(schema.passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);
    const row = results[0];
    return row ? this.toDomain(row) : null;
  }

  async markUsed(id: number): Promise<void> {
    await this.db
      .update(schema.passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(schema.passwordResetTokens.id, id));
  }

  private toDomain(row: typeof schema.passwordResetTokens.$inferSelect): PasswordResetTokenRecord {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
    };
  }
}
