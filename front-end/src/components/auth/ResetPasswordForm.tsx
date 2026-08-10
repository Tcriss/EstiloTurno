"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";
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
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-normal text-navy">Nueva contraseña</h1>
        <p className="mt-3 break-words text-base leading-7 text-text-muted">
          Crea una contraseña nueva para recuperar el acceso a tu cuenta.
        </p>
      </div>

      {!token && (
        <p className="rounded-lg border border-error-color/30 bg-error-container/40 px-4 py-3 text-sm text-on-error-container">
          Abre esta pantalla desde el enlace de recuperación que recibiste por correo.
        </p>
      )}

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-11 pl-10"
                aria-invalid={Boolean(errors.password)}
                disabled={isDisabled}
                {...register("password")}
              />
            </div>
            <FieldError errors={errors.password ? [errors.password] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-11 pl-10"
                aria-invalid={Boolean(errors.confirmPassword)}
                disabled={isDisabled}
                {...register("confirmPassword")}
              />
            </div>
            <FieldError errors={errors.confirmPassword ? [errors.confirmPassword] : undefined} />
          </Field>
        </div>

        <ul className="grid gap-2 rounded-lg border border-mist bg-surface-container-low px-4 py-3 text-sm sm:grid-cols-2">
          {passwordChecks.map((check) => {
            const Icon = check.isMet ? CheckCircle2 : Circle;
            return (
              <li
                key={check.label}
                className={check.isMet ? "flex items-center gap-2 font-semibold text-teal" : "flex items-center gap-2 text-text-muted"}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{check.label}</span>
              </li>
            );
          })}
        </ul>
      </FieldGroup>

      <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isDisabled}>
        {isLoading ? "Actualizando..." : "Actualizar contraseña"}
        {!isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
      </Button>

      <p className="text-center text-sm text-navy">
        <Link className="font-bold text-teal hover:text-cyan-700" href="/login">
          Ir a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
