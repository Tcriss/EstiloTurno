import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  CALENDAR_CREDENTIALS_REPOSITORY,
  CalendarCredentialsRepository,
} from "../../domain/ports/calendar-credentials.repository";
import { CALENDAR_PROVIDER, CalendarProvider } from "../../domain/ports/calendar-provider";
import { OAuthStateSigner } from "../../infrastructure/crypto/oauth-state.signer";
import { OAUTH_STATE_SIGNER } from "../../calendar.tokens";

@Injectable()
export class HandleGoogleCalendarCallbackUseCase {
  constructor(
    @Inject(CALENDAR_PROVIDER) private readonly calendarProvider: CalendarProvider,
    @Inject(CALENDAR_CREDENTIALS_REPOSITORY) private readonly credentialsRepository: CalendarCredentialsRepository,
    @Inject(OAUTH_STATE_SIGNER) private readonly stateSigner: OAuthStateSigner
  ) {}

  async execute(code: string, state: string): Promise<{ businessId: number }> {
    const businessId = this.stateSigner.verify(state);
    if (!businessId) {
      throw new BadRequestException("El link de conexión venció o no es válido. Iniciá la conexión nuevamente.");
    }

    const tokens = await this.calendarProvider.exchangeCodeForTokens(code);

    await this.credentialsRepository.upsert({
      businessId,
      provider: "google",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiryDate: tokens.tokenExpiryDate,
      scope: tokens.scope,
    });

    return { businessId };
  }
}
