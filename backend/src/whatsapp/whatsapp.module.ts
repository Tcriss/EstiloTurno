import { Module } from "@nestjs/common";
import { WhatsappController } from "./whatsapp.controller";
import { WhatsappService } from "./whatsapp.service";
import { ScheduleModule } from "../schedule/schedule.module";

@Module({
  imports: [ScheduleModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}

