import { BadRequestException, Inject, Injectable, Logger, NotFoundException, Optional } from "@nestjs/common";
import { Appointment } from "../../domain/entities/appointment.entity";
import { APPOINTMENT_CALENDAR_SYNC, AppointmentCalendarSync } from "../../domain/ports/appointment-calendar-sync";
import { SCHEDULE_REPOSITORY, ScheduleRepository } from "../../domain/ports/schedule.repository";
import { GetAvailableSlotsUseCase } from "./get-available-slots.use-case";

export interface CreateAppointmentCommand {
  businessId: number;
  phoneNumber: string;
  clientName: string;
  serviceId: number;
  date: string;
  time: string;
}

@Injectable()
export class CreateAppointmentUseCase {
  private readonly logger = new Logger(CreateAppointmentUseCase.name);

  constructor(
    @Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    @Optional()
    @Inject(APPOINTMENT_CALENDAR_SYNC)
    private readonly calendarSync?: AppointmentCalendarSync
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    const service = await this.scheduleRepository.findServiceById(command.businessId, command.serviceId);
    if (!service) {
      throw new NotFoundException("El servicio no existe para este negocio.");
    }

    const availableSlots = await this.getAvailableSlotsUseCase.execute(
      command.businessId,
      command.date,
      command.serviceId
    );
    if (!availableSlots.includes(command.time)) {
      throw new BadRequestException("El horario solicitado no está disponible.");
    }

    await this.scheduleRepository.upsertClient(command.phoneNumber, command.clientName);

    // El repo re-verifica el solapamiento dentro de una transacción con lock —
    // si otro cliente ganó el slot en el medio, lanza ConflictException.
    const appointment = await this.scheduleRepository.createAppointment({
      businessId: command.businessId,
      phoneNumber: command.phoneNumber,
      clientName: command.clientName,
      serviceId: command.serviceId,
      date: command.date,
      time: command.time,
      durationMinutes: service.durationMinutes,
    });

    // Best-effort: si el negocio no conectó Google Calendar, o si la sync falla,
    // la cita ya quedó creada en nuestra base — nunca bloqueamos la respuesta al cliente.
    if (this.calendarSync) {
      this.calendarSync
        .syncAppointmentCreated({
          appointmentId: appointment.id,
          businessId: command.businessId,
          clientName: command.clientName,
          serviceName: service.name,
          date: command.date,
          startTime: command.time,
          durationMinutes: service.durationMinutes,
        })
        .catch((error) => {
          this.logger.warn(`No se pudo sincronizar la cita #${appointment.id} con el calendario: ${error}`);
        });
    }

    return appointment;
  }
}
