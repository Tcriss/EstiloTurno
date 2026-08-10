"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api-client";
import type { CreateAppointmentInput, Service } from "@/services/schedule.service";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => clientFetch<Service[]>("/api/schedule/services"),
    staleTime: 5 * 60_000,
  });
}

export function useAvailability(params: { date?: string; serviceId?: number }) {
  return useQuery({
    queryKey: ["availability", params],
    queryFn: () => clientFetch<string[]>("/api/schedule/availability", { searchParams: params }),
    enabled: Boolean(params.date && params.serviceId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) =>
      clientFetch<{ id: number }>("/api/schedule/appointments", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
