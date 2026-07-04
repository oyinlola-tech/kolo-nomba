import { WithdrawalRepository } from "../repositories/withdrawal.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { WalletService } from "./wallet.service";
import { TransferService } from "./transfer.service";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import type { WithdrawalResponse } from "../dto/payout.dto";

export class WithdrawalService {
  private readonly withdrawalRepository: WithdrawalRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly walletService: WalletService;
  private readonly transferService: TransferService;
  private readonly auditService: AuditService;

  constructor() {
    this.withdrawalRepository = new WithdrawalRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.walletService = new WalletService();
    this.transferService = new TransferService();
    this.auditService = new AuditService();
  }

  async createWithdrawal(
    userId: string,
    groupId: string,
    amount: number,
    destination?: string,
    destinationBank?: string,
    accountName?: string,
  ): Promise<WithdrawalResponse> {
    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership) {
      throw new AuthError("You are not a member of this group");
    }

    const wallet = await this.walletService.getOrCreateWallet("GROUP", groupId);
    if (wallet.balance < amount) {
      throw new ValidationError("Insufficient group wallet balance");
    }

    const withdrawal = await this.withdrawalRepository.create({
      userId,
      walletId: wallet.id,
      amount,
      destination,
      destinationBank,
      accountName,
    });

    await this.auditService.log("WITHDRAWAL_REQUESTED", {
      userId,
      metadata: { withdrawalId: withdrawal.id, walletId: wallet.id, amount },
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
      destinationBank: (w as { destinationBank?: string | null }).destinationBank ?? null,
      accountName: (w as { accountName?: string | null }).accountName ?? null,
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

    try {
      await this.walletService.debit(withdrawal.walletId, withdrawal.amount, `Withdrawal: ${withdrawal.id}`);

      const result = await this.transferService.initiateTransfer({
        amount: withdrawal.amount,
        currency: "NGN",
        reference: `WD-${withdrawal.id.slice(0, 8)}`,
        destinationAccount: withdrawal.destination ?? "",
        destinationBank: (withdrawal as { destinationBank?: string | null }).destinationBank ?? "",
        accountName: (withdrawal as { accountName?: string | null }).accountName ?? "",
      });

      await this.withdrawalRepository.updateStatus(id, result.status === "SUCCESSFUL" ? "COMPLETED" : "FAILED");

      if (result.status !== "SUCCESSFUL") {
        await this.walletService.credit(withdrawal.walletId, withdrawal.amount, `Withdrawal reversal: ${withdrawal.id}`);
      }
    } catch (error) {
      await this.walletService.credit(withdrawal.walletId, withdrawal.amount, `Withdrawal reversal: ${withdrawal.id}`);
      await this.withdrawalRepository.updateStatus(id, "FAILED");
    }

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
      destinationBank: (withdrawal as { destinationBank?: string | null }).destinationBank ?? null,
      accountName: (withdrawal as { accountName?: string | null }).accountName ?? null,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.toISOString(),
    };
  }
}
