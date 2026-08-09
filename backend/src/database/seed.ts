import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL env variable is required to run seeding.");
    process.exit(1);
  }

  console.log("Connecting to database for seeding...");
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  console.log("Seeding default services...");

  const services = [
    { name: "Corte de Cabello", price: "500.00", durationMinutes: 30 },
    { name: "Alisado", price: "2500.00", durationMinutes: 120 },
    { name: "Lavado de Pelo", price: "300.00", durationMinutes: 20 },
  ];

  for (const service of services) {
    const existing = await db.query.businessServices.findFirst({
      where: (s, { eq }) => eq(s.name, service.name),
    });

    if (!existing) {
      await db.insert(schema.businessServices).values(service);
      console.log(`Created service: ${service.name} (RD$ ${service.price}, ${service.durationMinutes}m)`);
    } else {
      console.log(`Service already exists: ${service.name}`);
    }
  }

  console.log("Seeding finished successfully!");
  await pool.end();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
