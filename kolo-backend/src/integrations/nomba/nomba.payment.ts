import { NombaClient } from "./nomba.client";
import { NombaConfig } from "../../config/nomba.config";

export class NombaPayment {
  private readonly client: NombaClient;
  private readonly config = new NombaConfig().runtime;

  constructor() {
    this.client = new NombaClient();
  }

  async initiatePayment(data: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerName: string;
    paymentMethod: string;
  }): Promise<{ reference: string; paymentUrl: string | null }> {
    const response = await this.client.request<{
      reference: string;
      paymentUrl: string;
    }>({
      method: "POST",
      path: "/payments/initiate",
      body: {
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        subAccountId: this.config.subAccountId,
        customer: {
          email: data.customerEmail,
          name: data.customerName,
        },
        paymentMethod: data.paymentMethod,
      },
    });

    return {
      reference: response.data?.reference ?? data.reference,
      paymentUrl: response.data?.paymentUrl ?? null,
    };
  }

  async verifyPayment(reference: string): Promise<{
    status: string;
    amount: number;
    providerReference: string;
  }> {
    const response = await this.client.request<{
      status: string;
      amount: number;
      providerReference: string;
    }>({
      method: "GET",
      path: `/payments/verify/${reference}`,
    });

    return {
      status: response.data?.status ?? "FAILED",
      amount: response.data?.amount ?? 0,
      providerReference: response.data?.providerReference ?? "",
    };
  }

  async lookupTransaction(reference: string): Promise<{
    reference: string;
    status: string;
    amount: number;
    providerReference: string;
    paidAt?: string;
  }> {
    const response = await this.client.request<{
      reference: string;
      status: string;
      amount: number;
      providerReference: string;
      paidAt?: string;
    }>({
      method: "GET",
      path: `/transactions/${reference}`,
    });

    return {
      reference: response.data?.reference ?? reference,
      status: response.data?.status ?? "FAILED",
      amount: response.data?.amount ?? 0,
      providerReference: response.data?.providerReference ?? reference,
      paidAt: response.data?.paidAt,
    };
  }

  async listTransactions(query?: { from?: string; to?: string; page?: number; limit?: number }) {
    const response = await this.client.request<{ transactions?: Array<Record<string, unknown>> }>({
      method: "GET",
      path: "/transactions",
      query,
    });
    return response.data?.transactions ?? [];
  }
}
