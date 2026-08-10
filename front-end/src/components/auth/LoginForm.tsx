"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/actions/auth.actions";
import { loginSchema, type LoginValues } from "@/lib/validation/auth.schemas";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    const result = await loginAction(values);

    if (!result.success) {
      setIsLoading(false);
      toast.error("No pudimos completar la acción", { description: result.error });
    }
  }

  return (
    <form className="min-w-0 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-navy">Bienvenido de nuevo</h1>
        <p className="mt-2 break-words text-base leading-7 text-text-muted">
          Ingresa tus credenciales para acceder a tu panel de control
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
              placeholder="ejemplo@estiloturno.com"
              className="h-12 pl-10"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </div>
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <div className="flex items-center justify-between gap-4">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Link className="text-sm font-semibold text-primary hover:underline" href="/forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="h-12 pl-10"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </div>
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="remember"
            checked={watch("remember")}
            onCheckedChange={(checked) => setValue("remember", checked === true)}
          />
          <FieldLabel htmlFor="remember" className="font-normal">
            Mantener sesión iniciada
          </FieldLabel>
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Iniciar sesión"}
        {!isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
      </Button>

      <p className="text-center text-sm text-text-main">
        ¿No tienes una cuenta?{" "}
        <Link className="font-bold text-teal hover:text-cyan-700" href="/register">
          Empieza gratis
        </Link>
      </p>
    </form>
  );
}
