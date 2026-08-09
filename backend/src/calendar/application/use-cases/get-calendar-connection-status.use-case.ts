import { Inject, Injectable } from "@nestjs/common";
import {
  CALENDAR_CREDENTIALS_REPOSITORY,
  CalendarCredentialsRepository,
} from "../../domain/ports/calendar-credentials.repository";

export interface CalendarConnectionStatus {
  connected: boolean;
  provider: string | null;
  connectedAt: Date | null;
}

@Injectable()
export class GetCalendarConnectionStatusUseCase {
  constructor(
    @Inject(CALENDAR_CREDENTIALS_REPOSITORY) private readonly credentialsRepository: CalendarCredentialsRepository
  ) {}

  async execute(businessId: number): Promise<CalendarConnectionStatus> {
    const credentials = await this.credentialsRepository.findByBusinessId(businessId);
    if (!credentials) {
      return { connected: false, provider: null, connectedAt: null };
    }
    return { connected: true, provider: credentials.provider, connectedAt: credentials.connectedAt };
  }
}
