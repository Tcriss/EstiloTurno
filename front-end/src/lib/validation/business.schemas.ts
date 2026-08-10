import { z } from "zod";

export const businessSettingsSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresa el nombre del negocio."),
    whatsappPhoneNumberId: z.string().trim().optional(),
    workStart: z.string().min(1, "Ingresa el horario de apertura."),
    workEnd: z.string().min(1, "Ingresa el horario de cierre."),
    slotIntervalMinutes: z.number().int("Debe ser un número entero.").positive("Debe ser mayor a 0."),
    botEnabled: z.boolean(),
  })
  .refine((data) => data.workStart < data.workEnd, {
    message: "El horario de apertura debe ser antes del cierre.",
    path: ["workEnd"],
  });

export type BusinessSettingsValues = z.infer<typeof businessSettingsSchema>;
