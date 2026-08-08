import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

@Schema({ timestamps: true, versionKey: false })
export class Material {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  nameFa: string;

  @Prop({ trim: true })
  nameEn?: string;

  @Prop({ default: '#607D8B' })
  color: string;

  @Prop({ default: 'kg', enum: ['kg'] })
  unit: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
