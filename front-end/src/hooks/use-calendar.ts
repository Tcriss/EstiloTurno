"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api-client";
import type { CalendarConnectionStatus } from "@/services/calendar.service";

export function useCalendarStatus() {
  return useQuery({
    queryKey: ["calendar-status"],
    queryFn: () => clientFetch<CalendarConnectionStatus>("/api/backoffice/calendar/status"),
  });
}

export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clientFetch<{ ok: true }>("/api/backoffice/calendar/google", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-status"] });
    },
  });
}
