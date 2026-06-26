export interface IPaymentProvider {
  initiatePayment(data: Record<string, unknown>): Promise<Record<string, unknown>>;
  verifyPayment(reference: string): Promise<Record<string, unknown>>;
}
