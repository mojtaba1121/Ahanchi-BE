import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, index: true, match: /^09\d{9}$/ })
  phone: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, enum: UserRole, index: true })
  role: UserRole;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  village?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: true })
  mustChangePassword: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
