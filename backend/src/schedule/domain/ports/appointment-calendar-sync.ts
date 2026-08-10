export const APPOINTMENT_CALENDAR_SYNC = Symbol("APPOINTMENT_CALENDAR_SYNC");

export interface AppointmentSyncInput {
  appointmentId: number;
  businessId: number;
  clientName: string;
  serviceName: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM o HH:MM:SS */
  startTime: string;
  durationMinutes: number;
}

/**
 * Puerto opcional: si el negocio no conectó Google Calendar, la implementación
 * simplemente no hace nada. Sync best-effort — nunca debe lanzar hacia el caller,
 * ver SyncAppointmentToCalendarUseCase. Recibe los datos ya resueltos (no un
 * Appointment crudo) para que el módulo de calendario no dependa del repo de schedule.
 */
export interface AppointmentCalendarSync {
  syncAppointmentCreated(input: AppointmentSyncInput): Promise<void>;
}
