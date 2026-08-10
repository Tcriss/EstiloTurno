import type { AppointmentStatus } from "@/services/appointments.service";

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELED: "Cancelada",
  COMPLETED: "Completada",
  NO_SHOW: "No asistió",
};

export const APPOINTMENT_STATUS_BADGE_VARIANT: Record<
  AppointmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  CONFIRMED: "default",
  CANCELED: "destructive",
  COMPLETED: "secondary",
  NO_SHOW: "destructive",
};
