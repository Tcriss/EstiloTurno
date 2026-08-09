import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const DEMO_BUSINESS_NAME = "Salón Demo EstiloTurno";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL env variable is required to run seeding.");
    process.exit(1);
  }

  console.log("Connecting to database for seeding...");
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  console.log("Seeding demo business...");

  let business = await db.query.businesses.findFirst({
    where: (b, { eq }) => eq(b.name, DEMO_BUSINESS_NAME),
  });

  if (!business) {
    const [created] = await db
      .insert(schema.businesses)
      .values({ name: DEMO_BUSINESS_NAME, workStartMinutes: 540, workEndMinutes: 1080, slotIntervalMinutes: 30 })
      .returning();
    business = created;
    console.log(`Created business: ${business.name} (id=${business.id})`);
  } else {
    console.log(`Business already exists: ${business.name} (id=${business.id})`);
  }

  console.log("Seeding default services...");

  const services = [
    { name: "Corte de Cabello", price: "500.00", durationMinutes: 30 },
    { name: "Alisado", price: "2500.00", durationMinutes: 120 },
    { name: "Lavado de Pelo", price: "300.00", durationMinutes: 20 },
  ];

  for (const service of services) {
    const existing = await db.query.businessServices.findFirst({
      where: (s, { and, eq }) => and(eq(s.businessId, business!.id), eq(s.name, service.name)),
    });

    if (!existing) {
      await db.insert(schema.businessServices).values({ ...service, businessId: business.id });
      console.log(`Created service: ${service.name} (RD$ ${service.price}, ${service.durationMinutes}m)`);
    } else {
      console.log(`Service already exists: ${service.name}`);
    }
  }

  console.log("Seeding finished successfully!");
  console.log(`\nPara probar el backoffice, registrá un usuario con:`);
  console.log(`POST /auth/register { "businessName": "Mi negocio", "name": "...", "email": "...", "password": "..." }`);
  console.log(`(el negocio demo id=${business.id} queda disponible como fallback de desarrollo para el webhook si no configurás whatsappPhoneNumberId)`);

  await pool.end();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
