import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { Material, MaterialSchema } from './schemas/material.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }])],
  providers: [MaterialsService],
  controllers: [MaterialsController],
  exports: [MaterialsService, MongooseModule],
})
export class MaterialsModule {}
