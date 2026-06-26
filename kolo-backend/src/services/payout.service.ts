import { PayoutRepository } from "../repositories/payout.repository";
import { PayoutRecipientRepository } from "../repositories/payout-recipient.repository";
import { PayoutApprovalRepository } from "../repositories/payout-approval.repository";
import { PayoutScheduleRepository } from "../repositories/payout-schedule.repository";
import { PayoutRecipientAccountRepository } from "../repositories/payout-recipient-account.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { WalletService } from "./wallet.service";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import { ForbiddenError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import type { CreatePayoutDto, PayoutResponse, PayoutRecipientResponse, CreateScheduleDto, PayoutScheduleResponse, PayoutRecipientAccountDto, PayoutRecipientAccountResponse, TransferReceiptData } from "../dto/payout.dto";
import { QueueManager } from "../jobs/queue-manager";
import { Logger } from "../logger/core/logger";

export class PayoutService {
  private readonly payoutRepository: PayoutRepository;
  private readonly recipientRepository: PayoutRecipientRepository;
  private readonly approvalRepository: PayoutApprovalRepository;
  private readonly scheduleRepository: PayoutScheduleRepository;
  private readonly accountRepository: PayoutRecipientAccountRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly walletService: WalletService;
  private readonly auditService: AuditService;
  private readonly queueManager: QueueManager;
  private readonly logger: Logger;

  constructor() {
    this.payoutRepository = new PayoutRepository();
    this.recipientRepository = new PayoutRecipientRepository();
    this.approvalRepository = new PayoutApprovalRepository();
    this.scheduleRepository = new PayoutScheduleRepository();
    this.accountRepository = new PayoutRecipientAccountRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.walletService = new WalletService();
    this.auditService = new AuditService();
    this.queueManager = QueueManager.getInstance();
    this.logger = new Logger("payout-service");
  }

  async createPayout(dto: CreatePayoutDto, groupId: string, userId: string): Promise<PayoutResponse> {
    await this.validateAdminAccess(groupId, userId);

    const totalRecipientAmount = dto.recipients.reduce((sum, r) => sum + r.amount, 0);
    if (totalRecipientAmount !== dto.amount) {
      throw new ValidationError("Recipient amounts must equal the total payout amount");
    }

    const groupWallet = await this.walletService.getOrCreateWallet("GROUP", groupId);
    if (groupWallet.balance < dto.amount) {
      throw new ValidationError("Insufficient group wallet balance");
    }

    await this.validateNoDuplicateProcessing(groupId, dto.amount);

    const payout = await this.payoutRepository.create({
      groupId,
      requestedBy: userId,
      amount: dto.amount,
      currency: "NGN",
      type: dto.type ?? "MANUAL",
      reason: dto.reason,
    });

    for (const recipient of dto.recipients) {
      await this.recipientRepository.create({
        payoutId: payout.id,
        userId: recipient.userId,
        amount: recipient.amount,
        destinationAccount: recipient.destinationAccount,
        recipientAccountId: recipient.recipientAccountId,
      });
    }

    await this.auditService.log("PAYOUT_CREATED", {
      userId,
      metadata: { payoutId: payout.id, groupId, amount: dto.amount },
    });

    this.logger.info("Payout created", { payoutId: payout.id, groupId });
    return this.getPayoutResponse(payout.id);
  }

  async getPayouts(groupId: string, userId?: string): Promise<PayoutResponse[]> {
    if (userId) {
      await this.validateGroupAccess(groupId, userId);
    }
    const payouts = await this.payoutRepository.findByGroup(groupId);
    return payouts.map(p => this.buildPayoutResponse(p));
  }

  async getPayout(id: string, userId?: string): Promise<PayoutResponse> {
    if (userId) {
      const payout = await this.payoutRepository.findById(id);
      if (payout) {
        await this.validateGroupAccess(payout.groupId, userId);
      }
    }
    return this.getPayoutResponse(id);
  }

  async getUserPayouts(userId: string): Promise<PayoutResponse[]> {
    const payouts = await this.payoutRepository.findByUser(userId);
    return payouts.map(p => this.buildPayoutResponse(p));
  }

  async approvePayout(payoutId: string, userId: string, comment?: string): Promise<PayoutResponse> {
    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout) throw new AuthError("Payout not found");
    if (payout.status !== "PENDING") throw new ValidationError("Payout is not in pending status");

    await this.validateAdminAccess(payout.groupId, userId);

    await this.approvalRepository.create({
      payoutId,
      approverId: userId,
      decision: "APPROVED" as never,
      comment,
    });

    await this.payoutRepository.updateStatus(payoutId, "APPROVED", userId);

    await this.auditService.log("PAYOUT_APPROVED", {
      userId,
      metadata: { payoutId },
    });

    return this.getPayoutResponse(payoutId);
  }

  async rejectPayout(payoutId: string, userId: string, comment?: string): Promise<PayoutResponse> {
    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout) throw new AuthError("Payout not found");
    if (payout.status !== "PENDING") throw new ValidationError("Payout is not in pending status");

    await this.validateAdminAccess(payout.groupId, userId);

    await this.approvalRepository.create({
      payoutId,
      approverId: userId,
      decision: "REJECTED" as never,
      comment,
    });

    await this.payoutRepository.updateStatus(payoutId, "REJECTED");

    await this.auditService.log("PAYOUT_REJECTED", {
      userId,
      metadata: { payoutId },
    });

    return this.getPayoutResponse(payoutId);
  }

  async cancelPayout(payoutId: string, userId: string): Promise<PayoutResponse> {
    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout) throw new AuthError("Payout not found");
    if (payout.status !== "PENDING" && payout.status !== "APPROVED") {
      throw new ValidationError("Only pending or approved payouts can be cancelled");
    }

    await this.validateAdminAccess(payout.groupId, userId);

    await this.payoutRepository.updateStatus(payoutId, "CANCELLED");

    await this.auditService.log("PAYOUT_CANCELLED", {
      userId,
      metadata: { payoutId },
    });

    return this.getPayoutResponse(payoutId);
  }

  async processPayout(payoutId: string, userId: string): Promise<PayoutResponse> {
    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout) throw new AuthError("Payout not found");
    if (payout.status !== "APPROVED") throw new ValidationError("Payout must be approved first");

    await this.validateAdminAccess(payout.groupId, userId);

    const groupWallet = await this.walletService.getOrCreateWallet("GROUP", payout.groupId);
    if (groupWallet.balance < payout.amount) {
      throw new ValidationError("Insufficient group wallet balance");
    }

    await this.payoutRepository.updateStatus(payoutId, "PROCESSING");

    for (const recipient of payout.recipients) {
      await this.queueManager.addJob("payout.queue", "PROCESS_PAYOUT_TRANSFER", {
        recipientId: recipient.id,
        payoutId: payout.id,
        groupId: payout.groupId,
      });
    }

    await this.auditService.log("PAYOUT_PROCESSING", {
      userId,
      metadata: { payoutId, amount: payout.amount },
    });

    return this.getPayoutResponse(payoutId);
  }

  async retryFailedTransfer(recipientId: string, userId?: string): Promise<PayoutRecipientResponse> {
    const recipient = await this.recipientRepository.findById(recipientId);
    if (!recipient) throw new AuthError("Recipient not found");
    if (recipient.status !== "FAILED") throw new ValidationError("Recipient is not in failed status");
    if (recipient.retryCount >= 3) throw new ValidationError("Maximum retry attempts reached");
    if (userId) {
      const payout = await this.payoutRepository.findById(recipient.payoutId);
      if (payout) {
        await this.validateAdminAccess(payout.groupId, userId);
      }
    }

    await this.recipientRepository.incrementRetry(recipientId);

    await this.queueManager.addJob("payout.queue", "RETRY_FAILED_TRANSFER", {
      recipientId: recipient.id,
      payoutId: recipient.payoutId,
    });

    const updated = await this.recipientRepository.findById(recipientId);
    return this.buildRecipientResponse(updated!);
  }

  async createSchedule(dto: CreateScheduleDto, groupId: string, userId: string): Promise<PayoutScheduleResponse> {
    await this.validateAdminAccess(groupId, userId);

    const schedule = await this.scheduleRepository.create({
      groupId,
      type: dto.type,
      frequency: dto.frequency,
      amount: dto.amount,
      nextExecutionDate: new Date(dto.nextExecutionDate),
      dayOfMonth: dto.dayOfMonth,
      dayOfWeek: dto.dayOfWeek,
      customInterval: dto.customInterval,
      createdBy: userId,
    });

    await this.auditService.log("PAYOUT_SCHEDULE_CREATED", {
      userId,
      metadata: { scheduleId: schedule.id, groupId, type: dto.type },
    });

    return {
      id: schedule.id,
      groupId: schedule.groupId,
      type: schedule.type,
      frequency: schedule.frequency,
      amount: schedule.amount,
      nextExecutionDate: schedule.nextExecutionDate.toISOString(),
      lastExecutedAt: schedule.lastExecutedAt?.toISOString() ?? null,
      status: schedule.status,
      createdAt: schedule.createdAt.toISOString(),
    };
  }

  async getSchedules(groupId: string, userId?: string): Promise<PayoutScheduleResponse[]> {
    if (userId) {
      await this.validateGroupAccess(groupId, userId);
    }
    const schedules = await this.scheduleRepository.findByGroup(groupId);
    return schedules.map(s => ({
      id: s.id,
      groupId: s.groupId,
      type: s.type,
      frequency: s.frequency,
      amount: s.amount,
      nextExecutionDate: s.nextExecutionDate.toISOString(),
      lastExecutedAt: s.lastExecutedAt?.toISOString() ?? null,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async pauseSchedule(scheduleId: string, userId: string): Promise<PayoutScheduleResponse> {
    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule) throw new AuthError("Schedule not found");

    await this.validateAdminAccess(schedule.groupId, userId);

    const updated = await this.scheduleRepository.updateStatus(scheduleId, "PAUSED");
    return {
      id: updated.id,
      groupId: updated.groupId,
      type: updated.type,
      frequency: updated.frequency,
      amount: updated.amount,
      nextExecutionDate: updated.nextExecutionDate.toISOString(),
      lastExecutedAt: updated.lastExecutedAt?.toISOString() ?? null,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async createRecipientAccount(dto: PayoutRecipientAccountDto, userId: string): Promise<PayoutRecipientAccountResponse> {
    const account = await this.accountRepository.create({
      userId,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
    });

    return {
      id: account.id,
      userId: account.userId,
      bankName: account.bankName,
      accountNumber: `****${account.accountNumber.slice(-4)}`,
      accountName: account.accountName,
      provider: account.provider,
      verified: account.verified,
      createdAt: account.createdAt.toISOString(),
    };
  }

  async getUserRecipientAccounts(userId: string): Promise<PayoutRecipientAccountResponse[]> {
    const accounts = await this.accountRepository.findByUser(userId);
    return accounts.map(a => ({
      id: a.id,
      userId: a.userId,
      bankName: a.bankName,
      accountNumber: `****${a.accountNumber.slice(-4)}`,
      accountName: a.accountName,
      provider: a.provider,
      verified: a.verified,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  async generateTransferReceipt(recipientId: string, userId?: string): Promise<TransferReceiptData> {
    const recipient = await this.recipientRepository.findById(recipientId);
    if (!recipient) throw new AuthError("Recipient not found");
    if (userId) {
      const payout = await this.payoutRepository.findById(recipient.payoutId);
      if (payout) {
        await this.validateGroupAccess(payout.groupId, userId);
      }
    }

    const account = recipient.recipientAccount;
    const receiptNumber = `RCP-${recipient.payoutId.slice(0, 8).toUpperCase()}-${recipient.id.slice(0, 4).toUpperCase()}`;

    return {
      receiptNumber,
      recipientName: `${recipient.user.firstName} ${recipient.user.lastName}`,
      amount: recipient.amount,
      currency: "NGN",
      date: (recipient.processedAt ?? recipient.createdAt).toISOString(),
      bankName: account?.bankName ?? "N/A",
      accountNumber: account ? `****${account.accountNumber.slice(-4)}` : "N/A",
      transferReference: recipient.transferReference ?? recipient.providerReference ?? "N/A",
      providerReference: recipient.providerReference ?? "N/A",
      status: recipient.status,
      narration: `Payout from group savings`,
    };
  }

  private async validateGroupAccess(groupId: string, userId: string): Promise<void> {
    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
  }

  private async validateAdminAccess(groupId: string, userId: string): Promise<void> {
    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
    if (membership.role !== "GROUP_OWNER" && membership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Only group admins can perform this action");
    }
  }

  private async validateNoDuplicateProcessing(groupId: string, amount: number): Promise<void> {
    const pending = await this.payoutRepository.findPendingByGroup(groupId);
    const duplicate = pending.find(
      p => p.amount === amount && p.status === "PENDING",
    );
    if (duplicate) {
      throw new ValidationError("A similar payout is already pending for this group");
    }
  }

  private async getPayoutResponse(payoutId: string): Promise<PayoutResponse> {
    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout) throw new AuthError("Payout not found");
    return this.buildPayoutResponse(payout);
  }

  private buildPayoutResponse(payout: {
    id: string; groupId: string; requestedBy: string; amount: number;
    currency: string; type: string; status: string; reason: string | null;
    approvedBy: string | null; approvedAt: Date | null; processedAt: Date | null;
    createdAt: Date;
    recipients: Array<Record<string, unknown>>;
  }): PayoutResponse {
    return {
      id: payout.id,
      groupId: payout.groupId,
      requestedBy: payout.requestedBy,
      amount: payout.amount,
      currency: payout.currency,
      type: payout.type,
      status: payout.status,
      reason: payout.reason,
      approvedBy: payout.approvedBy,
      approvedAt: payout.approvedAt?.toISOString() ?? null,
      processedAt: payout.processedAt?.toISOString() ?? null,
      createdAt: payout.createdAt.toISOString(),
      recipients: payout.recipients.map(r => this.buildRecipientResponse(r as {
        id: string; userId: string; amount: number;
        destinationAccount: string | null; status: string;
        providerReference: string | null; transferReference: string | null;
        transferStatus: string | null; retryCount: number;
        failureReason: string | null; processedAt: Date | null;
      })),
    };
  }

  private buildRecipientResponse(r: {
    id: string; userId: string; amount: number;
    destinationAccount: string | null; status: string;
    providerReference: string | null; transferReference: string | null;
    transferStatus: string | null; retryCount: number;
    failureReason: string | null; processedAt: Date | null;
  }): PayoutRecipientResponse {
    return {
      id: r.id,
      userId: r.userId,
      amount: r.amount,
      destinationAccount: r.destinationAccount,
      status: r.status,
      providerReference: r.providerReference,
      transferReference: r.transferReference,
      transferStatus: r.transferStatus,
      retryCount: r.retryCount,
      failureReason: r.failureReason,
      processedAt: r.processedAt?.toISOString() ?? null,
    };
  }
}
