import { IsInt, IsNotEmpty, IsString, Matches, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "date debe tener formato YYYY-MM-DD" })
  date: string;

  @Matches(/^\d{2}:\d{2}$/, { message: "time debe tener formato HH:MM" })
  time: string;
}
