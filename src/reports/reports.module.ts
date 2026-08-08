import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LedgerEntry, LedgerEntrySchema } from '../ledger/schemas/ledger-entry.schema';
import { Purchase, PurchaseSchema } from '../purchases/schemas/purchase.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Purchase.name, schema: PurchaseSchema },
    { name: LedgerEntry.name, schema: LedgerEntrySchema },
  ])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
