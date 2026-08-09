import { IsIn, IsOptional, Matches } from "class-validator";
import { APPOINTMENT_STATUSES, AppointmentStatus } from "../../domain/entities/appointment.entity";

export class UpdateAppointmentDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "date debe tener formato YYYY-MM-DD" })
  date?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: "time debe tener formato HH:MM" })
  time?: string;

  @IsOptional()
  @IsIn(APPOINTMENT_STATUSES)
  status?: AppointmentStatus;
}
