import { WithdrawalRepository } from "../repositories/withdrawal.repository";
import { WalletService } from "./wallet.service";
import { TransferService } from "./transfer.service";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import type { WithdrawalResponse } from "../dto/payout.dto";

export class WithdrawalService {
  private readonly withdrawalRepository: WithdrawalRepository;
  private readonly walletService: WalletService;
  private readonly transferService: TransferService;
  private readonly auditService: AuditService;

  constructor() {
    this.withdrawalRepository = new WithdrawalRepository();
    this.walletService = new WalletService();
    this.transferService = new TransferService();
    this.auditService = new AuditService();
  }

  async createWithdrawal(userId: string, walletId: string, amount: number, destination?: string): Promise<WithdrawalResponse> {
    const wallet = await this.walletService.getWallet(walletId);
    if (wallet.ownerId !== userId) {
      throw new AuthError("You do not own this wallet");
    }
    if (wallet.balance < amount) {
      throw new ValidationError("Insufficient wallet balance");
    }

    const withdrawal = await this.withdrawalRepository.create({
      userId,
      walletId,
      amount,
      destination,
    });

    try {
      await this.walletService.debit(walletId, amount, `Withdrawal: ${withdrawal.id}`);

      await this.transferService.initiateTransfer({
        amount,
        currency: "NGN",
        reference: `WD-${withdrawal.id.slice(0, 8)}`,
        destinationAccount: destination ?? "",
        destinationBank: "",
        accountName: "",
      });

      await this.withdrawalRepository.updateStatus(withdrawal.id, "COMPLETED");
    } catch {
      await this.walletService.credit(walletId, amount, `Withdrawal reversal: ${withdrawal.id}`);
      await this.withdrawalRepository.updateStatus(withdrawal.id, "FAILED");
      throw new Error("Withdrawal processing failed. Please try again.");
    }

    await this.auditService.log("WITHDRAWAL_COMPLETED", {
      userId,
      metadata: { withdrawalId: withdrawal.id, walletId, amount },
    });

    return this.getWithdrawalResponse(withdrawal.id);
  }

  async getWithdrawals(userId: string): Promise<WithdrawalResponse[]> {
    const withdrawals = await this.withdrawalRepository.findByUser(userId);
    return withdrawals.map(w => ({
      id: w.id,
      userId: w.userId,
      walletId: w.walletId,
      amount: w.amount,
      destination: w.destination,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
    }));
  }

  async getWithdrawal(id: string, userId: string): Promise<WithdrawalResponse> {
    const withdrawal = await this.withdrawalRepository.findById(id);
    if (!withdrawal) throw new AuthError("Withdrawal not found");
    if (withdrawal.userId !== userId) throw new AuthError("You do not own this withdrawal");
    return this.getWithdrawalResponse(id);
  }

  async approveWithdrawal(id: string, adminId: string): Promise<WithdrawalResponse> {
    const withdrawal = await this.withdrawalRepository.findById(id);
    if (!withdrawal) throw new AuthError("Withdrawal not found");
    if (withdrawal.status !== "PENDING") throw new ValidationError("Withdrawal is not pending");

    await this.withdrawalRepository.updateStatus(id, "PROCESSING");

    await this.auditService.log("WITHDRAWAL_APPROVED", {
      userId: adminId,
      metadata: { withdrawalId: id, amount: withdrawal.amount },
    });

    return this.getWithdrawalResponse(id);
  }

  async rejectWithdrawal(id: string, adminId: string): Promise<WithdrawalResponse> {
    const withdrawal = await this.withdrawalRepository.findById(id);
    if (!withdrawal) throw new AuthError("Withdrawal not found");
    if (withdrawal.status !== "PENDING") throw new ValidationError("Withdrawal is not pending");

    await this.withdrawalRepository.updateStatus(id, "CANCELLED");

    await this.auditService.log("WITHDRAWAL_REJECTED", {
      userId: adminId,
      metadata: { withdrawalId: id, amount: withdrawal.amount },
    });

    return this.getWithdrawalResponse(id);
  }

  private async getWithdrawalResponse(id: string): Promise<WithdrawalResponse> {
    const withdrawal = await this.withdrawalRepository.findById(id);
    if (!withdrawal) throw new AuthError("Withdrawal not found");
    return {
      id: withdrawal.id,
      userId: withdrawal.userId,
      walletId: withdrawal.walletId,
      amount: withdrawal.amount,
      destination: withdrawal.destination,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.toISOString(),
    };
  }
}
