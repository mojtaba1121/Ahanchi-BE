import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Material } from '../../materials/schemas/material.schema';
import { Seller } from '../../sellers/schemas/seller.schema';
import { User } from '../../users/schemas/user.schema';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ timestamps: true, versionKey: false })
export class Purchase {
  @Prop({ required: true, type: Types.ObjectId, ref: Seller.name, index: true })
  seller: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Material.name, index: true })
  material: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
  representative: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  weightGrams: number;

  @Prop({ required: true, min: 0 })
  pricePerKgToman: number;

  @Prop({ required: true, min: 0 })
  totalAmountToman: number;

  @Prop({ required: true, unique: true, index: true })
  clientOperationId: string;

  @Prop({ required: true, index: true })
  purchasedAt: Date;

  @Prop({ trim: true })
  note?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  village?: string;

  createdAt: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
PurchaseSchema.index({ purchasedAt: -1, material: 1, representative: 1 });
