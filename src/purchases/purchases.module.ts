import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LedgerModule } from '../ledger/ledger.module';
import { Material, MaterialSchema } from '../materials/schemas/material.schema';
import { SellersModule } from '../sellers/sellers.module';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
    SellersModule,
    LedgerModule,
  ],
  providers: [PurchasesService],
  controllers: [PurchasesController],
  exports: [PurchasesService, MongooseModule],
})
export class PurchasesModule {}
