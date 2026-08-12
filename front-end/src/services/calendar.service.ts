import { apiFetch } from "@/lib/api-server";

export type CalendarConnectionStatus = {
  connected: boolean;
  provider: string | null;
  connectedAt: string | null;
};

export function getCalendarStatus() {
  return apiFetch<CalendarConnectionStatus>("/backoffice/calendar/status");
}

export function startGoogleCalendarConnection() {
  return apiFetch<{ authUrl: string }>("/backoffice/calendar/google/connect");
}

export function disconnectGoogleCalendar() {
  return apiFetch<{ ok: true }>("/backoffice/calendar/google", { method: "DELETE" });
}
