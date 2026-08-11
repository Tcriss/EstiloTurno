"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerAction } from "@/lib/actions/auth.actions";
import { minPasswordLength } from "@/lib/password-policy";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth.schemas";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  async function onSubmit(values: RegisterValues) {
    setIsLoading(true);
    const result = await registerAction(values);

    if (!result.success) {
      setIsLoading(false);
      toast.error("No pudimos completar la acción", { description: result.error });
    }
  }

  const passwordChecks = [
    { label: `Mínimo ${minPasswordLength} caracteres`, isMet: password.length >= minPasswordLength },
    { label: "Las contraseñas coinciden", isMet: Boolean(confirmPassword) && password === confirmPassword },
  ];

  return (
    <form className="min-w-0 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Crear cuenta</h1>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
          Registra tu negocio y comienza a gestionar tus citas y equipos de trabajo.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="businessName">Nombre del negocio</FieldLabel>
          <Input
            id="businessName"
            placeholder="Ej. Salón Belleza & Estilo"
            aria-invalid={Boolean(errors.businessName)}
            {...register("businessName")}
          />
          <FieldError errors={errors.businessName ? [errors.businessName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Ingresa tu nombre completo"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
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

        <Field orientation="horizontal">
          <Checkbox
            id="acceptedTerms"
            checked={watch("acceptedTerms")}
            onCheckedChange={(checked) => setValue("acceptedTerms", checked === true)}
          />
          <FieldLabel htmlFor="acceptedTerms" className="font-normal">
            Acepto los{" "}
            <Link className="font-medium text-foreground underline underline-offset-4" href="#">
              Términos y Condiciones
            </Link>{" "}
            y el{" "}
            <Link className="font-medium text-foreground underline underline-offset-4" href="#">
              Aviso de Privacidad
            </Link>
            .
          </FieldLabel>
        </Field>
        <FieldError errors={errors.acceptedTerms ? [errors.acceptedTerms] : undefined} />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creando cuenta..." : "Registrarse"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link className="font-medium text-foreground underline underline-offset-4" href="/login">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
