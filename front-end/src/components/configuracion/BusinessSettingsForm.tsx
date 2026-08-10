"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateBusinessAction } from "@/app/dashboard/configuracion/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { minutesToTime, timeToMinutes } from "@/lib/time";
import { businessSettingsSchema, type BusinessSettingsValues } from "@/lib/validation/business.schemas";
import type { Business } from "@/services/business.service";

export function BusinessSettingsForm({ business, canEdit }: { business: Business; canEdit: boolean }) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BusinessSettingsValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      name: business.name,
      whatsappPhoneNumberId: business.whatsappPhoneNumberId ?? "",
      workStart: minutesToTime(business.workStartMinutes),
      workEnd: minutesToTime(business.workEndMinutes),
      slotIntervalMinutes: business.slotIntervalMinutes,
      botEnabled: business.botEnabled,
    },
  });

  async function onSubmit(values: BusinessSettingsValues) {
    setIsSaving(true);
    const result = await updateBusinessAction({
      name: values.name.trim(),
      whatsappPhoneNumberId: values.whatsappPhoneNumberId?.trim() || null,
      workStartMinutes: timeToMinutes(values.workStart),
      workEndMinutes: timeToMinutes(values.workEnd),
      slotIntervalMinutes: values.slotIntervalMinutes,
      botEnabled: values.botEnabled,
    });
    setIsSaving(false);

    if (!result.success) {
      toast.error("No pudimos guardar los cambios", { description: result.error });
      return;
    }

    toast.success("Configuración guardada");
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Datos del negocio</CardTitle>
        <CardDescription>
          {canEdit
            ? "Configurá los datos y horarios de tu negocio."
            : "Solo un administrador puede editar esta información."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset disabled={!canEdit || isSaving} className="space-y-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre del negocio</FieldLabel>
                <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>

              <Field>
                <FieldLabel htmlFor="whatsappPhoneNumberId">Número de WhatsApp (ID de Meta)</FieldLabel>
                <Input
                  id="whatsappPhoneNumberId"
                  placeholder="109876543210987"
                  {...register("whatsappPhoneNumberId")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="workStart">Apertura</FieldLabel>
                  <Input id="workStart" type="time" aria-invalid={Boolean(errors.workStart)} {...register("workStart")} />
                  <FieldError errors={errors.workStart ? [errors.workStart] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="workEnd">Cierre</FieldLabel>
                  <Input id="workEnd" type="time" aria-invalid={Boolean(errors.workEnd)} {...register("workEnd")} />
                  <FieldError errors={errors.workEnd ? [errors.workEnd] : undefined} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="slotIntervalMinutes">Duración de cada turno (minutos)</FieldLabel>
                <Input
                  id="slotIntervalMinutes"
                  type="number"
                  min={5}
                  step={5}
                  aria-invalid={Boolean(errors.slotIntervalMinutes)}
                  {...register("slotIntervalMinutes", { valueAsNumber: true })}
                />
                <FieldError errors={errors.slotIntervalMinutes ? [errors.slotIntervalMinutes] : undefined} />
              </Field>

              <Field orientation="horizontal">
                <Switch
                  id="botEnabled"
                  checked={watch("botEnabled")}
                  onCheckedChange={(checked) => setValue("botEnabled", checked === true)}
                />
                <FieldLabel htmlFor="botEnabled" className="font-normal">
                  Bot de WhatsApp activo
                </FieldLabel>
              </Field>
            </FieldGroup>

            {canEdit && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            )}
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
