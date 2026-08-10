import { apiFetch } from "@/lib/api-server";

export type Service = {
  id: number;
  businessId: number;
  name: string;
  price: string;
  durationMinutes: number;
};

export function getServices() {
  return apiFetch<Service[]>("/schedule/services");
}

export function getAvailability(params: { date: string; serviceId: number }) {
  return apiFetch<string[]>("/schedule/availability", {
    searchParams: { date: params.date, serviceId: params.serviceId },
  });
}

export type CreateAppointmentInput = {
  phoneNumber: string;
  clientName: string;
  serviceId: number;
  date: string;
  time: string;
};

export function createAppointment(input: CreateAppointmentInput) {
  return apiFetch<{ id: number }>("/schedule/appointments", { method: "POST", body: input });
}
