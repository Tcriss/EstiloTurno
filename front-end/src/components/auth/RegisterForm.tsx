"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Circle, Lock, Mail, Phone, User } from "lucide-react";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getPasswordValidationError, minPasswordLength } from "@/lib/password-policy";
import { getSupabaseClient, setAuthPersistence } from "@/lib/supabase";
import { useAuthNotifications } from "@/hooks/useAuthNotifications";

type RegisterValues = {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const [values, setValues] = useState<RegisterValues>({
    businessName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useAuthNotifications({ error: authError, success: successMessage });

  function validate() {
    const nextErrors: RegisterErrors = {};

    if (!values.businessName.trim()) {
      nextErrors.businessName = "Ingresa el nombre del negocio.";
    }

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Ingresa tu nombre completo.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Ingresa tu correo electrónico.";
    } else if (!emailPattern.test(values.email)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Ingresa tu teléfono.";
    }

    const passwordError = getPasswordValidationError(values.password);

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!values.acceptedTerms) {
      nextErrors.acceptedTerms = "Debes aceptar los términos y la privacidad.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateValue<Key extends keyof RegisterValues>(key: Key, value: RegisterValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setAuthError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setAuthPersistence("local");
    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthError("No pudimos conectar con el servicio de registro. Intenta de nuevo más tarde.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          business_name: values.businessName.trim(),
          full_name: values.fullName.trim(),
          phone: values.phone.trim(),
          accepted_terms: values.acceptedTerms,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      setAuthError(getAuthErrorMessage(error, "register"));
      return;
    }

    setIsLoading(false);

    if (data.session) {
      setSuccessMessage("Cuenta creada correctamente. Ya puedes continuar.");
      return;
    }

    setSuccessMessage("Cuenta creada. Revisa tu correo para confirmar el acceso.");
  }

  const passwordChecks = [
    {
      label: `Mínimo ${minPasswordLength} caracteres`,
      isMet: values.password.length >= minPasswordLength,
    },
    {
      label: "Las contraseñas coinciden",
      isMet: Boolean(values.confirmPassword) && values.password === values.confirmPassword,
    },
  ];

  return (
    <form className="min-w-0 space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
          <User className="h-9 w-9" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-normal text-navy">Crear cuenta</h1>
        <p className="mx-auto mt-3 max-w-md break-words text-base leading-7 text-slate-600">
          Registra tu negocio y comienza a gestionar tus citas y equipos de trabajo de forma profesional.
        </p>
      </div>

      <Input
        label="Nombre del negocio"
        placeholder="Ej. Salón Belleza & Estilo"
        value={values.businessName}
        error={errors.businessName}
        icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
        onChange={(event) => updateValue("businessName", event.target.value)}
      />

      <Input
        label="Nombre completo"
        autoComplete="name"
        placeholder="Ingresa tu nombre completo"
        value={values.fullName}
        error={errors.fullName}
        icon={<User className="h-5 w-5" aria-hidden="true" />}
        onChange={(event) => updateValue("fullName", event.target.value)}
      />

      <Input
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        value={values.email}
        error={errors.email}
        icon={<Mail className="h-5 w-5" aria-hidden="true" />}
        onChange={(event) => updateValue("email", event.target.value)}
      />

      <Input
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        placeholder="Ej. +52 55 1234 5678"
        value={values.phone}
        error={errors.phone}
        icon={<Phone className="h-5 w-5" aria-hidden="true" />}
        onChange={(event) => updateValue("phone", event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          helpText={`Usa al menos ${minPasswordLength} caracteres.`}
          icon={<Lock className="h-5 w-5" aria-hidden="true" />}
          onChange={(event) => updateValue("password", event.target.value)}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          helpText="Debe coincidir con la contraseña."
          icon={<Lock className="h-5 w-5" aria-hidden="true" />}
          onChange={(event) => updateValue("confirmPassword", event.target.value)}
        />
      </div>

      <ul className="grid gap-2 rounded-lg border border-mist bg-slate-50 px-4 py-3 text-sm sm:grid-cols-2">
        {passwordChecks.map((check) => {
          const Icon = check.isMet ? CheckCircle2 : Circle;

          return (
            <li
              key={check.label}
              className={check.isMet ? "flex items-center gap-2 font-semibold text-teal" : "flex items-center gap-2 text-slate-500"}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{check.label}</span>
            </li>
          );
        })}
      </ul>

      <Checkbox
        label={
          <>
            Acepto los{" "}
            <Link className="font-bold text-teal hover:text-cyan-700" href="#">
              Términos y Condiciones
            </Link>{" "}
            y el{" "}
            <Link className="font-bold text-teal hover:text-cyan-700" href="#">
              Aviso de Privacidad
            </Link>
            .
          </>
        }
        checked={values.acceptedTerms}
        error={errors.acceptedTerms}
        onChange={(event) => updateValue("acceptedTerms", event.target.checked)}
      />



      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? "Creando cuenta..." : "Registrarse"}
        {!isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
      </Button>

      <div className="flex min-w-0 items-center gap-4 text-slate-400">
        <span className="h-px flex-1 bg-mist" />
        <span className="text-sm font-medium">o continúa con</span>
        <span className="h-px flex-1 bg-mist" />
      </div>

      <OAuthButtons onError={setAuthError} />

      <p className="text-center text-sm text-navy">
        ¿Ya tengo cuenta?{" "}
        <Link className="font-bold text-teal hover:text-cyan-700" href="/login">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
