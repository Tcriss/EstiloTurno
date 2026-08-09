import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Business } from "../../domain/entities/business.entity";
import { BUSINESS_REPOSITORY, BusinessRepository } from "../../domain/ports/business.repository";

@Injectable()
export class GetBusinessUseCase {
  constructor(@Inject(BUSINESS_REPOSITORY) private readonly businessRepository: BusinessRepository) {}

  async execute(id: number): Promise<Business> {
    const business = await this.businessRepository.findById(id);
    if (!business) {
      throw new NotFoundException("Negocio no encontrado.");
    }
    return business;
  }
}
