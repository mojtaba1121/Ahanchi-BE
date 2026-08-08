import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { calculatePurchaseTotal } from '../common/utils/money.util';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthUser } from '../common/types/auth-user.type';
import { LedgerService } from '../ledger/ledger.service';
import { Material } from '../materials/schemas/material.schema';
import { SellersService } from '../sellers/sellers.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Purchase } from './schemas/purchase.schema';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name) private readonly purchases: Model<Purchase>,
    @InjectModel(Material.name) private readonly materials: Model<Material>,
    private readonly sellers: SellersService,
    private readonly ledger: LedgerService,
  ) {}

  async create(dto: CreatePurchaseDto, user: AuthUser) {
    const existing = await this.purchases.findOne({ clientOperationId: dto.clientOperationId }).lean();
    if (existing) {
      await this.ledger.createPurchaseEntry({
        sellerId: existing.seller.toString(),
        representativeId: existing.representative.toString(),
        purchaseId: existing._id.toString(),
        amountToman: existing.totalAmountToman,
        occurredAt: existing.purchasedAt,
        clientOperationId: `purchase:${dto.clientOperationId}`,
      });
      return existing;
    }
    const [seller, material] = await Promise.all([
      this.sellers.getForUser(dto.sellerId, user),
      this.materials.findOne({ _id: dto.materialId, isActive: true }).lean(),
    ]);
    if (!material) throw new NotFoundException('نوع ماده پیدا نشد یا غیرفعال است');
    const totalAmountToman = calculatePurchaseTotal(dto.weightGrams, dto.pricePerKgToman);
    const purchasedAt = new Date(dto.purchasedAt);
    const purchase = await this.purchases.create({
      seller: new Types.ObjectId(dto.sellerId),
      material: new Types.ObjectId(dto.materialId),
      representative: new Types.ObjectId(user.sub),
      weightGrams: dto.weightGrams,
      pricePerKgToman: dto.pricePerKgToman,
      totalAmountToman,
      clientOperationId: dto.clientOperationId,
      purchasedAt,
      note: dto.note,
      city: seller.city,
      village: seller.village,
    });
    await this.ledger.createPurchaseEntry({
      sellerId: dto.sellerId,
      representativeId: user.sub,
      purchaseId: purchase.id,
      amountToman: totalAmountToman,
      occurredAt: purchasedAt,
      clientOperationId: `purchase:${dto.clientOperationId}`,
    });
    return purchase;
  }

  list(user: AuthUser, from?: string, to?: string, materialId?: string) {
    const filter: Record<string, unknown> = user.role === UserRole.REPRESENTATIVE ? { representative: user.sub } : {};
    if (materialId) filter.material = materialId;
    if (from || to) {
      const date: Record<string, Date> = {};
      if (from) date.$gte = new Date(from);
      if (to) date.$lte = new Date(to);
      filter.purchasedAt = date;
    }
    return this.purchases.find(filter)
      .populate('seller', 'fullName phone city village')
      .populate('material', 'code nameFa color')
      .populate('representative', 'fullName city village')
      .sort({ purchasedAt: -1 })
      .limit(500)
      .lean();
  }

  model() { return this.purchases; }
}
