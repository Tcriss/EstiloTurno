"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPasswordAction } from "@/lib/actions/auth.actions";
import { minPasswordLength } from "@/lib/password-policy";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth.schemas";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) return;

    setIsLoading(true);
    const result = await resetPasswordAction(token, values.password);
    setIsLoading(false);

    if (!result.success) {
      toast.error("No pudimos completar la acción", { description: result.error });
      return;
    }

    setSuccessMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
    toast.success("Proceso completado", { description: "Tu contraseña fue actualizada." });
  }

  const passwordChecks = [
    { label: `Mínimo ${minPasswordLength} caracteres`, isMet: password.length >= minPasswordLength },
    { label: "Las contraseñas coinciden", isMet: Boolean(confirmPassword) && password === confirmPassword },
  ];

  const isDisabled = !token || isLoading || Boolean(successMessage);

  return (
    <form className="min-w-0 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Nueva contraseña</h1>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
          Crea una contraseña nueva para recuperar el acceso a tu cuenta.
        </p>
      </div>

      {!token && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          Abre esta pantalla desde el enlace de recuperación que recibiste por correo.
        </p>
      )}

      {successMessage && (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          {successMessage}
        </p>
      )}

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              disabled={isDisabled}
              {...register("password")}
            />
            <FieldError errors={errors.password ? [errors.password] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.confirmPassword)}
              disabled={isDisabled}
              {...register("confirmPassword")}
            />
            <FieldError errors={errors.confirmPassword ? [errors.confirmPassword] : undefined} />
          </Field>
        </div>

        <ul className="grid gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-xs sm:grid-cols-2">
          {passwordChecks.map((check) => {
            const Icon = check.isMet ? Check : Circle;
            return (
              <li
                key={check.label}
                className={
                  check.isMet
                    ? "flex items-center gap-2 font-medium text-primary"
                    : "flex items-center gap-2 text-muted-foreground"
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{check.label}</span>
              </li>
            );
          })}
        </ul>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isDisabled}>
        {isLoading ? "Actualizando..." : "Actualizar contraseña"}
      </Button>

      <p className="text-center text-sm">
        <Link className="font-medium text-muted-foreground hover:text-foreground" href="/login">
          Ir a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
