import { IsInt, Matches, Min } from "class-validator";
import { Type } from "class-transformer";

export class AvailabilityQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "date debe tener formato YYYY-MM-DD" })
  date: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId: number;
}
