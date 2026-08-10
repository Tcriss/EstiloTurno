"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateAppointment } from "@/hooks/use-appointments";
import { useAvailability } from "@/hooks/use-availability";
import type { Appointment } from "@/services/appointments.service";

type RescheduleDialogProps = {
  appointment: Appointment | null;
  onOpenChange: (open: boolean) => void;
};

export function RescheduleDialog({ appointment, onOpenChange }: RescheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(
    appointment ? new Date(`${appointment.date}T00:00:00`) : undefined
  );
  const [time, setTime] = useState<string | undefined>(appointment?.startTime.slice(0, 5));

  const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;
  const { data: availability, isFetching } = useAvailability({ date: dateStr, serviceId: appointment?.serviceId });
  const updateAppointment = useUpdateAppointment();

  if (!appointment) return null;

  async function handleConfirm() {
    if (!appointment || !dateStr || !time) return;

    try {
      await updateAppointment.mutateAsync({ id: appointment.id, input: { date: dateStr, time } });
      toast.success("Turno reagendado");
      onOpenChange(false);
    } catch (error) {
      toast.error("No pudimos reagendar el turno", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={Boolean(appointment)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar turno</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>Fecha</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Elegí una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(value) => {
                    setDate(value);
                    setTime(undefined);
                  }}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field>
            <FieldLabel>Horario</FieldLabel>
            <Select value={time} onValueChange={setTime} disabled={!dateStr || isFetching}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isFetching ? "Buscando horarios..." : "Elegí un horario"} />
              </SelectTrigger>
              <SelectContent>
                {(availability ?? []).map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!dateStr || !time || updateAppointment.isPending} onClick={handleConfirm}>
            {updateAppointment.isPending ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
