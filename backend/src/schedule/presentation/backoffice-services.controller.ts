import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Role } from "../../auth/domain/entities/role.enum";
import { Roles } from "../../auth/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/presentation/guards/roles.guard";
import {
  CreateServiceUseCase,
  DeleteServiceUseCase,
  UpdateServiceUseCase,
} from "../application/use-cases/manage-services.use-cases";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

type AuthenticatedRequest = { user: { businessId: number } };

@Controller("backoffice/services")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class BackofficeServicesController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase
  ) {}

  @Post()
  async create(@Req() request: AuthenticatedRequest, @Body() dto: CreateServiceDto) {
    return this.createServiceUseCase.execute({
      businessId: request.user.businessId,
      name: dto.name,
      price: dto.price,
      durationMinutes: dto.durationMinutes,
    });
  }

  @Patch(":id")
  async update(
    @Req() request: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto
  ) {
    return this.updateServiceUseCase.execute(request.user.businessId, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Req() request: AuthenticatedRequest, @Param("id", ParseIntPipe) id: number) {
    await this.deleteServiceUseCase.execute(request.user.businessId, id);
  }
}
