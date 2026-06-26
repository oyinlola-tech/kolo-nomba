export interface WalletResponse {
  id: string;
  ownerType: string;
  ownerId: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface BalanceResponse {
  balance: number;
  currency: string;
}
