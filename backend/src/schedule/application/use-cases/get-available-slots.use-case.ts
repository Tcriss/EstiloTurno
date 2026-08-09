import { Inject, Injectable } from "@nestjs/common";
import { GetBusinessUseCase } from "../../../business/application/use-cases/get-business.use-case";
import { computeAvailableSlots } from "../../domain/services/availability-calculator";
import { SCHEDULE_REPOSITORY, ScheduleRepository } from "../../domain/ports/schedule.repository";

@Injectable()
export class GetAvailableSlotsUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository,
    private readonly getBusinessUseCase: GetBusinessUseCase
  ) {}

  async execute(businessId: number, dateStr: string, serviceId: number): Promise<string[]> {
    const service = await this.scheduleRepository.findServiceById(businessId, serviceId);
    if (!service) {
      return [];
    }

    const business = await this.getBusinessUseCase.execute(businessId);
    const bookedRanges = await this.scheduleRepository.findBookedRanges(businessId, dateStr);

    return computeAvailableSlots(
      {
        workStartMinutes: business.workStartMinutes,
        workEndMinutes: business.workEndMinutes,
        slotIntervalMinutes: business.slotIntervalMinutes,
      },
      service.durationMinutes,
      bookedRanges
    );
  }
}
