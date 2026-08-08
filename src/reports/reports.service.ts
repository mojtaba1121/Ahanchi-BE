import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Redis from 'ioredis';
import { LedgerEntry } from '../ledger/schemas/ledger-entry.schema';
import { Purchase } from '../purchases/schemas/purchase.schema';
import { REDIS } from '../redis/redis.module';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Purchase.name) private readonly purchases: Model<Purchase>,
    @InjectModel(LedgerEntry.name) private readonly ledger: Model<LedgerEntry>,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async dashboard(fromInput?: string, toInput?: string, representativeId?: string) {
    const to = toInput ? new Date(toInput) : new Date();
    const from = fromInput ? new Date(fromInput) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    const cacheKey = `reports:dashboard:${from.toISOString()}:${to.toISOString()}:${representativeId ?? 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as unknown;
    } catch {
      // Reporting must remain available if Redis is temporarily unavailable.
    }

    const purchaseMatch: Record<string, unknown> = { purchasedAt: { $gte: from, $lte: to } };
    if (representativeId) purchaseMatch.representative = new Types.ObjectId(representativeId);
    const ledgerMatch: Record<string, unknown> = {};
    if (representativeId) ledgerMatch.representative = new Types.ObjectId(representativeId);

    const [overviewRows, byMaterial, byDay, creditors, byRepresentative] = await Promise.all([
      this.purchases.aggregate([
        { $match: purchaseMatch },
        { $group: { _id: null, purchaseCount: { $sum: 1 }, totalWeightGrams: { $sum: '$weightGrams' }, totalAmountToman: { $sum: '$totalAmountToman' } } },
      ]),
      this.purchases.aggregate([
        { $match: purchaseMatch },
        { $group: { _id: '$material', purchaseCount: { $sum: 1 }, totalWeightGrams: { $sum: '$weightGrams' }, totalAmountToman: { $sum: '$totalAmountToman' } } },
        { $lookup: { from: 'materials', localField: '_id', foreignField: '_id', as: 'material' } },
        { $unwind: '$material' },
        { $set: { weightedAveragePricePerKgToman: { $cond: [{ $gt: ['$totalWeightGrams', 0] }, { $round: [{ $divide: [{ $multiply: ['$totalAmountToman', 1000] }, '$totalWeightGrams'] }, 0] }, 0] } } },
        { $project: { _id: 0, materialId: '$_id', code: '$material.code', nameFa: '$material.nameFa', color: '$material.color', purchaseCount: 1, totalWeightGrams: 1, totalAmountToman: 1, weightedAveragePricePerKgToman: 1 } },
        { $sort: { totalWeightGrams: -1 } },
      ]),
      this.purchases.aggregate([
        { $match: purchaseMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt', timezone: 'Asia/Tehran' } }, totalWeightGrams: { $sum: '$weightGrams' }, totalAmountToman: { $sum: '$totalAmountToman' }, purchaseCount: { $sum: 1 } } },
        { $project: { _id: 0, date: '$_id', totalWeightGrams: 1, totalAmountToman: 1, purchaseCount: 1 } },
        { $sort: { date: 1 } },
      ]),
      this.ledger.aggregate([
        { $match: ledgerMatch },
        { $group: { _id: '$seller', balanceToman: { $sum: '$signedAmountToman' } } },
        { $match: { balanceToman: { $ne: 0 } } },
        { $lookup: { from: 'sellers', localField: '_id', foreignField: '_id', as: 'seller' } },
        { $unwind: '$seller' },
        { $project: { _id: 0, sellerId: '$_id', fullName: '$seller.fullName', phone: '$seller.phone', balanceToman: 1 } },
        { $sort: { balanceToman: -1 } },
      ]),
      this.purchases.aggregate([
        { $match: purchaseMatch },
        { $group: { _id: '$representative', purchaseCount: { $sum: 1 }, totalWeightGrams: { $sum: '$weightGrams' }, totalAmountToman: { $sum: '$totalAmountToman' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'representative' } },
        { $unwind: '$representative' },
        { $project: { _id: 0, representativeId: '$_id', fullName: '$representative.fullName', city: '$representative.city', village: '$representative.village', purchaseCount: 1, totalWeightGrams: 1, totalAmountToman: 1 } },
        { $sort: { totalWeightGrams: -1 } },
      ]),
    ]);

    const overview = overviewRows[0] ?? { purchaseCount: 0, totalWeightGrams: 0, totalAmountToman: 0 };
    const totalPayableToman = creditors.reduce((sum, row) => sum + Math.max(0, Number(row.balanceToman)), 0);
    const totalReceivableToman = creditors.reduce((sum, row) => sum + Math.max(0, -Number(row.balanceToman)), 0);
    const result = {
      period: { from, to },
      overview: { ...overview, totalPayableToman, totalReceivableToman },
      byMaterial,
      dailyTrend: byDay,
      highestVolumeDay: [...byDay].sort((a, b) => Number(b.totalWeightGrams) - Number(a.totalWeightGrams))[0] ?? null,
      largestCreditor: creditors.find((row) => Number(row.balanceToman) > 0) ?? null,
      sellerBalances: creditors,
      byRepresentative,
    };
    try { await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60); } catch { /* optional cache */ }
    return result;
  }
}
