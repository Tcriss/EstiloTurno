import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3301);

  const corsOrigins = configService.get<string>("CORS_ORIGINS");
  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(",").map((origin) => origin.trim()) : ["http://localhost:3000"],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  await app.listen(port);
  console.log(`EstiloTurno backend running on http://localhost:${port}`);
}

void bootstrap();
