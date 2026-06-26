import { NombaClient } from "./nomba.client";
import { NombaConfig } from "../../config/nomba.config";

export interface NombaVirtualAccountRequest {
  reference: string;
  accountName: string;
  ownerType: "USER" | "GROUP" | "PLATFORM";
  ownerId: string;
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
  private readonly config = new NombaConfig().runtime;

  async create(data: NombaVirtualAccountRequest): Promise<NombaVirtualAccountResponse> {
    const response = await this.client.request<NombaVirtualAccountResponse>({
      method: "POST",
      path: "/virtual-accounts",
      body: {
        reference: data.reference,
        accountName: data.accountName,
        subAccountId: this.config.subAccountId,
        metadata: {
          ownerType: data.ownerType,
          ownerId: data.ownerId,
          ...(data.metadata ?? {}),
        },
      },
    });

    return {
      providerReference: response.data?.providerReference ?? data.reference,
      accountNumber: response.data?.accountNumber ?? "",
      accountName: response.data?.accountName ?? data.accountName,
      bankName: response.data?.bankName ?? "Nomba",
      status: response.data?.status ?? "ACTIVE",
    };
  }

  async get(providerReference: string): Promise<NombaVirtualAccountResponse> {
    const response = await this.client.request<NombaVirtualAccountResponse>({
      method: "GET",
      path: `/virtual-accounts/${providerReference}`,
    });
    return {
      providerReference: response.data?.providerReference ?? providerReference,
      accountNumber: response.data?.accountNumber ?? "",
      accountName: response.data?.accountName ?? "",
      bankName: response.data?.bankName ?? "Nomba",
      status: response.data?.status ?? "ACTIVE",
    };
  }

  async listTransactions(providerReference: string): Promise<Array<Record<string, unknown>>> {
    const response = await this.client.request<{ transactions?: Array<Record<string, unknown>> }>({
      method: "GET",
      path: `/virtual-accounts/${providerReference}/transactions`,
    });
    return response.data?.transactions ?? [];
  }

  async deactivate(providerReference: string): Promise<void> {
    await this.client.request({
      method: "PATCH",
      path: `/virtual-accounts/${providerReference}/deactivate`,
    });
  }
}
