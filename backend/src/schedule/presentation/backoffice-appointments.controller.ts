import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/presentation/guards/jwt-auth.guard";
import { ListAppointmentsUseCase } from "../application/use-cases/list-appointments.use-case";
import { UpdateAppointmentUseCase } from "../application/use-cases/update-appointment.use-case";
import { ListAppointmentsQueryDto } from "./dto/list-appointments-query.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

type AuthenticatedRequest = { user: { businessId: number } };

@Controller("backoffice/appointments")
@UseGuards(JwtAuthGuard)
export class BackofficeAppointmentsController {
  constructor(
    private readonly listAppointmentsUseCase: ListAppointmentsUseCase,
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase
  ) {}

  @Get()
  async list(@Req() request: AuthenticatedRequest, @Query() query: ListAppointmentsQueryDto) {
    return this.listAppointmentsUseCase.execute(request.user.businessId, {
      date: query.date,
      status: query.status,
    });
  }

  @Patch(":id")
  async update(
    @Req() request: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto
  ) {
    return this.updateAppointmentUseCase.execute(request.user.businessId, id, dto);
  }
}
