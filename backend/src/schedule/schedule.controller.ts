import { Body, Controller, Get, Post, Query, BadRequestException } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";

type CreateAppointmentBody = {
  phoneNumber: string;
  clientName: string;
  serviceId: number;
  date: string;
  time: string;
};

@Controller("schedule")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get("services")
  async getServices() {
    return this.scheduleService.getServices();
  }

  @Get("availability")
  async getAvailability(
    @Query("date") date?: string,
    @Query("serviceId") serviceId?: string,
  ) {
    if (!date || !serviceId) {
      throw new BadRequestException("Ambos parámetros 'date' y 'serviceId' son obligatorios.");
    }
    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId)) {
      throw new BadRequestException("El parámetro 'serviceId' debe ser un número válido.");
    }
    return this.scheduleService.getAvailableSlots(date, parsedServiceId);
  }

  @Post("appointments")
  async createAppointment(@Body() body: CreateAppointmentBody) {
    const { phoneNumber, clientName, serviceId, date, time } = body;
    if (!phoneNumber || !clientName || !serviceId || !date || !time) {
      throw new BadRequestException("Todos los campos (phoneNumber, clientName, serviceId, date, time) son obligatorios.");
    }
    return this.scheduleService.createAppointment(phoneNumber, clientName, serviceId, date, time);
  }
}
