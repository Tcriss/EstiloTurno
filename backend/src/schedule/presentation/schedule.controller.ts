import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/presentation/guards/jwt-auth.guard";
import { CreateAppointmentUseCase } from "../application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "../application/use-cases/get-available-slots.use-case";
import { GetServicesUseCase } from "../application/use-cases/get-services.use-case";
import { AvailabilityQueryDto } from "./dto/availability-query.dto";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

type AuthenticatedRequest = { user: { businessId: number } };

@Controller("schedule")
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(
    private readonly getServicesUseCase: GetServicesUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly createAppointmentUseCase: CreateAppointmentUseCase
  ) {}

  @Get("services")
  async getServices(@Req() request: AuthenticatedRequest) {
    return this.getServicesUseCase.execute(request.user.businessId);
  }

  @Get("availability")
  async getAvailability(@Req() request: AuthenticatedRequest, @Query() query: AvailabilityQueryDto) {
    return this.getAvailableSlotsUseCase.execute(request.user.businessId, query.date, query.serviceId);
  }

  @Post("appointments")
  async createAppointment(@Req() request: AuthenticatedRequest, @Body() dto: CreateAppointmentDto) {
    return this.createAppointmentUseCase.execute({
      businessId: request.user.businessId,
      phoneNumber: dto.phoneNumber,
      clientName: dto.clientName,
      serviceId: dto.serviceId,
      date: dto.date,
      time: dto.time,
    });
  }
}
