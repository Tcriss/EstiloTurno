import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { Role } from "../../auth/domain/entities/role.enum";
import { Roles } from "../../auth/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/presentation/guards/roles.guard";
import { GetBusinessUseCase } from "../application/use-cases/get-business.use-case";
import { UpdateBusinessSettingsUseCase } from "../application/use-cases/update-business-settings.use-case";
import { UpdateBusinessSettingsDto } from "./dto/update-business-settings.dto";

@Controller("backoffice/business")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessController {
  constructor(
    private readonly getBusinessUseCase: GetBusinessUseCase,
    private readonly updateBusinessSettingsUseCase: UpdateBusinessSettingsUseCase
  ) {}

  @Get()
  async getBusiness(@Req() request: { user: { businessId: number } }) {
    return this.getBusinessUseCase.execute(request.user.businessId);
  }

  @Patch()
  @Roles(Role.ADMIN)
  async updateSettings(@Req() request: { user: { businessId: number } }, @Body() dto: UpdateBusinessSettingsDto) {
    return this.updateBusinessSettingsUseCase.execute(request.user.businessId, dto);
  }
}
