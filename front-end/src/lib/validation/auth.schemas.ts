import { z } from "zod";
import { getPasswordValidationError } from "@/lib/password-policy";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Ingresa tu correo electrónico.")
  .email("Ingresa un correo electrónico válido.");

const passwordSchema = z.string().superRefine((value, ctx) => {
  const error = getPasswordValidationError(value);
  if (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña."),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    businessName: z.string().trim().min(1, "Ingresa el nombre del negocio."),
    fullName: z.string().trim().min(1, "Ingresa tu nombre completo."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "Debes aceptar los términos y la privacidad.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
