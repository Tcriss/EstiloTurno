import { BadRequestException, Controller, Delete, Get, Header, Query, Req, UseGuards } from "@nestjs/common";
import { Role } from "../../auth/domain/entities/role.enum";
import { Roles } from "../../auth/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/presentation/guards/roles.guard";
import { DisconnectGoogleCalendarUseCase } from "../application/use-cases/disconnect-google-calendar.use-case";
import { GetCalendarConnectionStatusUseCase } from "../application/use-cases/get-calendar-connection-status.use-case";
import { HandleGoogleCalendarCallbackUseCase } from "../application/use-cases/handle-google-calendar-callback.use-case";
import { StartGoogleCalendarConnectionUseCase } from "../application/use-cases/start-google-calendar-connection.use-case";

@Controller("backoffice/calendar")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(
    private readonly startConnectionUseCase: StartGoogleCalendarConnectionUseCase,
    private readonly getStatusUseCase: GetCalendarConnectionStatusUseCase,
    private readonly disconnectUseCase: DisconnectGoogleCalendarUseCase
  ) {}

  @Get("google/connect")
  @Roles(Role.ADMIN)
  connect(@Req() request: { user: { businessId: number } }) {
    return this.startConnectionUseCase.execute(request.user.businessId);
  }

  @Get("status")
  async getStatus(@Req() request: { user: { businessId: number } }) {
    return this.getStatusUseCase.execute(request.user.businessId);
  }

  @Delete("google")
  @Roles(Role.ADMIN)
  async disconnect(@Req() request: { user: { businessId: number } }) {
    await this.disconnectUseCase.execute(request.user.businessId);
    return { ok: true };
  }
}

/**
 * Endpoint público aparte: Google redirige acá directo desde el navegador del
 * dueño del negocio, sin Authorization header. La identidad viaja en `state`
 * (firmado en StartGoogleCalendarConnectionUseCase), no en el JWT de sesión.
 */
@Controller("calendar")
export class CalendarPublicController {
  constructor(private readonly handleCallbackUseCase: HandleGoogleCalendarCallbackUseCase) {}

  @Get("google/callback")
  @Header("Content-Type", "text/html")
  async callback(@Query("code") code: string, @Query("state") state: string): Promise<string> {
    if (!code || !state) {
      throw new BadRequestException("Faltan parámetros de OAuth (code/state).");
    }

    // Errores acá (state inválido/vencido, Google sin refresh_token, etc.) se
    // propagan como excepción NestJS normal — responden JSON de error, no HTML.
    // Es aceptable para un flujo de conexión que el dueño del negocio dispara una vez.
    await this.handleCallbackUseCase.execute(code, state);

    return (
      "<html><body style='font-family:sans-serif;text-align:center;padding-top:4rem'>" +
      "<h2>✅ Google Calendar conectado</h2><p>Ya podés cerrar esta pestaña.</p></body></html>"
    );
  }
}
