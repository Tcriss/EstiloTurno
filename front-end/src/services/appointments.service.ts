import { apiFetch } from "@/lib/api-server";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELED" | "COMPLETED" | "NO_SHOW";

export type Appointment = {
  id: number;
  businessId: number;
  clientId: string;
  clientName: string | null;
  serviceId: number;
  serviceName: string;
  serviceDurationMinutes: number;
  date: string;
  startTime: string;
  status: AppointmentStatus;
};

export type ListAppointmentsParams = {
  date?: string;
  status?: AppointmentStatus;
};

export function listAppointments(params: ListAppointmentsParams = {}) {
  return apiFetch<Appointment[]>("/backoffice/appointments", { searchParams: params });
}

export type UpdateAppointmentInput = {
  date?: string;
  time?: string;
  status?: AppointmentStatus;
};

export function updateAppointment(id: number, input: UpdateAppointmentInput) {
  return apiFetch<Appointment>(`/backoffice/appointments/${id}`, { method: "PATCH", body: input });
}
