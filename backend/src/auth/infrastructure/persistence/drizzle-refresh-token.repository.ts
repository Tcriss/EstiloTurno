import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gt, isNull } from "drizzle-orm";
import { DRIZZLE, DrizzleDB, schema } from "../../../database/database.module";
import { RefreshTokenRecord, RefreshTokenRepository } from "../../domain/ports/refresh-token.repository";

@Injectable()
export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<RefreshTokenRecord> {
    const [row] = await this.db
      .insert(schema.refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return this.toDomain(row);
  }

  async findValidByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const results = await this.db
      .select()
      .from(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.tokenHash, tokenHash),
          isNull(schema.refreshTokens.revokedAt),
          gt(schema.refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);
    const row = results[0];
    return row ? this.toDomain(row) : null;
  }

  async revoke(id: number): Promise<void> {
    await this.db.update(schema.refreshTokens).set({ revokedAt: new Date() }).where(eq(schema.refreshTokens.id, id));
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(schema.refreshTokens.userId, userId), isNull(schema.refreshTokens.revokedAt)));
  }

  private toDomain(row: typeof schema.refreshTokens.$inferSelect): RefreshTokenRecord {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    };
  }
}
