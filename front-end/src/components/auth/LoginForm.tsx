"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { sileo } from "sileo";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getSupabaseClient, setAuthPersistence } from "@/lib/supabase";
import { useAuthNotifications } from "@/hooks/useAuthNotifications";

type LoginValues = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useAuthNotifications({ error: authError });

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function validate() {
    const nextErrors: LoginErrors = {};

    if (!values.email.trim()) {
      nextErrors.email = "Ingresa tu correo electrónico.";
    } else if (!emailPattern.test(values.email)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (!values.password) {
      nextErrors.password = "Ingresa tu contraseña.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    if (!validate()) {
      return;
    }

    setAuthPersistence(values.remember ? "local" : "session");
    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthError("No pudimos conectar con el servicio de acceso. Intenta de nuevo más tarde.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      setIsLoading(false);
      setAuthError(getAuthErrorMessage(error, "login"));
      return;
    }

    setIsLoading(false);
    sileo.success({ title: "Sesión iniciada", description: "Bienvenido a EstiloTurno.", fill: "#006a66" });
    router.replace("/dashboard");
  }

  return (
    <form className="min-w-0 space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-navy">Bienvenido de nuevo</h1>
        <p className="mt-2 break-words text-base leading-7 text-slate-500">
          Ingresa tus credenciales para acceder a tu panel de control
        </p>
      </div>

      <Input
        label="CORREO ELECTRÓNICO"
        labelClassName="text-xs font-semibold tracking-[0.05em] text-slate-500"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="ejemplo@estiloturno.com"
        value={values.email}
        error={errors.email}
        className="h-16 text-base"
        icon={<Mail className="h-5 w-5" aria-hidden="true" />}
        onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
      />

      <Input
        label="CONTRASEÑA"
        labelClassName="text-xs font-semibold tracking-[0.05em] text-slate-500"
        labelAction={
          <Link className="text-sm font-semibold text-primary hover:underline" href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        }
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••••"
        value={values.password}
        error={errors.password}
        className="h-16 text-base"
        icon={<Lock className="h-5 w-5" aria-hidden="true" />}
        onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
      />

      <div className="flex items-center">
        <Checkbox
          label="Mantener sesión iniciada"
          checked={values.remember}
          onChange={(event) => setValues((current) => ({ ...current, remember: event.target.checked }))}
        />
      </div>


      <Button
        type="submit"
        fullWidth
        className="h-14 bg-primary text-base font-semibold shadow-login hover:bg-primary/90 disabled:hover:bg-primary"
        disabled={isLoading}
        aria-disabled={isLoading || hasErrors}
      >
        {isLoading ? "Ingresando..." : "Iniciar sesión"}
        {!isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
      </Button>

      <div className="flex min-w-0 items-center gap-4 text-[#9FB7C1]">
        <span className="h-px flex-1 bg-[#E2E8F0]" />
        <span className="text-sm font-medium">o continúa con</span>
        <span className="h-px flex-1 bg-[#E2E8F0]" />
      </div>

      <OAuthButtons
        onError={setAuthError}
        persistence={values.remember ? "local" : "session"}
      />

      <p className="text-center text-sm text-[#2D3748]">
        ¿No tienes una cuenta?{" "}
        <Link className="font-bold text-teal hover:text-cyan-700" href="/register">
          Empieza gratis
        </Link>
      </p>
    </form>
  );
}
