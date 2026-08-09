import { Inject, Injectable } from "@nestjs/common";
import { AppointmentWithDetails } from "../../domain/entities/appointment.entity";
import {
  ListAppointmentsFilters,
  SCHEDULE_REPOSITORY,
  ScheduleRepository,
} from "../../domain/ports/schedule.repository";

@Injectable()
export class ListAppointmentsUseCase {
  constructor(@Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository) {}

  execute(businessId: number, filters: ListAppointmentsFilters): Promise<AppointmentWithDetails[]> {
    return this.scheduleRepository.listAppointments(businessId, filters);
  }
}
