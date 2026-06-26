export interface LedgerEntryResponse {
  id: string;
  transactionId: string | null;
  walletId: string;
  entryType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}
