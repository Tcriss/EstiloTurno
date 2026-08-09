import { IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min } from "class-validator";

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Matches(/^\d+(\.\d{1,2})?$/, { message: "price debe ser un número decimal, ej: 500.00" })
  price: string;

  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes: number;
}
