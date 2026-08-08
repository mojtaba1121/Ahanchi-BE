import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RoleDefinition } from './schemas/role-definition.schema';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
export class RolesController {
  constructor(@InjectModel(RoleDefinition.name) private readonly roles: Model<RoleDefinition>) {}

  @Get()
  list() { return this.roles.find().sort({ code: 1 }).lean(); }
}
