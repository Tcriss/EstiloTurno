import { AuthApiError } from "@/services/auth.service";

type AuthErrorContext = "login" | "register" | "passwordReset";

export function getAuthErrorMessage(error: unknown, context: AuthErrorContext = "login"): string {
  if (!(error instanceof AuthApiError)) {
    return "No pudimos completar la solicitud. Revisa los datos e intenta de nuevo.";
  }

  const { status, body } = error;
  const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
  const lower = message.toLowerCase();

  if (status === 401) {
    return context === "login"
      ? "El correo o la contraseña no son correctos. Verifica tus datos."
      : "No pudimos confirmar esos datos.";
  }

  if (status === 409) {
    return "Ese correo ya está registrado. Intenta iniciar sesión o usa otro correo.";
  }

  if (context === "passwordReset" && status === 400) {
    return "El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.";
  }

  if (status === 429) {
    return "Hiciste demasiados intentos en poco tiempo. Espera unos minutos antes de volver a probar.";
  }

  if (status >= 500) {
    return "El servicio no respondió correctamente. Intenta de nuevo en unos minutos.";
  }

  if (lower.includes("password")) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  return message || "No pudimos completar la solicitud. Revisa los datos e intenta de nuevo.";
}
