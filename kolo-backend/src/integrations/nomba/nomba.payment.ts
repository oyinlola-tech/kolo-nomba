import { NombaClient } from "./nomba.client";
import { NombaConfig } from "../../config/nomba.config";

export class NombaPayment {
  private readonly client: NombaClient;
  private readonly config = new NombaConfig().runtime;

  constructor() {
    this.client = new NombaClient();
  }

  private get checkoutBasePath(): string {
    return this.config.environment === "test" ? "/sandbox/checkout" : "/v1/checkout";
  }

  async initiatePayment(data: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerName: string;
    callbackUrl?: string;
  }): Promise<{ reference: string; checkoutUrl: string | null }> {
    const response = await this.client.request<{
      orderReference: string;
      checkoutLink: string;
    }>({
      method: "POST",
      path: `${this.checkoutBasePath}/order`,
      body: {
        order: {
          amount: data.amount,
          currency: data.currency,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          orderReference: data.reference,
        },
        callbackUrl: data.callbackUrl,
        meta: {
          internalReference: data.reference,
        },
      },
    });

    return {
      reference: response.data?.orderReference ?? data.reference,
      checkoutUrl: response.data?.checkoutLink ?? null,
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
      path: `${this.checkoutBasePath}/transaction`,
      query: { orderReference: reference },
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
      orderReference: string;
      status: string;
      amount: number;
      providerReference: string;
      paidAt?: string;
    }>({
      method: "GET",
      path: `${this.checkoutBasePath}/transaction`,
      query: { orderReference: reference },
    });

    return {
      reference: response.data?.orderReference ?? reference,
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

  async verifyTransaction(orderReference: string): Promise<{
    verified: boolean;
    status: string;
    amount: number;
  }> {
    try {
      const result = await this.lookupTransaction(orderReference);
      return {
        verified: result.status === "SUCCESSFUL",
        status: result.status,
        amount: result.amount,
      };
    } catch {
      return { verified: false, status: "FAILED", amount: 0 };
    }
  }
}
