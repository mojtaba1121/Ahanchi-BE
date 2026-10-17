import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LedgerType } from '../common/enums/ledger-type.enum';
import { LedgerEntry } from '../ledger/schemas/ledger-entry.schema';
import { Purchase } from '../purchases/schemas/purchase.schema';
import { Seller } from '../sellers/schemas/seller.schema';
import { mergeSellerBalances } from './report-calculations';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Purchase.name) private readonly purchases: Model<Purchase>,
    @InjectModel(LedgerEntry.name) private readonly ledger: Model<LedgerEntry>,
    @InjectModel(Seller.name) private readonly sellers: Model<Seller>,
  ) {}

  async dashboard(fromInput?: string, toInput?: string, representativeId?: string) {
    const to = toInput ? new Date(toInput) : new Date();
    const from = fromInput ? new Date(fromInput) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    const purchaseMatch: Record<string, unknown> = { purchasedAt: { $gte: from, $lte: to } };
    if (representativeId) purchaseMatch.representative = new Types.ObjectId(representativeId);
    const allPurchaseMatch: Record<string, unknown> = {};
    if (representativeId) allPurchaseMatch.representative = new Types.ObjectId(representativeId);
    const ledgerMatch: Record<string, unknown> = {};
    if (representativeId) ledgerMatch.representative = new Types.ObjectId(representativeId);
    const sellerMatch: Record<string, unknown> = { isActive: true };
    if (representativeId) sellerMatch.createdBy = new Types.ObjectId(representativeId);

    const [overviewRows, byMaterial, byDay, purchaseBalances, financialBalances, byRepresentative, sellersByCity, financialRows] = await Promise.all([
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
      this.purchases.aggregate<{ _id: Types.ObjectId; balanceToman: number }>([
        { $match: allPurchaseMatch },
        { $group: { _id: '$seller', balanceToman: { $sum: '$totalAmountToman' } } },
      ]),
      this.ledger.aggregate<{ _id: Types.ObjectId; balanceToman: number }>([
        { $match: { ...ledgerMatch, type: { $ne: LedgerType.PURCHASE } } },
        { $group: { _id: '$seller', balanceToman: { $sum: '$signedAmountToman' } } },
      ]),
      this.purchases.aggregate([
        { $match: purchaseMatch },
        { $group: { _id: '$representative', purchaseCount: { $sum: 1 }, totalWeightGrams: { $sum: '$weightGrams' }, totalAmountToman: { $sum: '$totalAmountToman' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'representative' } },
        { $unwind: '$representative' },
        { $project: { _id: 0, representativeId: '$_id', fullName: '$representative.fullName', city: '$representative.city', village: '$representative.village', purchaseCount: 1, totalWeightGrams: 1, totalAmountToman: 1 } },
        { $sort: { totalWeightGrams: -1 } },
      ]),
      this.sellers.aggregate<{ _id: string | null; sellerCount: number }>([
        { $match: sellerMatch },
        { $group: { _id: '$city', sellerCount: { $sum: 1 } } },
        { $sort: { sellerCount: -1, _id: 1 } },
      ]),
      this.ledger.aggregate<{ _id: LedgerType; operationCount: number; totalAmountToman: number }>([
        { $match: { ...ledgerMatch, type: { $ne: LedgerType.PURCHASE } } },
        { $group: { _id: '$type', operationCount: { $sum: 1 }, totalAmountToman: { $sum: '$amountToman' } } },
      ]),
    ]);

    const balanceBySeller = mergeSellerBalances(purchaseBalances, financialBalances);
    const sellerIds = [...balanceBySeller.keys()].map((id) => new Types.ObjectId(id));
    const balanceSellers = sellerIds.length === 0
      ? []
      : await this.sellers.find({ _id: { $in: sellerIds } }).select('fullName phone city village').lean();
    const creditors = balanceSellers
      .map((seller) => ({
        sellerId: seller._id.toString(),
        fullName: seller.fullName,
        phone: seller.phone,
        city: seller.city,
        village: seller.village,
        balanceToman: balanceBySeller.get(seller._id.toString()) ?? 0,
      }))
      .filter((row) => row.balanceToman !== 0)
      .sort((a, b) => b.balanceToman - a.balanceToman);

    const overview = overviewRows[0] ?? { purchaseCount: 0, totalWeightGrams: 0, totalAmountToman: 0 };
    const totalPayableToman = creditors.reduce((sum, row) => sum + Math.max(0, Number(row.balanceToman)), 0);
    const totalReceivableToman = creditors.reduce((sum, row) => sum + Math.max(0, -Number(row.balanceToman)), 0);
    const sellerCount = sellersByCity.reduce((sum, row) => sum + Number(row.sellerCount), 0);
    const financialSummary = {
      operationCount: financialRows.reduce((sum, row) => sum + Number(row.operationCount), 0),
      paymentToSellersToman: financialRows.find((row) => row._id === LedgerType.PAYMENT_TO_SELLER)?.totalAmountToman ?? 0,
      receiptFromSellersToman: financialRows.find((row) => row._id === LedgerType.RECEIPT_FROM_SELLER)?.totalAmountToman ?? 0,
    };
    const result = {
      period: { from, to },
      overview: { ...overview, totalPayableToman, totalReceivableToman },
      byMaterial,
      dailyTrend: byDay,
      highestVolumeDay: [...byDay].sort((a, b) => Number(b.totalWeightGrams) - Number(a.totalWeightGrams))[0] ?? null,
      largestCreditor: creditors.find((row) => Number(row.balanceToman) > 0) ?? null,
      sellerBalances: creditors,
      byRepresentative,
      sellers: {
        total: sellerCount,
        cityCount: sellersByCity.filter((row) => row._id?.trim()).length,
        byCity: sellersByCity.map((row) => ({ city: row._id?.trim() || 'نامشخص', sellerCount: row.sellerCount })),
      },
      financialSummary,
    };
    return result;
  }
}
