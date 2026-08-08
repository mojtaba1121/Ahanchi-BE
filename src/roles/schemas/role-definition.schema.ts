import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';

export type RoleDefinitionDocument = HydratedDocument<RoleDefinition>;

@Schema({ timestamps: true, versionKey: false })
export class RoleDefinition {
  @Prop({ required: true, unique: true, enum: UserRole })
  code: UserRole;

  @Prop({ required: true })
  titleFa: string;

  @Prop({ required: true })
  descriptionFa: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: true })
  isSystem: boolean;
}

export const RoleDefinitionSchema = SchemaFactory.createForClass(RoleDefinition);
