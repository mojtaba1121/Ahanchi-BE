import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMaterialDto } from './dto/create-material.dto';
import { Material } from './schemas/material.schema';

@Injectable()
export class MaterialsService {
  constructor(@InjectModel(Material.name) private readonly materials: Model<Material>) {}

  list(includeInactive = false) {
    return this.materials.find(includeInactive ? {} : { isActive: true }).sort({ sortOrder: 1, nameFa: 1 }).lean();
  }

  async create(dto: CreateMaterialDto) {
    if (await this.materials.exists({ code: dto.code })) throw new ConflictException('کد ماده قبلاً ثبت شده است');
    return this.materials.create(dto);
  }

  async setActive(id: string, isActive: boolean) {
    const material = await this.materials.findByIdAndUpdate(id, { isActive }, { new: true }).lean();
    if (!material) throw new NotFoundException('نوع ماده پیدا نشد');
    return material;
  }
}
