import { Inject, Injectable } from "@nestjs/common";
import { CALENDAR_PROVIDER, CalendarProvider } from "../../domain/ports/calendar-provider";
import { OAuthStateSigner } from "../../infrastructure/crypto/oauth-state.signer";
import { OAUTH_STATE_SIGNER } from "../../calendar.tokens";

@Injectable()
export class StartGoogleCalendarConnectionUseCase {
  constructor(
    @Inject(CALENDAR_PROVIDER) private readonly calendarProvider: CalendarProvider,
    @Inject(OAUTH_STATE_SIGNER) private readonly stateSigner: OAuthStateSigner
  ) {}

  execute(businessId: number): { authUrl: string } {
    const state = this.stateSigner.sign(businessId);
    return { authUrl: this.calendarProvider.generateAuthUrl(state) };
  }
}
