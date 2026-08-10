import { Inject, Injectable } from "@nestjs/common";
import {
  CALENDAR_CREDENTIALS_REPOSITORY,
  CalendarCredentialsRepository,
} from "../../domain/ports/calendar-credentials.repository";

@Injectable()
export class DisconnectGoogleCalendarUseCase {
  constructor(
    @Inject(CALENDAR_CREDENTIALS_REPOSITORY) private readonly credentialsRepository: CalendarCredentialsRepository
  ) {}

  async execute(businessId: number): Promise<void> {
    // No revocamos el token contra Google (POST /revoke) — si el negocio quiere
    // revocar el acceso de verdad, puede hacerlo desde su cuenta de Google.
    // Acá solo dejamos de usarlo nosotros.
    await this.credentialsRepository.deleteByBusinessId(businessId);
  }
}
