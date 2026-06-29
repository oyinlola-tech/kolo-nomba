export interface InitiatePaymentDto {
  contributionId: string;
  amount?: number;
  paymentMethod: string;
}

export interface PaymentResponse {
  id: string;
  userId: string;
  groupId: string;
  contributionId: string | null;
  transactionId: string | null;
  amount: number;
  currency: string;
  provider: string;
  providerReference: string | null;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
}

export interface VirtualAccountInfo {
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
}

export interface InitiatePaymentResult {
  paymentId: string;
  reference: string;
  checkoutUrl: string | null;
  virtualAccount?: VirtualAccountInfo | null;
}

export interface WebhookPayload {
  eventType: string;
  payload: Record<string, unknown>;
}
