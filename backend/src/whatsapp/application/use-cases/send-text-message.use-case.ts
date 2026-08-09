import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { GetBusinessUseCase } from "../../../business/application/use-cases/get-business.use-case";
import { WHATSAPP_MESSENGER, WhatsappMessenger } from "../../domain/ports/whatsapp-messenger";

@Injectable()
export class SendTextMessageUseCase {
  constructor(
    @Inject(WHATSAPP_MESSENGER) private readonly whatsappMessenger: WhatsappMessenger,
    private readonly getBusinessUseCase: GetBusinessUseCase
  ) {}

  async execute(businessId: number, to: string, message: string): Promise<unknown> {
    if (!to || !message) {
      throw new BadRequestException("The destination phone number and message are required.");
    }

    const business = await this.getBusinessUseCase.execute(businessId);
    return this.whatsappMessenger.sendText(to, message, business.whatsappPhoneNumberId ?? undefined);
  }
}
