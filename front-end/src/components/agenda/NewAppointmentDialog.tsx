"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailability, useCreateAppointment, useServices } from "@/hooks/use-availability";

export function NewAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState<string | undefined>();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: services } = useServices();
  const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;
  const { data: availability, isFetching: isFetchingAvailability } = useAvailability({
    date: dateStr,
    serviceId: serviceId ? Number(serviceId) : undefined,
  });
  const createAppointment = useCreateAppointment();

  function resetForm() {
    setServiceId(undefined);
    setDate(undefined);
    setTime(undefined);
    setClientName("");
    setPhoneNumber("");
  }

  async function handleSubmit() {
    if (!serviceId || !dateStr || !time || !clientName.trim() || !phoneNumber.trim()) return;

    try {
      await createAppointment.mutateAsync({
        serviceId: Number(serviceId),
        date: dateStr,
        time,
        clientName: clientName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      toast.success("Turno creado");
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error("No pudimos crear el turno", {
        description: error instanceof Error ? error.message : "Es posible que el horario ya no esté disponible.",
      });
    }
  }

  const isValid = Boolean(serviceId && dateStr && time && clientName.trim() && phoneNumber.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nuevo turno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo turno manual</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel>Servicio</FieldLabel>
            <Select
              value={serviceId}
              onValueChange={(value) => {
                setServiceId(value);
                setTime(undefined);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí un servicio" />
              </SelectTrigger>
              <SelectContent>
                {(services ?? []).map((service) => (
                  <SelectItem key={service.id} value={String(service.id)}>
                    {service.name} — {service.durationMinutes} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Fecha</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal" disabled={!serviceId}>
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
                  disabled={{ before: new Date() }}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field>
            <FieldLabel>Horario</FieldLabel>
            <Select value={time} onValueChange={setTime} disabled={!dateStr || isFetchingAvailability}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isFetchingAvailability ? "Buscando horarios..." : "Elegí un horario"} />
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="clientName">Nombre del cliente</FieldLabel>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="phoneNumber">Teléfono</FieldLabel>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!isValid || createAppointment.isPending} onClick={handleSubmit}>
            {createAppointment.isPending ? "Creando..." : "Crear turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
