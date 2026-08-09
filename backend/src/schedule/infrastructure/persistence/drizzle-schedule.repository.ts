import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { and, eq, inArray, sql } from "drizzle-orm";
import { DRIZZLE, DrizzleDB, schema } from "../../../database/database.module";
import { Appointment, AppointmentWithDetails, SLOT_BLOCKING_STATUSES } from "../../domain/entities/appointment.entity";
import { Service } from "../../domain/entities/service.entity";
import { rangesOverlap, timeStringToMinutes } from "../../domain/services/availability-calculator";
import {
  BookedRange,
  CreateAppointmentInput,
  CreateServiceInput,
  ListAppointmentsFilters,
  ScheduleRepository,
  UpdateAppointmentInput,
  UpdateServiceInput,
} from "../../domain/ports/schedule.repository";
import { AppointmentStatus } from "../../domain/entities/appointment.entity";

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

/** Clave entera del día para el advisory lock (días desde epoch). */
function dateLockKey(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}

@Injectable()
export class DrizzleScheduleRepository implements ScheduleRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllServices(businessId: number): Promise<Service[]> {
    return this.db
      .select()
      .from(schema.businessServices)
      .where(eq(schema.businessServices.businessId, businessId));
  }

  async findServiceById(businessId: number, id: number): Promise<Service | null> {
    const results = await this.db
      .select()
      .from(schema.businessServices)
      .where(and(eq(schema.businessServices.id, id), eq(schema.businessServices.businessId, businessId)))
      .limit(1);
    return results[0] ?? null;
  }

  async createService(input: CreateServiceInput): Promise<Service> {
    const [row] = await this.db.insert(schema.businessServices).values(input).returning();
    return row;
  }

  async updateService(businessId: number, id: number, input: UpdateServiceInput): Promise<Service | null> {
    const [row] = await this.db
      .update(schema.businessServices)
      .set(input)
      .where(and(eq(schema.businessServices.id, id), eq(schema.businessServices.businessId, businessId)))
      .returning();
    return row ?? null;
  }

  async deleteService(businessId: number, id: number): Promise<boolean> {
    const deleted = await this.db
      .delete(schema.businessServices)
      .where(and(eq(schema.businessServices.id, id), eq(schema.businessServices.businessId, businessId)))
      .returning({ id: schema.businessServices.id });
    return deleted.length > 0;
  }

  async findBookedRanges(businessId: number, date: string, excludeAppointmentId?: number): Promise<BookedRange[]> {
    return this.queryBookedRanges(this.db, businessId, date, excludeAppointmentId);
  }

  async upsertClient(id: string, name: string): Promise<void> {
    await this.db
      .insert(schema.clients)
      .values({ id, name })
      .onConflictDoUpdate({
        target: schema.clients.id,
        set: { name },
      });
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    return this.db.transaction(async (tx) => {
      // Serializa las reservas del mismo negocio y día: el lock se libera al terminar
      // la transacción, y evita que dos inserts concurrentes pasen ambos el chequeo.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${input.businessId}, ${dateLockKey(input.date)})`);

      const bookedRanges = await this.queryBookedRanges(tx, input.businessId, input.date);
      const start = timeStringToMinutes(input.time);
      const end = start + input.durationMinutes;
      const isTaken = bookedRanges.some((range) => rangesOverlap(start, end, range.start, range.end));
      if (isTaken) {
        throw new ConflictException("El horario acaba de ser reservado por otro cliente. Elige otro turno.");
      }

      const [row] = await tx
        .insert(schema.appointments)
        .values({
          businessId: input.businessId,
          clientId: input.phoneNumber,
          serviceId: input.serviceId,
          date: input.date,
          startTime: normalizeTime(input.time),
          status: "CONFIRMED",
        })
        .returning();

      return row as Appointment;
    });
  }

  async listAppointments(businessId: number, filters: ListAppointmentsFilters): Promise<AppointmentWithDetails[]> {
    const conditions = [eq(schema.appointments.businessId, businessId)];
    if (filters.date) {
      conditions.push(eq(schema.appointments.date, filters.date));
    }
    if (filters.status) {
      conditions.push(eq(schema.appointments.status, filters.status));
    }

    const rows = await this.db
      .select({
        appointment: schema.appointments,
        clientName: schema.clients.name,
        serviceName: schema.businessServices.name,
        serviceDurationMinutes: schema.businessServices.durationMinutes,
      })
      .from(schema.appointments)
      .innerJoin(schema.businessServices, eq(schema.appointments.serviceId, schema.businessServices.id))
      .leftJoin(schema.clients, eq(schema.appointments.clientId, schema.clients.id))
      .where(and(...conditions))
      .orderBy(schema.appointments.date, schema.appointments.startTime);

    return rows.map((row) => this.toDetails(row));
  }

  async findAppointmentById(businessId: number, id: number): Promise<AppointmentWithDetails | null> {
    const rows = await this.db
      .select({
        appointment: schema.appointments,
        clientName: schema.clients.name,
        serviceName: schema.businessServices.name,
        serviceDurationMinutes: schema.businessServices.durationMinutes,
      })
      .from(schema.appointments)
      .innerJoin(schema.businessServices, eq(schema.appointments.serviceId, schema.businessServices.id))
      .leftJoin(schema.clients, eq(schema.appointments.clientId, schema.clients.id))
      .where(and(eq(schema.appointments.id, id), eq(schema.appointments.businessId, businessId)))
      .limit(1);

    return rows[0] ? this.toDetails(rows[0]) : null;
  }

  async updateAppointment(businessId: number, id: number, input: UpdateAppointmentInput): Promise<Appointment | null> {
    const changes: Partial<typeof schema.appointments.$inferInsert> = {};
    if (input.date) changes.date = input.date;
    if (input.time) changes.startTime = normalizeTime(input.time);
    if (input.status) changes.status = input.status;

    const [row] = await this.db
      .update(schema.appointments)
      .set(changes)
      .where(and(eq(schema.appointments.id, id), eq(schema.appointments.businessId, businessId)))
      .returning();

    return (row as Appointment) ?? null;
  }

  private async queryBookedRanges(
    executor: Pick<DrizzleDB, "select">,
    businessId: number,
    date: string,
    excludeAppointmentId?: number
  ): Promise<BookedRange[]> {
    const conditions = [
      eq(schema.appointments.businessId, businessId),
      eq(schema.appointments.date, date),
      inArray(schema.appointments.status, SLOT_BLOCKING_STATUSES),
    ];
    if (excludeAppointmentId !== undefined) {
      conditions.push(sql`${schema.appointments.id} <> ${excludeAppointmentId}`);
    }

    const activeAppointments = await executor
      .select({
        startTime: schema.appointments.startTime,
        duration: schema.businessServices.durationMinutes,
      })
      .from(schema.appointments)
      .innerJoin(schema.businessServices, eq(schema.appointments.serviceId, schema.businessServices.id))
      .where(and(...conditions));

    return activeAppointments.map((appointment) => {
      const start = timeStringToMinutes(appointment.startTime);
      return { start, end: start + appointment.duration };
    });
  }

  private toDetails(row: {
    appointment: typeof schema.appointments.$inferSelect;
    clientName: string | null;
    serviceName: string;
    serviceDurationMinutes: number;
  }): AppointmentWithDetails {
    return {
      ...(row.appointment as Appointment),
      status: row.appointment.status as AppointmentStatus,
      clientName: row.clientName,
      serviceName: row.serviceName,
      serviceDurationMinutes: row.serviceDurationMinutes,
    };
  }
}
