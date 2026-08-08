import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';
import { CreateSellerDto } from './dto/create-seller.dto';
import { SellersService } from './sellers.service';

@ApiTags('sellers')
@ApiBearerAuth()
@Controller('sellers')
export class SellersController {
  constructor(private readonly service: SellersService) {}

  @Post()
  create(@Body() dto: CreateSellerDto, @CurrentUser() user: AuthUser) { return this.service.create(dto, user); }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('search') search?: string) { return this.service.list(user, search); }

  @Get(':id')
  find(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.getForUser(id, user); }
}
