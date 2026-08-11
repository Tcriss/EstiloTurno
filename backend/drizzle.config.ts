import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  },
});
