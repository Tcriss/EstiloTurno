import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { GetBusinessUseCase } from "../../../business/application/use-cases/get-business.use-case";
import { Appointment } from "../../domain/entities/appointment.entity";
import { computeAvailableSlots } from "../../domain/services/availability-calculator";
import {
  SCHEDULE_REPOSITORY,
  ScheduleRepository,
  UpdateAppointmentInput,
} from "../../domain/ports/schedule.repository";

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository,
    private readonly getBusinessUseCase: GetBusinessUseCase
  ) {}

  async execute(businessId: number, appointmentId: number, input: UpdateAppointmentInput): Promise<Appointment> {
    const existing = await this.scheduleRepository.findAppointmentById(businessId, appointmentId);
    if (!existing) {
      throw new NotFoundException("La cita no existe para este negocio.");
    }

    const isReschedule = input.date !== undefined || input.time !== undefined;
    if (isReschedule) {
      const targetDate = input.date ?? existing.date;
      const targetTime = input.time ?? existing.startTime.slice(0, 5);

      const business = await this.getBusinessUseCase.execute(businessId);
      // Excluye la propia cita del cálculo: moverla dentro de su mismo rango es válido.
      const bookedRanges = await this.scheduleRepository.findBookedRanges(businessId, targetDate, appointmentId);
      const slots = computeAvailableSlots(
        {
          workStartMinutes: business.workStartMinutes,
          workEndMinutes: business.workEndMinutes,
          slotIntervalMinutes: business.slotIntervalMinutes,
        },
        existing.serviceDurationMinutes,
        bookedRanges
      );

      if (!slots.includes(targetTime)) {
        throw new BadRequestException("El nuevo horario no está disponible.");
      }
    }

    const updated = await this.scheduleRepository.updateAppointment(businessId, appointmentId, input);
    if (!updated) {
      throw new NotFoundException("La cita no existe para este negocio.");
    }
    return updated;
  }
}
