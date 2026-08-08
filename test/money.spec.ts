import { describe, expect, it } from 'vitest';
import { calculatePurchaseTotal } from '../src/common/utils/money.util';

describe('calculatePurchaseTotal', () => {
  it('calculates integer kilograms', () => {
    expect(calculatePurchaseTotal(25_000, 18_000)).toBe(450_000);
  });

  it('calculates grams and rounds to the nearest toman', () => {
    expect(calculatePurchaseTotal(25_400, 18_000)).toBe(457_200);
    expect(calculatePurchaseTotal(1, 1_500)).toBe(2);
  });

  it('rejects invalid values', () => {
    expect(() => calculatePurchaseTotal(0, 10_000)).toThrow();
    expect(() => calculatePurchaseTotal(1000.5, 10_000)).toThrow();
    expect(() => calculatePurchaseTotal(1000, -1)).toThrow();
  });
});
