import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SellersModule } from '../sellers/sellers.module';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { LedgerEntry, LedgerEntrySchema } from './schemas/ledger-entry.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: LedgerEntry.name, schema: LedgerEntrySchema }]), SellersModule],
  providers: [LedgerService],
  controllers: [LedgerController],
  exports: [LedgerService, MongooseModule],
})
export class LedgerModule {}
