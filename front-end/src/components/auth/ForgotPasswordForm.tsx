"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction } from "@/lib/actions/auth.actions";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth.schemas";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setIsLoading(true);
    setSuccessMessage("");
    const result = await forgotPasswordAction(values.email);
    setIsLoading(false);

    if (!result.success) {
      toast.error("No pudimos completar la acción", { description: result.error });
      return;
    }

    const message = "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.";
    setSuccessMessage(message);
    toast.success("Revisa tu correo", { description: message });
  }

  return (
    <form className="min-w-0 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-normal text-navy">Restablecer contraseña</h1>
        <p className="mt-3 break-words text-base leading-7 text-text-muted">
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              className="h-12 pl-10"
              aria-invalid={Boolean(errors.email)}
              disabled={Boolean(successMessage)}
              {...register("email")}
            />
          </div>
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading || Boolean(successMessage)}>
        {isLoading ? "Enviando enlace..." : "Enviar enlace"}
        {!isLoading && <Send className="h-5 w-5" aria-hidden="true" />}
      </Button>

      <p className="text-center text-sm text-navy">
        <Link className="inline-flex items-center gap-2 font-bold text-teal hover:text-cyan-700" href="/login">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
