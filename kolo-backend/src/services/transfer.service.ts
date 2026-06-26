import { NombaTransfer } from "../integrations/nomba/nomba.transfer";
import { Logger } from "../logger/core/logger";

export interface TransferInput {
  amount: number;
  currency: string;
  reference: string;
  destinationAccount: string;
  destinationBank: string;
  accountName: string;
  narration?: string;
}

export class TransferService {
  private readonly nombaTransfer: NombaTransfer;
  private readonly logger: Logger;

  constructor() {
    this.nombaTransfer = new NombaTransfer();
    this.logger = new Logger("transfer-service");
  }

  async initiateTransfer(data: TransferInput): Promise<{ reference: string; providerReference: string; status: string; fee: number }> {
    try {
      this.logger.info("Initiating transfer", { reference: data.reference, amount: data.amount });

      const result = await this.nombaTransfer.createTransfer({
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        destinationAccount: data.destinationAccount,
        destinationBank: data.destinationBank,
        accountName: data.accountName,
        narration: data.narration,
      });

      this.logger.info("Transfer initiated successfully", {
        reference: result.reference,
        providerReference: result.providerReference,
        status: result.status,
      });

      return {
        reference: result.reference,
        providerReference: result.providerReference,
        status: result.status,
        fee: result.fee,
      };
    } catch (error) {
      this.logger.error("Transfer initiation failed", {
        reference: data.reference,
        error: String(error),
      });
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : "Please try again."}`);
    }
  }

  async checkTransferStatus(reference: string): Promise<{ status: string; providerReference: string; failureReason?: string }> {
    try {
      const result = await this.nombaTransfer.checkTransferStatus(reference);
      return {
        status: result.status,
        providerReference: result.providerReference,
        failureReason: result.failureReason,
      };
    } catch (error) {
      this.logger.error("Transfer status check failed", { reference, error: String(error) });
      return { status: "FAILED", providerReference: "", failureReason: String(error) };
    }
  }

  async verifyTransfer(reference: string): Promise<boolean> {
    const result = await this.nombaTransfer.verifyTransfer(reference);
    return result.verified;
  }
}
