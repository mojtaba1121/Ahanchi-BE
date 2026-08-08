import { describe, expect, it } from 'vitest';
import { mergeSellerBalances } from '../src/reports/report-calculations';

describe('mergeSellerBalances', () => {
  it('uses purchases as the payable source and applies financial operations per seller', () => {
    const balances = mergeSellerBalances(
      [
        { _id: 'seller-1', balanceToman: 100_000 },
        { _id: 'seller-2', balanceToman: 500_000 },
      ],
      [{ _id: 'seller-2', balanceToman: -1_000 }],
    );

    expect(balances.get('seller-1')).toBe(100_000);
    expect(balances.get('seller-2')).toBe(499_000);
    expect([...balances.entries()].sort((a, b) => b[1] - a[1])[0]).toEqual(['seller-2', 499_000]);
  });

  it('keeps financial-only sellers in the report', () => {
    const balances = mergeSellerBalances([], [{ _id: 'seller-3', balanceToman: -25_000 }]);
    expect(balances.get('seller-3')).toBe(-25_000);
  });
});
