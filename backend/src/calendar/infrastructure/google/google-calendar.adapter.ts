import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { google } from "googleapis";
import {
  CalendarCredentialsSnapshot,
  CalendarEventInput,
  CalendarOAuthTokens,
  CalendarProvider,
} from "../../domain/ports/calendar-provider";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

@Injectable()
export class GoogleCalendarAdapter implements CalendarProvider {
  private readonly logger = new Logger(GoogleCalendarAdapter.name);

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string
  ) {}

  private newClient() {
    return new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
  }

  generateAuthUrl(state: string): string {
    const client = this.newClient();
    return client.generateAuthUrl({
      access_type: "offline",
      // Fuerza que Google reemita refresh_token incluso en reconexiones — sin esto
      // solo viene la primera vez que esa cuenta autoriza esta app.
      prompt: "consent",
      scope: SCOPES,
      state,
    });
  }

  async exchangeCodeForTokens(code: string): Promise<CalendarOAuthTokens> {
    const client = this.newClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      // Sin refresh_token no podemos operar en background — típicamente pasa si
      // el usuario ya había autorizado antes y Google no volvió a emitirlo
      // (no debería ocurrir porque forzamos prompt=consent, pero lo validamos).
      throw new InternalServerErrorException(
        "Google no devolvió un refresh_token. Revocá el acceso desde tu cuenta de Google e intentá reconectar."
      );
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiryDate: new Date(tokens.expiry_date),
      scope: tokens.scope ?? SCOPES.join(" "),
    };
  }

  async createEvent(
    credentials: CalendarCredentialsSnapshot,
    event: CalendarEventInput
  ): Promise<{ googleEventId: string; refreshedAccessToken?: { accessToken: string; tokenExpiryDate: Date } }> {
    const client = this.newClient();
    client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.tokenExpiryDate.getTime(),
    });

    let refreshedAccessToken: { accessToken: string; tokenExpiryDate: Date } | undefined;
    // googleapis refresca solo el access_token cuando está vencido; este listener
    // captura el nuevo valor para que el caller lo persista (el refresh_token no rota).
    client.on("tokens", (tokens) => {
      if (tokens.access_token && tokens.expiry_date) {
        refreshedAccessToken = { accessToken: tokens.access_token, tokenExpiryDate: new Date(tokens.expiry_date) };
      }
    });

    const calendar = google.calendar({ version: "v3", auth: client });

    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: event.title,
          description: event.description,
          start: { dateTime: event.startDateTime, timeZone: event.timeZone },
          end: { dateTime: event.endDateTime, timeZone: event.timeZone },
        },
      });

      if (!response.data.id) {
        throw new InternalServerErrorException("Google Calendar no devolvió un id de evento.");
      }

      return { googleEventId: response.data.id, refreshedAccessToken };
    } catch (error) {
      this.logger.error("Error creando evento en Google Calendar", error as Error);
      throw error;
    }
  }
}
