import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, DrizzleDB, schema } from "../database/database.module";
import { eq, and, ne } from "drizzle-orm";

@Injectable()
export class ScheduleService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getServices() {
    return this.db.select().from(schema.businessServices);
  }

  async getServiceById(id: number) {
    const results = await this.db
      .select()
      .from(schema.businessServices)
      .where(eq(schema.businessServices.id, id))
      .limit(1);
    return results[0] || null;
  }

  async getAvailableSlots(dateStr: string, serviceId: number): Promise<string[]> {
    // 1. Obtener servicio para saber su duración
    const service = await this.getServiceById(serviceId);
    if (!service) {
      return [];
    }
    const serviceDuration = service.durationMinutes;

    // 2. Definir horario laboral: 9:00 AM a 6:00 PM (en minutos desde medianoche)
    const workStart = 9 * 60; // 540
    const workEnd = 18 * 60; // 1080
    const slotInterval = 30; // slots cada 30 minutos

    // Generar slots posibles
    const potentialSlots: number[] = [];
    for (let min = workStart; min + serviceDuration <= workEnd; min += slotInterval) {
      potentialSlots.push(min);
    }

    // 3. Obtener citas activas para esa fecha
    const activeAppointments = await this.db
      .select({
        startTime: schema.appointments.startTime,
        duration: schema.businessServices.durationMinutes,
      })
      .from(schema.appointments)
      .innerJoin(
        schema.businessServices,
        eq(schema.appointments.serviceId, schema.businessServices.id)
      )
      .where(
        and(
          eq(schema.appointments.date, dateStr),
          ne(schema.appointments.status, "CANCELED")
        )
      );

    // Convertir citas a rangos de minutos
    const bookedRanges = activeAppointments.map((app) => {
      const [hours, minutes] = app.startTime.split(":").map(Number);
      const start = hours * 60 + minutes;
      return { start, end: start + app.duration };
    });

    // 4. Filtrar slots que se solapen con citas ocupadas
    const availableSlots = potentialSlots.filter((slotStart) => {
      const slotEnd = slotStart + serviceDuration;
      const isOverlap = bookedRanges.some((range) => {
        return slotStart < range.end && slotEnd > range.start;
      });
      return !isOverlap;
    });

    // 5. Convertir minutos de vuelta a string HH:MM
    return availableSlots.map((minutes) => {
      const h = Math.floor(minutes / 60).toString().padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    });
  }

  async createAppointment(phoneNumber: string, clientName: string, serviceId: number, dateStr: string, timeStr: string) {
    // 1. Asegurar que el cliente existe en la DB
    await this.db
      .insert(schema.clients)
      .values({ id: phoneNumber, name: clientName })
      .onConflictDoUpdate({
        target: schema.clients.id,
        set: { name: clientName },
      });

    // Formatear hora de HH:MM a HH:MM:00
    const formattedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;

    // 2. Crear la cita
    const [newAppointment] = await this.db
      .insert(schema.appointments)
      .values({
        clientId: phoneNumber,
        serviceId,
        date: dateStr,
        startTime: formattedTime,
        status: "CONFIRMED",
      })
      .returning();

    return newAppointment;
  }
}
