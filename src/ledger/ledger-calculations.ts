import { LedgerType } from '../common/enums/ledger-type.enum';

export function signedLedgerAmount(type: LedgerType, amount: number) {
  return [LedgerType.PURCHASE, LedgerType.ADJUSTMENT_CREDIT].includes(type) ? amount : -amount;
}
