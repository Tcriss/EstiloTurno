"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AppointmentStatusBadge } from "@/components/agenda/AppointmentStatusBadge";
import { NewAppointmentDialog } from "@/components/agenda/NewAppointmentDialog";
import { RescheduleDialog } from "@/components/agenda/RescheduleDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppointments, useUpdateAppointment } from "@/hooks/use-appointments";
import type { Appointment, AppointmentStatus } from "@/services/appointments.service";

const STATUS_FILTERS: { value: AppointmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELED", label: "Cancelada" },
  { value: "NO_SHOW", label: "No asistió" },
];

type AgendaViewProps = {
  initialAppointments: Appointment[];
  initialDate: string;
};

export function AgendaView({ initialAppointments, initialDate }: AgendaViewProps) {
  const [date, setDate] = useState<Date>(() => new Date(`${initialDate}T00:00:00`));
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");
  const { data: appointments, isLoading } = useAppointments({
    date: dateStr,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });
  const updateAppointment = useUpdateAppointment();

  const rows = appointments ?? (dateStr === initialDate && statusFilter === "ALL" ? initialAppointments : []);

  async function handleStatusChange(appointment: Appointment, status: AppointmentStatus) {
    try {
      await updateAppointment.mutateAsync({ id: appointment.id, input: { status } });
      toast.success("Turno actualizado");
    } catch (error) {
      toast.error("No pudimos actualizar el turno", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="font-normal">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "PPP", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(value) => value && setDate(value)} locale={es} />
            </PopoverContent>
          </Popover>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "ALL")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <NewAppointmentDialog />
      </div>

      <Card className="shadow-card">
        <CardContent className="px-0">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-text-muted">Cargando turnos...</p>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-muted">No hay turnos para esta fecha</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.startTime.slice(0, 5)}</TableCell>
                    <TableCell>{appt.clientName ?? "Cliente"}</TableCell>
                    <TableCell>{appt.serviceName}</TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={appt.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setReschedulingAppointment(appt)}>
                            Reagendar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(appt, "CONFIRMED")}>
                            Marcar confirmada
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(appt, "COMPLETED")}>
                            Marcar completada
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(appt, "NO_SHOW")}>
                            Marcar no asistió
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => handleStatusChange(appt, "CANCELED")}>
                            Cancelar turno
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RescheduleDialog
        appointment={reschedulingAppointment}
        onOpenChange={(open) => !open && setReschedulingAppointment(null)}
      />
    </div>
  );
}
