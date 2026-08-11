"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
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
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Bienvenido de nuevo</h1>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
          Ingresa tus credenciales para acceder a tu panel de control
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ejemplo@estiloturno.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <div className="flex items-center justify-between gap-4">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Link className="text-xs font-medium text-muted-foreground hover:text-foreground" href="/forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{" "}
        <Link className="font-medium text-foreground underline underline-offset-4" href="/register">
          Empieza gratis
        </Link>
      </p>
    </form>
  );
}
