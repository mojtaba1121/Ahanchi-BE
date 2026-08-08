import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Seller, SellerSchema } from './schemas/seller.schema';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Seller.name, schema: SellerSchema }])],
  providers: [SellersService],
  controllers: [SellersController],
  exports: [SellersService, MongooseModule],
})
export class SellersModule {}
