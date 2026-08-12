"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateService } from "@/hooks/use-services";
import type { Service } from "@/services/schedule.service";

const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;

type EditServiceDialogProps = {
  service: Service | null;
  onOpenChange: (open: boolean) => void;
};

export function EditServiceDialog({ service, onOpenChange }: EditServiceDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const updateService = useUpdateService();

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPrice(service.price);
      setDurationMinutes(String(service.durationMinutes));
    }
  }, [service]);

  if (!service) return null;

  const isValid =
    Boolean(name.trim()) && PRICE_REGEX.test(price) && Number(durationMinutes) >= 5 && Number(durationMinutes) <= 480;

  async function handleSubmit() {
    if (!service || !isValid) return;

    try {
      await updateService.mutateAsync({
        id: service.id,
        input: { name: name.trim(), price, durationMinutes: Number(durationMinutes) },
      });
      toast.success("Servicio actualizado");
      onOpenChange(false);
    } catch (error) {
      toast.error("No pudimos actualizar el servicio", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={Boolean(service)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar servicio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="edit-name">Nombre</FieldLabel>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="edit-price">Precio (RD$)</FieldLabel>
              <Input id="edit-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-duration">Duración (min)</FieldLabel>
              <Input
                id="edit-duration"
                type="number"
                min={5}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!isValid || updateService.isPending} onClick={handleSubmit}>
            {updateService.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
