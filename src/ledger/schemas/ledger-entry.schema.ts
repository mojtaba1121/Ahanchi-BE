import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LedgerType } from '../../common/enums/ledger-type.enum';
import { Seller } from '../../sellers/schemas/seller.schema';
import { User } from '../../users/schemas/user.schema';

export type LedgerEntryDocument = HydratedDocument<LedgerEntry>;

@Schema({ timestamps: true, versionKey: false })
export class LedgerEntry {
  @Prop({ required: true, type: Types.ObjectId, ref: Seller.name, index: true })
  seller: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
  representative: Types.ObjectId;

  @Prop({ required: true, enum: LedgerType, index: true })
  type: LedgerType;

  @Prop({ required: true, min: 1 })
  amountToman: number;

  @Prop({ required: true })
  signedAmountToman: number;

  @Prop({ type: Types.ObjectId, ref: 'Purchase', index: true })
  purchase?: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  clientOperationId: string;

  @Prop({ trim: true })
  paymentMethod?: string;

  @Prop({ trim: true })
  trackingNumber?: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({ required: true, index: true })
  occurredAt: Date;

  createdAt: Date;
}

export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);
LedgerEntrySchema.index({ seller: 1, occurredAt: -1 });
