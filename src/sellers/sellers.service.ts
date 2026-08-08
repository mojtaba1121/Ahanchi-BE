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
    const createdBy = new Types.ObjectId(user.sub);
    const filter = { createdBy, clientId: dto.clientId };
    const { clientId: _clientId, ...sellerDetails } = dto;

    try {
      return await this.sellers
        .findOneAndUpdate(
          filter,
          { $setOnInsert: sellerDetails },
          { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
        )
        .lean();
    } catch (error) {
      // Two offline-sync requests can race during an upsert. The unique index is
      // the source of truth, so return the winner instead of leaking a 500.
      if (this.isDuplicateKeyError(error)) {
        const existing = await this.sellers.findOne(filter).lean();
        if (existing) return existing;
      }
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
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

  async resolveForUser(id: string, clientId: string | undefined, user: AuthUser) {
    const byIdFilter: Record<string, unknown> = { _id: id };
    if (user.role === UserRole.REPRESENTATIVE) byIdFilter.createdBy = user.sub;
    const byId = await this.sellers.findOne(byIdFilter).lean();
    if (byId) return byId;

    if (clientId) {
      const byClientId = await this.sellers.findOne({
        createdBy: new Types.ObjectId(user.sub),
        clientId,
      }).lean();
      if (byClientId) return byClientId;
    }

    throw new NotFoundException('فروشنده پیدا نشد');
  }
}
