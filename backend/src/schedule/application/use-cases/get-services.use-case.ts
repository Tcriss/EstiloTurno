import { Inject, Injectable } from "@nestjs/common";
import { Service } from "../../domain/entities/service.entity";
import { SCHEDULE_REPOSITORY, ScheduleRepository } from "../../domain/ports/schedule.repository";

@Injectable()
export class GetServicesUseCase {
  constructor(@Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository) {}

  execute(businessId: number): Promise<Service[]> {
    return this.scheduleRepository.findAllServices(businessId);
  }
}
