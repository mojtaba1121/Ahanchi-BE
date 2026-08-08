import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './roles.controller';
import { RoleDefinition, RoleDefinitionSchema } from './schemas/role-definition.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: RoleDefinition.name, schema: RoleDefinitionSchema }])],
  controllers: [RolesController],
  exports: [MongooseModule],
})
export class RolesModule {}
