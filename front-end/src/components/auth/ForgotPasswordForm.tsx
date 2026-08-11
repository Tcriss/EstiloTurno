"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
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
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Restablecer contraseña</h1>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
        </p>
      </div>

      {successMessage && (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          {successMessage}
        </p>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nombre@ejemplo.com"
            aria-invalid={Boolean(errors.email)}
            disabled={Boolean(successMessage)}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading || Boolean(successMessage)}>
        {isLoading ? "Enviando enlace..." : "Enviar enlace"}
      </Button>

      <p className="text-center text-sm">
        <Link
          className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
          href="/login"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
