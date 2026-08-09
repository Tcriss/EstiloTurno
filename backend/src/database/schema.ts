import { pgTable, varchar, integer, numeric, date, time, timestamp, jsonb, serial } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: varchar("id", { length: 20 }).primaryKey(), // Teléfono internacional como ID (ej: 18494562740)
  name: varchar("name", { length: 100 }), // Nombre del cliente
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessServices = pgTable("business_services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // Corte de Cabello, Alisado, etc.
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Precios en RD$ (Pesos Dominicanos)
  durationMinutes: integer("duration_minutes").notNull(), // Duración en minutos
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id", { length: 20 })
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  serviceId: integer("service_id")
    .references(() => businessServices.id, { onDelete: "cascade" })
    .notNull(),
  date: date("date").notNull(), // Formato YYYY-MM-DD
  startTime: time("start_time").notNull(), // Formato HH:MM:SS
  status: varchar("status", { length: 20 }).default("PENDING").notNull(), // PENDING, CONFIRMED, CANCELED
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationStates = pgTable("conversation_states", {
  id: varchar("id", { length: 20 }).primaryKey(), // Teléfono del cliente
  state: varchar("state", { length: 50 }).default("START").notNull(), // START, SELECTING_SERVICE, etc.
  metadata: jsonb("metadata").default({}).notNull(), // Almacena datos temporales de la cita en proceso
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
