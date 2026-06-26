import { NombaClient } from "./nomba.client";
import { Logger } from "../../logger/core/logger";
import { NombaConfig } from "../../config/nomba.config";

export interface TransferRequest {
  amount: number;
  currency: string;
  reference: string;
  destinationAccount: string;
  destinationBank: string;
  accountName: string;
  narration?: string;
}

export interface TransferResponse {
  reference: string;
  providerReference: string;
  status: string;
  amount: number;
  fee: number;
}

export interface TransferStatusResponse {
  reference: string;
  providerReference: string;
  status: string;
  amount: number;
  fee: number;
  failureReason?: string;
}

export class NombaTransfer {
  private readonly client: NombaClient;
  private readonly logger: Logger;
  private readonly config = new NombaConfig().runtime;

  constructor() {
    this.client = new NombaClient();
    this.logger = new Logger("nomba-transfer");
  }

  async createTransfer(data: TransferRequest): Promise<TransferResponse> {
    try {
      this.logger.info("Initiating transfer", { reference: data.reference, amount: data.amount });

      const response = await this.client.request<{
        reference: string;
        providerReference: string;
        status: string;
        amount: number;
        fee: number;
      }>({
        method: "POST",
        path: "/transfers/send",
        body: {
          amount: data.amount,
          currency: data.currency,
          reference: data.reference,
          subAccountId: this.config.subAccountId,
          destination: {
            accountNumber: data.destinationAccount,
            bankCode: data.destinationBank,
            accountName: data.accountName,
          },
          narration: data.narration ?? "Payout from Kolo",
        },
      });

      this.logger.info("Transfer initiated successfully", { reference: data.reference });

      return {
        reference: response.data?.reference ?? data.reference,
        providerReference: response.data?.providerReference ?? "",
        status: response.data?.status ?? "PROCESSING",
        amount: response.data?.amount ?? data.amount,
        fee: response.data?.fee ?? 0,
      };
    } catch (error) {
      this.logger.error("Transfer initiation failed", {
        reference: data.reference,
        error: String(error),
      });
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async checkTransferStatus(reference: string): Promise<TransferStatusResponse> {
    try {
      const response = await this.client.request<{
        reference: string;
        providerReference: string;
        status: string;
        amount: number;
        fee: number;
        failureReason?: string;
      }>({
        method: "GET",
        path: `/transfers/${reference}/status`,
      });

      return {
        reference: response.data?.reference ?? reference,
        providerReference: response.data?.providerReference ?? "",
        status: response.data?.status ?? "FAILED",
        amount: response.data?.amount ?? 0,
        fee: response.data?.fee ?? 0,
        failureReason: response.data?.failureReason,
      };
    } catch (error) {
      this.logger.error("Transfer status check failed", {
        reference,
        error: String(error),
      });
      return {
        reference,
        providerReference: "",
        status: "FAILED",
        amount: 0,
        fee: 0,
        failureReason: String(error),
      };
    }
  }

  async verifyTransfer(reference: string): Promise<{ verified: boolean; status: string }> {
    try {
      const status = await this.checkTransferStatus(reference);
      return {
        verified: status.status === "SUCCESSFUL",
        status: status.status,
      };
    } catch (error) {
      this.logger.error("Transfer verification failed", {
        reference,
        error: String(error),
      });
      return { verified: false, status: "FAILED" };
    }
  }
}
