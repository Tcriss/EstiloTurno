import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Business } from "../../domain/entities/business.entity";
import {
  BUSINESS_REPOSITORY,
  BusinessRepository,
  UpdateBusinessSettingsInput,
} from "../../domain/ports/business.repository";

@Injectable()
export class UpdateBusinessSettingsUseCase {
  constructor(@Inject(BUSINESS_REPOSITORY) private readonly businessRepository: BusinessRepository) {}

  async execute(businessId: number, input: UpdateBusinessSettingsInput): Promise<Business> {
    const workStart = input.workStartMinutes;
    const workEnd = input.workEndMinutes;
    if (workStart !== undefined && workEnd !== undefined && workStart >= workEnd) {
      throw new BadRequestException("El inicio del horario laboral debe ser anterior al cierre.");
    }

    const current = await this.businessRepository.findById(businessId);
    if (!current) {
      throw new NotFoundException("Negocio no encontrado.");
    }

    // Si solo llega uno de los dos extremos, validarlo contra el valor vigente
    const effectiveStart = workStart ?? current.workStartMinutes;
    const effectiveEnd = workEnd ?? current.workEndMinutes;
    if (effectiveStart >= effectiveEnd) {
      throw new BadRequestException("El horario laboral resultante es inválido (inicio >= cierre).");
    }

    const updated = await this.businessRepository.update(businessId, input);
    if (!updated) {
      throw new NotFoundException("Negocio no encontrado.");
    }
    return updated;
  }
}
