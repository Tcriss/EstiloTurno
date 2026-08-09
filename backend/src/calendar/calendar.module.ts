import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APPOINTMENT_CALENDAR_SYNC } from "../schedule/domain/ports/appointment-calendar-sync";
import { DisconnectGoogleCalendarUseCase } from "./application/use-cases/disconnect-google-calendar.use-case";
import { GetCalendarConnectionStatusUseCase } from "./application/use-cases/get-calendar-connection-status.use-case";
import { HandleGoogleCalendarCallbackUseCase } from "./application/use-cases/handle-google-calendar-callback.use-case";
import { StartGoogleCalendarConnectionUseCase } from "./application/use-cases/start-google-calendar-connection.use-case";
import { SyncAppointmentToCalendarUseCase } from "./application/use-cases/sync-appointment-to-calendar.use-case";
import { CALENDAR_TOKEN_CIPHER, OAUTH_STATE_SIGNER } from "./calendar.tokens";
import { CALENDAR_CREDENTIALS_REPOSITORY } from "./domain/ports/calendar-credentials.repository";
import { CALENDAR_PROVIDER } from "./domain/ports/calendar-provider";
import { OAuthStateSigner } from "./infrastructure/crypto/oauth-state.signer";
import { TokenCipher } from "./infrastructure/crypto/token-cipher";
import { GoogleCalendarAdapter } from "./infrastructure/google/google-calendar.adapter";
import { DrizzleCalendarCredentialsRepository } from "./infrastructure/persistence/drizzle-calendar-credentials.repository";
import { CalendarController, CalendarPublicController } from "./presentation/calendar.controller";

@Module({
  controllers: [CalendarController, CalendarPublicController],
  providers: [
    StartGoogleCalendarConnectionUseCase,
    HandleGoogleCalendarCallbackUseCase,
    GetCalendarConnectionStatusUseCase,
    DisconnectGoogleCalendarUseCase,
    SyncAppointmentToCalendarUseCase,
    {
      provide: CALENDAR_TOKEN_CIPHER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new TokenCipher(configService.get<string>("CALENDAR_TOKEN_ENCRYPTION_KEY") ?? ""),
    },
    {
      provide: OAUTH_STATE_SIGNER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new OAuthStateSigner(configService.get<string>("CALENDAR_TOKEN_ENCRYPTION_KEY") ?? ""),
    },
    {
      provide: CALENDAR_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new GoogleCalendarAdapter(
          configService.get<string>("GOOGLE_CALENDAR_CLIENT_ID") ?? "",
          configService.get<string>("GOOGLE_CALENDAR_CLIENT_SECRET") ?? "",
          configService.get<string>("GOOGLE_CALENDAR_REDIRECT_URI") ?? ""
        ),
    },
    { provide: CALENDAR_CREDENTIALS_REPOSITORY, useClass: DrizzleCalendarCredentialsRepository },
    // Implementación del puerto que consume ScheduleModule — ver AppointmentCalendarSync.
    { provide: APPOINTMENT_CALENDAR_SYNC, useExisting: SyncAppointmentToCalendarUseCase },
  ],
  exports: [APPOINTMENT_CALENDAR_SYNC],
})
export class CalendarModule {}
