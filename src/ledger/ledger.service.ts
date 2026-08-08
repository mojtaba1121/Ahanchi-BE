import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LedgerType } from '../common/enums/ledger-type.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthUser } from '../common/types/auth-user.type';
import { SellersService } from '../sellers/sellers.service';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { LedgerEntry } from './schemas/ledger-entry.schema';

@Injectable()
export class LedgerService {
  constructor(
    @InjectModel(LedgerEntry.name) private readonly entries: Model<LedgerEntry>,
    private readonly sellers: SellersService,
  ) {}

  async create(dto: CreateLedgerEntryDto, user: AuthUser) {
    if (dto.type === LedgerType.PURCHASE) throw new BadRequestException('سند خرید فقط توسط سیستم ایجاد می‌شود');
    if (user.role === UserRole.REPRESENTATIVE && [LedgerType.ADJUSTMENT_CREDIT, LedgerType.ADJUSTMENT_DEBIT].includes(dto.type)) {
      throw new ForbiddenException('ثبت سند تعدیل فقط برای مدیر مجاز است');
    }
    const seller = await this.sellers.resolveForUser(dto.sellerId, dto.sellerClientId, user);
    const existing = await this.entries.findOne({ clientOperationId: dto.clientOperationId }).lean();
    if (existing) return existing;
    const { sellerId: _sellerId, sellerClientId: _sellerClientId, ...entryDetails } = dto;
    return this.entries.create({
      ...entryDetails,
      seller: new Types.ObjectId(seller._id.toString()),
      representative: new Types.ObjectId(user.sub),
      occurredAt: new Date(dto.occurredAt),
      signedAmountToman: this.signed(dto.type, dto.amountToman),
    });
  }

  async createPurchaseEntry(input: { sellerId: string; representativeId: string; purchaseId: string; amountToman: number; occurredAt: Date; clientOperationId: string }) {
    return this.entries.findOneAndUpdate(
      { clientOperationId: input.clientOperationId },
      { $setOnInsert: {
        seller: new Types.ObjectId(input.sellerId),
        representative: new Types.ObjectId(input.representativeId),
        purchase: new Types.ObjectId(input.purchaseId),
        type: LedgerType.PURCHASE,
        amountToman: input.amountToman,
        signedAmountToman: input.amountToman,
        occurredAt: input.occurredAt,
        clientOperationId: input.clientOperationId,
      } },
      { upsert: true, new: true },
    ).lean();
  }

  async listForSeller(sellerId: string, user: AuthUser) {
    await this.sellers.getForUser(sellerId, user);
    return this.entries.find({ seller: sellerId }).sort({ occurredAt: -1 }).limit(500).lean();
  }

  async balance(sellerId: string, user: AuthUser) {
    await this.sellers.getForUser(sellerId, user);
    const [row] = await this.entries.aggregate<{ balanceToman: number }>([
      { $match: { seller: new Types.ObjectId(sellerId) } },
      { $group: { _id: null, balanceToman: { $sum: '$signedAmountToman' } } },
    ]);
    return { sellerId, balanceToman: row?.balanceToman ?? 0 };
  }

  model() { return this.entries; }

  private signed(type: LedgerType, amount: number) {
    return [LedgerType.PURCHASE, LedgerType.ADJUSTMENT_CREDIT].includes(type) ? amount : -amount;
  }
}
