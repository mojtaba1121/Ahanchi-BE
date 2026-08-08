import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthUser } from '../common/types/auth-user.type';
import { CreateSellerDto } from './dto/create-seller.dto';
import { Seller } from './schemas/seller.schema';

@Injectable()
export class SellersService {
  constructor(@InjectModel(Seller.name) private readonly sellers: Model<Seller>) {}

  async create(dto: CreateSellerDto, user: AuthUser) {
    const existing = await this.sellers.findOne({ createdBy: user.sub, clientId: dto.clientId }).lean();
    if (existing) return existing;
    return this.sellers.create({ ...dto, createdBy: new Types.ObjectId(user.sub) });
  }

  list(user: AuthUser, search?: string) {
    const filter: Record<string, unknown> = user.role === UserRole.REPRESENTATIVE ? { createdBy: user.sub } : {};
    if (search?.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ fullName: new RegExp(escaped, 'i') }, { phone: new RegExp(escaped) }];
    }
    return this.sellers.find(filter).sort({ updatedAt: -1 }).limit(200).lean();
  }

  async getForUser(id: string, user: AuthUser) {
    const filter: Record<string, unknown> = { _id: id };
    if (user.role === UserRole.REPRESENTATIVE) filter.createdBy = user.sub;
    const seller = await this.sellers.findOne(filter).lean();
    if (!seller) throw new NotFoundException('فروشنده پیدا نشد');
    return seller;
  }
}
