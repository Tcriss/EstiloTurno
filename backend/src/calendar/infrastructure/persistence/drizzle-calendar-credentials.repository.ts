import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB, schema } from "../../../database/database.module";
import { CalendarCredentials } from "../../domain/entities/calendar-credentials.entity";
import {
  CalendarCredentialsRepository,
  UpsertCalendarCredentialsInput,
} from "../../domain/ports/calendar-credentials.repository";
import { TokenCipher } from "../crypto/token-cipher";
import { CALENDAR_TOKEN_CIPHER } from "../../calendar.tokens";

function toEntity(row: typeof schema.businessCalendarCredentials.$inferSelect, cipher: TokenCipher): CalendarCredentials {
  return {
    id: row.id,
    businessId: row.businessId,
    provider: row.provider,
    accessToken: cipher.decrypt(row.accessToken),
    refreshToken: cipher.decrypt(row.refreshToken),
    tokenExpiryDate: row.tokenExpiryDate,
    scope: row.scope,
    connectedAt: row.connectedAt,
  };
}

@Injectable()
export class DrizzleCalendarCredentialsRepository implements CalendarCredentialsRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(CALENDAR_TOKEN_CIPHER) private readonly cipher: TokenCipher
  ) {}

  async findByBusinessId(businessId: number): Promise<CalendarCredentials | null> {
    const [row] = await this.db
      .select()
      .from(schema.businessCalendarCredentials)
      .where(eq(schema.businessCalendarCredentials.businessId, businessId))
      .limit(1);
    return row ? toEntity(row, this.cipher) : null;
  }

  async upsert(input: UpsertCalendarCredentialsInput): Promise<CalendarCredentials> {
    const [row] = await this.db
      .insert(schema.businessCalendarCredentials)
      .values({
        businessId: input.businessId,
        provider: input.provider,
        accessToken: this.cipher.encrypt(input.accessToken),
        refreshToken: this.cipher.encrypt(input.refreshToken),
        tokenExpiryDate: input.tokenExpiryDate,
        scope: input.scope,
      })
      .onConflictDoUpdate({
        target: schema.businessCalendarCredentials.businessId,
        set: {
          provider: input.provider,
          accessToken: this.cipher.encrypt(input.accessToken),
          refreshToken: this.cipher.encrypt(input.refreshToken),
          tokenExpiryDate: input.tokenExpiryDate,
          scope: input.scope,
          connectedAt: new Date(),
        },
      })
      .returning();

    return toEntity(row, this.cipher);
  }

  async updateAccessToken(businessId: number, accessToken: string, tokenExpiryDate: Date): Promise<void> {
    await this.db
      .update(schema.businessCalendarCredentials)
      .set({ accessToken: this.cipher.encrypt(accessToken), tokenExpiryDate })
      .where(eq(schema.businessCalendarCredentials.businessId, businessId));
  }

  async deleteByBusinessId(businessId: number): Promise<void> {
    await this.db.delete(schema.businessCalendarCredentials).where(eq(schema.businessCalendarCredentials.businessId, businessId));
  }
}
