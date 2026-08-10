"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api-client";
import type { Appointment, AppointmentStatus, UpdateAppointmentInput } from "@/services/appointments.service";

export function useAppointments(params: { date?: string; status?: AppointmentStatus }) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => clientFetch<Appointment[]>("/api/backoffice/appointments", { searchParams: params }),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateAppointmentInput }) =>
      clientFetch<Appointment>(`/api/backoffice/appointments/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
