import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Material, MaterialSchema } from '../materials/schemas/material.schema';
import { RoleDefinition, RoleDefinitionSchema } from '../roles/schemas/role-definition.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Material.name, schema: MaterialSchema },
    { name: RoleDefinition.name, schema: RoleDefinitionSchema },
  ])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
