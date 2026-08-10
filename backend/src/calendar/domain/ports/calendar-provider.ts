export const CALENDAR_PROVIDER = Symbol("CALENDAR_PROVIDER");

export interface CalendarOAuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Ausente si Google no devolvió refresh_token (ej. reconexión sin prompt=consent). */
  tokenExpiryDate: Date;
  scope: string;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  /** ISO 8601 con offset, ej. 2026-08-20T15:00:00-04:00 */
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
}

export interface CalendarCredentialsSnapshot {
  accessToken: string;
  refreshToken: string;
  tokenExpiryDate: Date;
}

/**
 * Puerto agnóstico de proveedor de calendario: hoy solo hay adapter de Google,
 * pero mantiene la simetría con NluEngine por si mañana se agrega Outlook/iCal.
 */
export interface CalendarProvider {
  generateAuthUrl(state: string): string;
  exchangeCodeForTokens(code: string): Promise<CalendarOAuthTokens>;
  /**
   * Crea el evento. Si el access_token está vencido, refresca con el refresh_token
   * y devuelve el nuevo access_token/expiry para que el caller los persista.
   */
  createEvent(
    credentials: CalendarCredentialsSnapshot,
    event: CalendarEventInput
  ): Promise<{ googleEventId: string; refreshedAccessToken?: { accessToken: string; tokenExpiryDate: Date } }>;
}
