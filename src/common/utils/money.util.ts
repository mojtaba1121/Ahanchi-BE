export function calculatePurchaseTotal(weightGrams: number, pricePerKgToman: number): number {
  if (!Number.isInteger(weightGrams) || weightGrams <= 0) throw new Error('weightGrams must be a positive integer');
  if (!Number.isInteger(pricePerKgToman) || pricePerKgToman < 0) throw new Error('pricePerKgToman must be a non-negative integer');
  return Math.round((weightGrams * pricePerKgToman) / 1000);
}
