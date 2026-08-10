"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, CheckCircle2, Circle, Lock, Mail, User } from "lucide-react";
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
    <form className="min-w-0 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
          <User className="h-9 w-9" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-normal text-navy">Crear cuenta</h1>
        <p className="mx-auto mt-3 max-w-md break-words text-base leading-7 text-text-muted">
          Registra tu negocio y comienza a gestionar tus citas y equipos de trabajo de forma profesional.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="businessName">Nombre del negocio</FieldLabel>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Input
              id="businessName"
              placeholder="Ej. Salón Belleza & Estilo"
              className="h-11 pl-10"
              aria-invalid={Boolean(errors.businessName)}
              {...register("businessName")}
            />
          </div>
          <FieldError errors={errors.businessName ? [errors.businessName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Ingresa tu nombre completo"
              className="h-11 pl-10"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
          </div>
          <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              className="h-11 pl-10"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </div>
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-11 pl-10"
                aria-invalid={Boolean(errors.password)}
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

        <Field orientation="horizontal">
          <Checkbox
            id="acceptedTerms"
            checked={watch("acceptedTerms")}
            onCheckedChange={(checked) => setValue("acceptedTerms", checked === true)}
          />
          <FieldLabel htmlFor="acceptedTerms" className="font-normal">
            Acepto los{" "}
            <Link className="font-bold text-teal hover:text-cyan-700" href="#">
              Términos y Condiciones
            </Link>{" "}
            y el{" "}
            <Link className="font-bold text-teal hover:text-cyan-700" href="#">
              Aviso de Privacidad
            </Link>
            .
          </FieldLabel>
        </Field>
        <FieldError errors={errors.acceptedTerms ? [errors.acceptedTerms] : undefined} />
      </FieldGroup>

      <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
        {isLoading ? "Creando cuenta..." : "Registrarse"}
        {!isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
      </Button>

      <p className="text-center text-sm text-navy">
        ¿Ya tengo cuenta?{" "}
        <Link className="font-bold text-teal hover:text-cyan-700" href="/login">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
