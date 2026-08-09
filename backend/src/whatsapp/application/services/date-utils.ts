const TIMEZONE = "America/Santo_Domingo";

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de República Dominicana. */
export function todayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

export function tomorrowDateString(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(tomorrow);
}

/** Descripción legible de "ahora" para el prompt del bot, ej: "sábado, 8 de agosto de 2026, 14:30". */
export function nowDescription(): string {
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: TIMEZONE,
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}
