import { NombaClient } from "./nomba.client";

export interface NombaVirtualAccountRequest {
  accountRef: string;
  accountName: string;
  ownerType: "USER" | "GROUP" | "PLATFORM";
  ownerId: string;
  currency?: string;
  expectedAmount?: number;
  bvn?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NombaVirtualAccountResponse {
  providerReference: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  status: string;
}

export class NombaVirtualAccount {
  private readonly client = new NombaClient();

  async create(data: NombaVirtualAccountRequest): Promise<NombaVirtualAccountResponse> {
    const response = await this.client.request<NombaVirtualAccountResponse>({
      method: "POST",
      path: "/v1/accounts/virtual",
      body: {
        accountRef: data.accountRef,
        accountName: data.accountName,
        currency: data.currency ?? "NGN",
        expectedAmount: data.expectedAmount,
        bvn: data.bvn,
        callbackUrl: data.callbackUrl,
        meta: {
          ownerType: data.ownerType,
          ownerId: data.ownerId,
          ...(data.metadata ?? {}),
        },
      },
    });

    return {
      providerReference: response.data?.providerReference ?? data.accountRef,
      accountNumber: response.data?.accountNumber ?? "",
      accountName: response.data?.accountName ?? data.accountName,
      bankName: response.data?.bankName ?? "Nomba",
      status: response.data?.status ?? "ACTIVE",
    };
  }

  async get(accountNumber: string): Promise<NombaVirtualAccountResponse> {
    const response = await this.client.request<NombaVirtualAccountResponse>({
      method: "GET",
      path: `/v1/accounts/virtual/${accountNumber}`,
    });
    return {
      providerReference: response.data?.providerReference ?? "",
      accountNumber: response.data?.accountNumber ?? accountNumber,
      accountName: response.data?.accountName ?? "",
      bankName: response.data?.bankName ?? "Nomba",
      status: response.data?.status ?? "ACTIVE",
    };
  }

  async listTransactions(providerReference: string): Promise<Array<Record<string, unknown>>> {
    const response = await this.client.request<{ transactions?: Array<Record<string, unknown>> }>({
      method: "GET",
      path: `/v1/accounts/virtual/${providerReference}/transactions`,
    });
    return response.data?.transactions ?? [];
  }

  async deactivate(providerReference: string): Promise<void> {
    await this.client.request({
      method: "PATCH",
      path: `/v1/accounts/virtual/${providerReference}`,
      body: { expired: true },
    });
  }
}
