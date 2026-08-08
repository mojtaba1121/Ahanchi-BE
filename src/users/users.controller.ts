import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthUser) { return this.service.create(dto, actor); }

  @Get()
  list() { return this.service.list(); }

  @Get(':id')
  find(@Param('id') id: string) { return this.service.findById(id); }

  @Patch(':id/activate')
  activate(@Param('id') id: string) { return this.service.setActive(id, true); }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) { return this.service.setActive(id, false); }
}
