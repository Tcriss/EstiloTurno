import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { WhatsappModule } from "./whatsapp/whatsapp.module";
import { DatabaseModule } from "./database/database.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 60 }]),
    DatabaseModule,
    AuthModule,
    ScheduleModule,
    WhatsappModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
