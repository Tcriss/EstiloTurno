import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { WhatsappModule } from "./whatsapp/whatsapp.module";
import { DatabaseModule } from "./database/database.module";
import { ScheduleModule } from "./schedule/schedule.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ScheduleModule,
    WhatsappModule,
  ],
})


export class AppModule {}
