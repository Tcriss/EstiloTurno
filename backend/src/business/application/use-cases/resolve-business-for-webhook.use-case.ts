import { Inject, Injectable, Logger } from "@nestjs/common";
import { Business } from "../../domain/entities/business.entity";
import { BUSINESS_REPOSITORY, BusinessRepository } from "../../domain/ports/business.repository";

/**
 * Resuelve a qué negocio pertenece un webhook entrante usando el phone_number_id
 * que Meta incluye en el payload. Fallback de desarrollo: si el número no matchea
 * y existe un único negocio, se usa ese (con warning) para poder probar con ngrok
 * sin configurar el phone_number_id en la base.
 */
@Injectable()
export class ResolveBusinessForWebhookUseCase {
  private readonly logger = new Logger(ResolveBusinessForWebhookUseCase.name);

  constructor(@Inject(BUSINESS_REPOSITORY) private readonly businessRepository: BusinessRepository) {}

  async execute(phoneNumberId: string | null): Promise<Business | null> {
    if (phoneNumberId) {
      const business = await this.businessRepository.findByWhatsappPhoneNumberId(phoneNumberId);
      if (business) {
        return business;
      }
    }

    const all = await this.businessRepository.findAll();
    if (all.length === 1) {
      this.logger.warn(
        `phone_number_id "${phoneNumberId ?? "desconocido"}" sin negocio asociado; usando el único negocio existente (id=${all[0].id}) como fallback de desarrollo.`
      );
      return all[0];
    }

    this.logger.warn(`Webhook ignorado: phone_number_id "${phoneNumberId ?? "desconocido"}" no corresponde a ningún negocio.`);
    return null;
  }
}
