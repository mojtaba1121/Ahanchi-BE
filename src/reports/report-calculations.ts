export interface BalanceRow {
  _id: { toString(): string };
  balanceToman: number;
}

export function mergeSellerBalances(
  purchaseBalances: BalanceRow[],
  financialBalances: BalanceRow[],
) {
  const result = new Map<string, number>();
  for (const row of purchaseBalances) {
    result.set(row._id.toString(), Number(row.balanceToman));
  }
  for (const row of financialBalances) {
    const id = row._id.toString();
    result.set(id, (result.get(id) ?? 0) + Number(row.balanceToman));
  }
  return result;
}
