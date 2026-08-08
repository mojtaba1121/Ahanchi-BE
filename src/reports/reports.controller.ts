import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('dashboard')
  dashboard(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('representativeId') representativeId?: string,
  ) { return this.service.dashboard(from, to, representativeId); }
}
