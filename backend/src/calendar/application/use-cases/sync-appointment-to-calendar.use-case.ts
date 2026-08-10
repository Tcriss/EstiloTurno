import { Inject, Injectable } from "@nestjs/common";
import { AppointmentCalendarSync, AppointmentSyncInput } from "../../../schedule/domain/ports/appointment-calendar-sync";
import {
  CALENDAR_CREDENTIALS_REPOSITORY,
  CalendarCredentialsRepository,
} from "../../domain/ports/calendar-credentials.repository";
import { CALENDAR_PROVIDER, CalendarProvider } from "../../domain/ports/calendar-provider";

const TIMEZONE = "America/Santo_Domingo";
// RD no observa horario de verano — offset fijo. Si se agrega soporte multi-país,
// esto tiene que resolverse dinámicamente por negocio.
const UTC_OFFSET = "-04:00";

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m, s] = normalizeTime(time).split(":").map(Number);
  const total = h * 60 + m + minutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

@Injectable()
export class SyncAppointmentToCalendarUseCase implements AppointmentCalendarSync {
  constructor(
    @Inject(CALENDAR_CREDENTIALS_REPOSITORY) private readonly credentialsRepository: CalendarCredentialsRepository,
    @Inject(CALENDAR_PROVIDER) private readonly calendarProvider: CalendarProvider
  ) {}

  async syncAppointmentCreated(input: AppointmentSyncInput): Promise<void> {
    const credentials = await this.credentialsRepository.findByBusinessId(input.businessId);
    if (!credentials) {
      // El negocio no conectó Google Calendar — no hay nada que sincronizar.
      return;
    }

    const startTime = normalizeTime(input.startTime);
    const endTime = addMinutes(startTime, input.durationMinutes);

    const result = await this.calendarProvider.createEvent(
      {
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        tokenExpiryDate: credentials.tokenExpiryDate,
      },
      {
        title: `${input.serviceName} — ${input.clientName}`,
        description: `Cita agendada vía EstiloTurno (#${input.appointmentId}).`,
        startDateTime: `${input.date}T${startTime}${UTC_OFFSET}`,
        endDateTime: `${input.date}T${endTime}${UTC_OFFSET}`,
        timeZone: TIMEZONE,
      }
    );

    if (result.refreshedAccessToken) {
      await this.credentialsRepository.updateAccessToken(
        input.businessId,
        result.refreshedAccessToken.accessToken,
        result.refreshedAccessToken.tokenExpiryDate
      );
    }
  }
}
