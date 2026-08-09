import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB, schema } from "../../../database/database.module";
import { Business } from "../../domain/entities/business.entity";
import { BusinessRepository, UpdateBusinessSettingsInput } from "../../domain/ports/business.repository";

@Injectable()
export class DrizzleBusinessRepository implements BusinessRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findById(id: number): Promise<Business | null> {
    const results = await this.db.select().from(schema.businesses).where(eq(schema.businesses.id, id)).limit(1);
    return results[0] ?? null;
  }

  async findByWhatsappPhoneNumberId(phoneNumberId: string): Promise<Business | null> {
    const results = await this.db
      .select()
      .from(schema.businesses)
      .where(eq(schema.businesses.whatsappPhoneNumberId, phoneNumberId))
      .limit(1);
    return results[0] ?? null;
  }

  async findAll(): Promise<Business[]> {
    return this.db.select().from(schema.businesses);
  }

  async create(name: string): Promise<Business> {
    const [row] = await this.db.insert(schema.businesses).values({ name }).returning();
    return row;
  }

  async update(id: number, input: UpdateBusinessSettingsInput): Promise<Business | null> {
    const [row] = await this.db
      .update(schema.businesses)
      .set(input)
      .where(eq(schema.businesses.id, id))
      .returning();
    return row ?? null;
  }
}
