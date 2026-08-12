"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateService } from "@/hooks/use-services";

const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;

export function NewServiceDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const createService = useCreateService();

  function resetForm() {
    setName("");
    setPrice("");
    setDurationMinutes("");
  }

  const isValid = Boolean(name.trim()) && PRICE_REGEX.test(price) && Number(durationMinutes) >= 5 && Number(durationMinutes) <= 480;

  async function handleSubmit() {
    if (!isValid) return;

    try {
      await createService.mutateAsync({ name: name.trim(), price, durationMinutes: Number(durationMinutes) });
      toast.success("Servicio creado");
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error("No pudimos crear el servicio", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

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
          Nuevo servicio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo servicio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Corte de cabello" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="price">Precio (RD$)</FieldLabel>
              <Input
                id="price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500.00"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="duration">Duración (min)</FieldLabel>
              <Input
                id="duration"
                type="number"
                min={5}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="30"
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!isValid || createService.isPending} onClick={handleSubmit}>
            {createService.isPending ? "Creando..." : "Crear servicio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
