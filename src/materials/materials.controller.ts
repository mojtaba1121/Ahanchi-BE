import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateMaterialDto } from './dto/create-material.dto';
import { MaterialsService } from './materials.service';

@ApiTags('materials')
@ApiBearerAuth()
@Controller('materials')
export class MaterialsController {
  constructor(private readonly service: MaterialsService) {}

  @Get()
  list(@Query('includeInactive') includeInactive?: string) { return this.service.list(includeInactive === 'true'); }

  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @Post()
  create(@Body() dto: CreateMaterialDto) { return this.service.create(dto); }

  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @Patch(':id/activate')
  activate(@Param('id') id: string) { return this.service.setActive(id, true); }

  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) { return this.service.setActive(id, false); }
}
