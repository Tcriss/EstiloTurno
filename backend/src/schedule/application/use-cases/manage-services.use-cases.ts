import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Service } from "../../domain/entities/service.entity";
import {
  CreateServiceInput,
  SCHEDULE_REPOSITORY,
  ScheduleRepository,
  UpdateServiceInput,
} from "../../domain/ports/schedule.repository";

const PG_UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === PG_UNIQUE_VIOLATION;
}

@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository) {}

  async execute(input: CreateServiceInput): Promise<Service> {
    try {
      return await this.scheduleRepository.createService(input);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Ya existe un servicio con ese nombre en este negocio.");
      }
      throw error;
    }
  }
}

@Injectable()
export class UpdateServiceUseCase {
  constructor(@Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository) {}

  async execute(businessId: number, serviceId: number, input: UpdateServiceInput): Promise<Service> {
    try {
      const updated = await this.scheduleRepository.updateService(businessId, serviceId, input);
      if (!updated) {
        throw new NotFoundException("El servicio no existe para este negocio.");
      }
      return updated;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Ya existe un servicio con ese nombre en este negocio.");
      }
      throw error;
    }
  }
}

@Injectable()
export class DeleteServiceUseCase {
  constructor(@Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository) {}

  async execute(businessId: number, serviceId: number): Promise<void> {
    const deleted = await this.scheduleRepository.deleteService(businessId, serviceId);
    if (!deleted) {
      throw new NotFoundException("El servicio no existe para este negocio.");
    }
  }
}
