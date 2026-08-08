import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type SellerDocument = HydratedDocument<Seller>;

@Schema({ timestamps: true, versionKey: false })
export class Seller {
  @Prop({ required: true, trim: true, index: true })
  fullName: string;

  @Prop({ trim: true, match: /^09\d{9}$/ })
  phone?: string;

  @Prop({ trim: true })
  nationalId?: string;

  @Prop({ trim: true, index: true })
  city?: string;

  @Prop({ trim: true, index: true })
  village?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  clientId: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
SellerSchema.index({ createdBy: 1, clientId: 1 }, { unique: true });
SellerSchema.index({ fullName: 'text', phone: 'text' });
