import { describe, expect, it } from 'vitest';
import { LedgerType } from '../src/common/enums/ledger-type.enum';
import { signedLedgerAmount } from '../src/ledger/ledger-calculations';

describe('signedLedgerAmount', () => {
  it('increases payable balance for purchases', () => {
    expect(signedLedgerAmount(LedgerType.PURCHASE, 500_000)).toBe(500_000);
  });

  it('decreases balance for payments and receipts', () => {
    expect(signedLedgerAmount(LedgerType.PAYMENT_TO_SELLER, 100_000)).toBe(-100_000);
    expect(signedLedgerAmount(LedgerType.RECEIPT_FROM_SELLER, 1_000)).toBe(-1_000);
  });
});
