import {
  pgTable,
  varchar,
  integer,
  numeric,
  date,
  time,
  timestamp,
  jsonb,
  serial,
  boolean,
  text,
  unique,
} from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  // phone_number_id de WhatsApp Cloud API — enruta los webhooks entrantes hacia este negocio
  whatsappPhoneNumberId: varchar("whatsapp_phone_number_id", { length: 30 }).unique(),
  workStartMinutes: integer("work_start_minutes").default(540).notNull(), // 9:00 AM
  workEndMinutes: integer("work_end_minutes").default(1080).notNull(), // 6:00 PM
  slotIntervalMinutes: integer("slot_interval_minutes").default(30).notNull(),
  botEnabled: boolean("bot_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: varchar("id", { length: 20 }).primaryKey(), // Teléfono internacional como ID (ej: 18494562740)
  name: varchar("name", { length: 100 }), // Nombre del cliente
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessServices = pgTable(
  "business_services",
  {
    id: serial("id").primaryKey(),
    businessId: integer("business_id")
      .references(() => businesses.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(), // Corte de Cabello, Alisado, etc.
    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Precios en RD$ (Pesos Dominicanos)
    durationMinutes: integer("duration_minutes").notNull(), // Duración en minutos
  },
  (table) => [unique("business_services_business_name_unique").on(table.businessId, table.name)]
);

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .references(() => businesses.id, { onDelete: "cascade" })
    .notNull(),
  clientId: varchar("client_id", { length: 20 })
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  serviceId: integer("service_id")
    .references(() => businessServices.id, { onDelete: "cascade" })
    .notNull(),
  date: date("date").notNull(), // Formato YYYY-MM-DD
  startTime: time("start_time").notNull(), // Formato HH:MM:SS
  status: varchar("status", { length: 20 }).default("PENDING").notNull(), // PENDING, CONFIRMED, CANCELED, COMPLETED, NO_SHOW
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationStates = pgTable(
  "conversation_states",
  {
    id: serial("id").primaryKey(),
    phone: varchar("phone", { length: 20 }).notNull(), // Teléfono del cliente
    businessId: integer("business_id")
      .references(() => businesses.id, { onDelete: "cascade" })
      .notNull(),
    state: varchar("state", { length: 50 }).default("START").notNull(), // START, SELECTING_SERVICE, etc.
    metadata: jsonb("metadata").default({}).notNull(), // Datos temporales de la cita en proceso + historial NLU
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("conversation_states_phone_business_unique").on(table.phone, table.businessId)]
);

export const businessCalendarCredentials = pgTable("business_calendar_credentials", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .references(() => businesses.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  provider: varchar("provider", { length: 20 }).default("google").notNull(),
  // access_token/refresh_token viajan cifrados (AES-256-GCM) — ver infrastructure/crypto/token-cipher.ts
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiryDate: timestamp("token_expiry_date").notNull(),
  scope: varchar("scope", { length: 255 }).notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .references(() => businesses.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).default("EMPLOYEE").notNull(), // ADMIN, EMPLOYEE
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(), // sha256 hex del token opaco — nunca se persiste el token en claro
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
