"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuthNotifications } from "@/hooks/useAuthNotifications";

type ForgotPasswordValues = {
  email: string;
};

type ForgotPasswordErrors = Partial<Record<keyof ForgotPasswordValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [values, setValues] = useState<ForgotPasswordValues>({ email: "" });
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useAuthNotifications({ error: authError, success: successMessage });

  function validate() {
    const nextErrors: ForgotPasswordErrors = {};

    if (!values.email.trim()) {
      nextErrors.email = "Ingresa el correo de tu cuenta.";
    } else if (!emailPattern.test(values.email)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthError("No pudimos conectar con el servicio de recuperación. Intenta de nuevo más tarde.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setAuthError(getAuthErrorMessage(error, "passwordReset"));
      return;
    }

    setSuccessMessage("Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.");
  }

  return (
    <form className="min-w-0 space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-normal text-navy">Restablecer contraseña</h1>
        <p className="mt-3 break-words text-base leading-7 text-slate-600">
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
        </p>
      </div>

      <Input
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nombre@ejemplo.com"
        value={values.email}
        error={errors.email}
        icon={<Mail className="h-5 w-5" aria-hidden="true" />}
        onChange={(event) => {
          setValues({ email: event.target.value });
          setAuthError("");
          setSuccessMessage("");
        }}
      />



      <Button type="submit" fullWidth disabled={isLoading}>
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
