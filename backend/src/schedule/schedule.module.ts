import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { CalendarModule } from "../calendar/calendar.module";
import { CreateAppointmentUseCase } from "./application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "./application/use-cases/get-available-slots.use-case";
import { GetServicesUseCase } from "./application/use-cases/get-services.use-case";
import { ListAppointmentsUseCase } from "./application/use-cases/list-appointments.use-case";
import {
  CreateServiceUseCase,
  DeleteServiceUseCase,
  UpdateServiceUseCase,
} from "./application/use-cases/manage-services.use-cases";
import { UpdateAppointmentUseCase } from "./application/use-cases/update-appointment.use-case";
import { SCHEDULE_REPOSITORY } from "./domain/ports/schedule.repository";
import { DrizzleScheduleRepository } from "./infrastructure/persistence/drizzle-schedule.repository";
import { BackofficeAppointmentsController } from "./presentation/backoffice-appointments.controller";
import { BackofficeServicesController } from "./presentation/backoffice-services.controller";
import { ScheduleController } from "./presentation/schedule.controller";

@Module({
  imports: [BusinessModule, CalendarModule],
  controllers: [ScheduleController, BackofficeAppointmentsController, BackofficeServicesController],
  providers: [
    GetServicesUseCase,
    GetAvailableSlotsUseCase,
    CreateAppointmentUseCase,
    ListAppointmentsUseCase,
    UpdateAppointmentUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    { provide: SCHEDULE_REPOSITORY, useClass: DrizzleScheduleRepository },
  ],
  exports: [GetServicesUseCase, GetAvailableSlotsUseCase, CreateAppointmentUseCase],
})
export class ScheduleModule {}
