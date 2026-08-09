import { IsNotEmpty, IsString } from "class-validator";

export class SendTestMessageDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
