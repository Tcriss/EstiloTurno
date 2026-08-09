"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getPasswordValidationError, minPasswordLength } from "@/lib/password-policy";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuthNotifications } from "@/hooks/useAuthNotifications";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

type ResetPasswordErrors = Partial<Record<keyof ResetPasswordValues, string>>;

export function ResetPasswordForm() {
  const [values, setValues] = useState<ResetPasswordValues>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [canResetPassword, setCanResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useAuthNotifications({ error: authError, success: successMessage });

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthError("No pudimos conectar con el servicio de recuperación. Intenta de nuevo más tarde.");
      setIsCheckingLink(false);
      return;
    }

    const supabaseClient = supabase;

    const { data: listener } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setCanResetPassword(true);
        setAuthError("");
      }
    });

    async function prepareRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const errorDescription = params.get("error_description");
      const code = params.get("code");

      if (errorDescription) {
        setAuthError("El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.");
        setIsCheckingLink(false);
        return;
      }

      if (code) {
        const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

        if (error) {
          setAuthError(getAuthErrorMessage(error, "passwordReset"));
          setIsCheckingLink(false);
          return;
        }

        window.history.replaceState(null, "", "/reset-password");
      }

      const { data, error } = await supabaseClient.auth.getSession();

      if (error) {
        setAuthError(getAuthErrorMessage(error, "passwordReset"));
        setIsCheckingLink(false);
        return;
      }

      if (data.session) {
        setCanResetPassword(true);
      } else {
        setAuthError("Abre esta pantalla desde el enlace de recuperación que recibiste por correo.");
      }

      setIsCheckingLink(false);
    }

    void prepareRecoverySession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  function validate() {
    const nextErrors: ResetPasswordErrors = {};
    const passwordError = getPasswordValidationError(values.password);

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu nueva contraseña.";
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
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

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    setIsLoading(false);

    if (error) {
      setAuthError(getAuthErrorMessage(error, "passwordReset"));
      return;
    }

    setSuccessMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
  }

  function updateValue<Key extends keyof ResetPasswordValues>(key: Key, value: ResetPasswordValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setAuthError("");
    setSuccessMessage("");
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
    <form className="min-w-0 space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-normal text-navy">Nueva contraseña</h1>
        <p className="mt-3 break-words text-base leading-7 text-slate-600">
          Crea una contraseña nueva para recuperar el acceso a tu cuenta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          helpText={`Usa al menos ${minPasswordLength} caracteres.`}
          icon={<Lock className="h-5 w-5" aria-hidden="true" />}
          disabled={isCheckingLink || !canResetPassword || Boolean(successMessage)}
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
          disabled={isCheckingLink || !canResetPassword || Boolean(successMessage)}
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



      <Button type="submit" fullWidth disabled={isCheckingLink || !canResetPassword || isLoading || Boolean(successMessage)}>
        {isCheckingLink ? "Validando enlace..." : isLoading ? "Actualizando..." : "Actualizar contraseña"}
        {!isCheckingLink && !isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
      </Button>

      <p className="text-center text-sm text-navy">
        <Link className="font-bold text-teal hover:text-cyan-700" href="/login">
          Ir a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
