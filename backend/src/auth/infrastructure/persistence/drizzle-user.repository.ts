import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB, schema } from "../../../database/database.module";
import { Role } from "../../domain/entities/role.enum";
import { User } from "../../domain/entities/user.entity";
import { CreateBusinessOwnerInput, UserRepository } from "../../domain/ports/user.repository";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByEmail(email: string): Promise<User | null> {
    const results = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    const row = results[0];
    return row ? this.toDomain(row) : null;
  }

  async createBusinessOwner(input: CreateBusinessOwnerInput): Promise<User> {
    return this.db.transaction(async (tx) => {
      const [business] = await tx.insert(schema.businesses).values({ name: input.businessName }).returning();

      const [userRow] = await tx
        .insert(schema.users)
        .values({
          businessId: business.id,
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          role: Role.ADMIN,
        })
        .returning();

      return this.toDomain(userRow);
    });
  }

  private toDomain(row: typeof schema.users.$inferSelect): User {
    return {
      id: row.id,
      businessId: row.businessId,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as Role,
    };
  }
}
