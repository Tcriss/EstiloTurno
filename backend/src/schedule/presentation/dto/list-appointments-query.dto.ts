import { IsIn, IsOptional, Matches } from "class-validator";
import { APPOINTMENT_STATUSES, AppointmentStatus } from "../../domain/entities/appointment.entity";

export class ListAppointmentsQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "date debe tener formato YYYY-MM-DD" })
  date?: string;

  @IsOptional()
  @IsIn(APPOINTMENT_STATUSES)
  status?: AppointmentStatus;
}
