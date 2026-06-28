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

export interface InitiatePaymentResult {
  paymentId: string;
  reference: string;
  paymentUrl: string | null;
}

export interface WebhookPayload {
  eventType: string;
  payload: Record<string, unknown>;
}
