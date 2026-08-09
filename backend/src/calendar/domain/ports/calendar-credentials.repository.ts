import { CalendarCredentials } from "../entities/calendar-credentials.entity";

export const CALENDAR_CREDENTIALS_REPOSITORY = Symbol("CALENDAR_CREDENTIALS_REPOSITORY");

export interface UpsertCalendarCredentialsInput {
  businessId: number;
  provider: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiryDate: Date;
  scope: string;
}

export interface CalendarCredentialsRepository {
  findByBusinessId(businessId: number): Promise<CalendarCredentials | null>;
  /** Crea o reemplaza las credenciales del negocio (una conexión de calendario por negocio). */
  upsert(input: UpsertCalendarCredentialsInput): Promise<CalendarCredentials>;
  /** Actualiza solo el access_token tras un refresh transparente — el refresh_token no cambia. */
  updateAccessToken(businessId: number, accessToken: string, tokenExpiryDate: Date): Promise<void>;
  deleteByBusinessId(businessId: number): Promise<void>;
}
