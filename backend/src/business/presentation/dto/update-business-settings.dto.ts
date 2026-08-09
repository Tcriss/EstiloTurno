import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class UpdateBusinessSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsappPhoneNumberId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  workStartMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  workEndMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  slotIntervalMinutes?: number;

  @IsOptional()
  @IsBoolean()
  botEnabled?: boolean;
}
