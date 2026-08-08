import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user.type';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { LedgerService } from './ledger.service';

@ApiTags('ledger')
@ApiBearerAuth()
@Controller('ledger')
export class LedgerController {
  constructor(private readonly service: LedgerService) {}

  @Post()
  create(@Body() dto: CreateLedgerEntryDto, @CurrentUser() user: AuthUser) { return this.service.create(dto, user); }

  @Get('seller/:sellerId')
  list(@Param('sellerId') sellerId: string, @CurrentUser() user: AuthUser) { return this.service.listForSeller(sellerId, user); }

  @Get('seller/:sellerId/balance')
  balance(@Param('sellerId') sellerId: string, @CurrentUser() user: AuthUser) { return this.service.balance(sellerId, user); }
}
