import type { AuthError } from "@supabase/supabase-js";

type AuthErrorContext = "login" | "register" | "oauth" | "callback" | "passwordReset";

export function getAuthErrorMessage(error: AuthError, context: AuthErrorContext = "login") {
  const message = error.message.toLowerCase();
  const status = error.status;

  if (message.includes("invalid login credentials")) {
    return context === "login"
      ? "El correo o la contraseña no son correctos. Verifica tus datos o restablece la contraseña."
      : "No pudimos confirmar esos datos. Revisa el correo y la contraseña.";
  }

  if (message.includes("email not confirmed")) {
    return "Tu correo todavía no está confirmado. Revisa tu bandeja de entrada y confirma tu cuenta antes de iniciar sesión.";
  }

  if (message.includes("signup disabled")) {
    return "No se pueden crear cuentas en este momento. Intenta de nuevo más tarde.";
  }

  if (message.includes("provider is not enabled") || message.includes("unsupported provider")) {
    return "Ese método de acceso todavía no está disponible. Usa correo y contraseña por ahora.";
  }

  if (message.includes("oauth") && context === "oauth") {
    return "No pudimos iniciar sesión con ese método. Intenta con correo y contraseña.";
  }

  if (
    context === "passwordReset" &&
    (message.includes("invalid") || message.includes("expired") || message.includes("otp"))
  ) {
    return "El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.";
  }

  if (message.includes("email address not authorized")) {
    return "No pudimos enviar el correo a esa dirección. Verifica el correo o intenta con otro.";
  }

  if (message.includes("user already registered") || message.includes("already registered")) {
    return "Ese correo ya está registrado. Intenta iniciar sesión o usa otro correo.";
  }

  if (message.includes("rate limit") || message.includes("security purposes")) {
    return "Hiciste demasiados intentos en poco tiempo. Espera unos minutos antes de volver a probar.";
  }

  if (status === 429) {
    return "Hay demasiados intentos seguidos. Espera unos minutos antes de volver a probar.";
  }

  if (status && status >= 500) {
    return "El servicio no respondió correctamente. Intenta de nuevo en unos minutos.";
  }

  if (message.includes("password")) {
    return "La contraseña debe tener al menos 6 caracteres. Usa una contraseña más larga e intenta de nuevo.";
  }

  if (message.includes("invalid email")) {
    return "El correo electrónico no es válido.";
  }

  return "No pudimos completar la solicitud. Revisa los datos e intenta de nuevo.";
}
