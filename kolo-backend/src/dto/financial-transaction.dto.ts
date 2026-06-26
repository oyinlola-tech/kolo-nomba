export interface FinancialTransactionResponse {
  id: string;
  reference: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  sourceWalletId: string | null;
  destinationWalletId: string | null;
  createdAt: string;
}
