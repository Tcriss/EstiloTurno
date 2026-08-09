"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sileo } from "sileo";

const authErrorMessages: Record<string, string> = {
  otp_expired: "El enlace de confirmación expiró o ya fue utilizado. Solicita uno nuevo o inicia sesión si ya confirmaste el correo.",
  access_denied: "No pudimos completar la confirmación del correo. Solicita un nuevo enlace de confirmación.",
  server_error: "No pudimos completar la confirmación. Intenta de nuevo en unos minutos.",
};

export function LoginCallbackNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");

    if (!error && !errorCode) return;

    const message =
      authErrorMessages[errorCode ?? ""] ??
      authErrorMessages[error ?? ""] ??
      "No pudimos completar la confirmación. Intenta iniciar sesión o solicita un nuevo enlace.";

    sileo.error({
      title: "No pudimos confirmar tu correo",
      description: message,
      fill: "#ba1a1a",
    });
    router.replace("/login", { scroll: false });
  }, [router, searchParams]);

  return null;
}