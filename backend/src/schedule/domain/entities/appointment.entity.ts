export const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CANCELED", "COMPLETED", "NO_SHOW"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Estados que ocupan el slot: una cita cancelada o no asistida libera el horario. */
export const SLOT_BLOCKING_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED"];

export interface Appointment {
  id: number;
  businessId: number;
  clientId: string;
  serviceId: number;
  date: string;
  startTime: string;
  status: AppointmentStatus;
}

export interface AppointmentWithDetails extends Appointment {
  clientName: string | null;
  serviceName: string;
  serviceDurationMinutes: number;
}
