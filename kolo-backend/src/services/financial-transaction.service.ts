import { FinancialTransactionRepository } from "../repositories/financial-transaction.repository";
import { WalletService } from "./wallet.service";
import { AuthError } from "../errors/auth.error";
import { ForbiddenError } from "../errors/auth.error";
import type { FinancialTransactionResponse } from "../dto/financial-transaction.dto";
export class FinancialTransactionService {
  private readonly transactionRepository: FinancialTransactionRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.transactionRepository = new FinancialTransactionRepository();
    this.walletService = new WalletService();
  }

  async getTransaction(id: string, userId?: string): Promise<FinancialTransactionResponse> {
    const txn = await this.transactionRepository.findById(id);
    if (!txn) {
      throw new AuthError("Transaction not found");
    }
    if (userId) {
      let hasAccess = false;
      if (txn.sourceWalletId) {
        try {
          await this.walletService.getWallet(txn.sourceWalletId, userId);
          hasAccess = true;
        } catch {
          // not accessible via source wallet
        }
      }
      if (!hasAccess && txn.destinationWalletId) {
        try {
          await this.walletService.getWallet(txn.destinationWalletId, userId);
          hasAccess = true;
        } catch {
          // not accessible via destination wallet
        }
      }
      if (!hasAccess) {
        throw new ForbiddenError("You do not have access to this transaction");
      }
    }
    return this.mapTransaction(txn);
  }

  async getUserTransactions(userId: string): Promise<FinancialTransactionResponse[]> {
    const txns = await this.transactionRepository.findByUser(userId);
    return txns.map(this.mapTransaction);
  }

  async getWalletTransactions(walletId: string): Promise<FinancialTransactionResponse[]> {
    const txns = await this.transactionRepository.findByWallet(walletId);
    return txns.map(this.mapTransaction);
  }

  private mapTransaction(txn: {
    id: string; reference: string; type: string; amount: number;
    currency: string; status: string; sourceWalletId: string | null;
    destinationWalletId: string | null; createdAt: Date;
  }): FinancialTransactionResponse {
    return {
      id: txn.id,
      reference: txn.reference,
      type: txn.type,
      amount: txn.amount,
      currency: txn.currency,
      status: txn.status,
      sourceWalletId: txn.sourceWalletId,
      destinationWalletId: txn.destinationWalletId,
      createdAt: txn.createdAt.toISOString(),
    };
  }
}
