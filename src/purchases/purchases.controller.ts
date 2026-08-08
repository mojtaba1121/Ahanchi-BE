import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchasesService } from './purchases.service';

@ApiTags('purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  @Post()
  create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: AuthUser) { return this.service.create(dto, user); }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('materialId') materialId?: string,
  ) { return this.service.list(user, from, to, materialId); }
}
