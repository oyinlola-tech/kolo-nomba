import { PrismaDatabase } from "../database/prisma";
import { WalletRepository } from "../repositories/wallet.repository";
import { LedgerEntryRepository } from "../repositories/ledger-entry.repository";
import { FinancialTransactionRepository } from "../repositories/financial-transaction.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { FeeEngineService } from "./fee-engine.service";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import { ForbiddenError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import type { WalletResponse, BalanceResponse } from "../dto/wallet.dto";
import { Logger } from "../logger/core/logger";

export class WalletService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerEntryRepository: LedgerEntryRepository;
  private readonly financialTransactionRepository: FinancialTransactionRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly feeEngine: FeeEngineService;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerEntryRepository = new LedgerEntryRepository();
    this.financialTransactionRepository = new FinancialTransactionRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.feeEngine = new FeeEngineService();
    this.auditService = new AuditService();
    this.logger = new Logger("wallet-service");
  }

  async getOrCreateWallet(ownerType: string, ownerId: string, currency = "NGN"): Promise<WalletResponse> {
    let wallet = await this.walletRepository.findByOwner(ownerType, ownerId);
    if (!wallet) {
      wallet = await this.walletRepository.create({ ownerType, ownerId, currency });
      await this.auditService.log("WALLET_CREATED", {
        metadata: { walletId: wallet.id, ownerType, ownerId },
      });
      this.logger.info("Wallet created", { walletId: wallet.id, ownerType, ownerId });
    }
    return this.mapWallet(wallet);
  }

  async getWallet(id: string, userId?: string): Promise<WalletResponse> {
    const wallet = await this.walletRepository.findById(id);
    if (!wallet) {
      throw new AuthError("Wallet not found");
    }
    if (userId) {
      await this.assertWalletAccess(wallet, userId);
    }
    return this.mapWallet(wallet);
  }

  async getBalance(id: string, userId?: string): Promise<BalanceResponse> {
    const wallet = await this.walletRepository.findById(id);
    if (!wallet) {
      throw new AuthError("Wallet not found");
    }
    if (userId) {
      await this.assertWalletAccess(wallet, userId);
    }
    return { balance: wallet.balance, currency: wallet.currency };
  }

  async credit(walletId: string, amount: number, description?: string, transactionId?: string): Promise<void> {
    const prisma = PrismaDatabase.getInstance().getClient();
    let balanceBefore = 0;
    let balanceAfter = 0;
    await prisma.$transaction(async (tx) => {
      const wallet = await this.walletRepository.findById(walletId, tx);
      if (!wallet) {
        throw new AuthError("Wallet not found");
      }
      if (wallet.status !== "ACTIVE") {
        throw new ValidationError("Wallet is not active");
      }

      balanceBefore = wallet.balance;

      await this.walletRepository.incrementBalance(walletId, amount, tx);

      const updated = await this.walletRepository.findById(walletId, tx);
      balanceAfter = updated!.balance;

      await this.ledgerEntryRepository.create({
        transactionId,
        walletId,
        entryType: "CREDIT",
        amount,
        direction: "IN",
        balanceBefore,
        balanceAfter,
        description,
      }, tx);
    });

    await this.auditService.log("WALLET_CREDITED", {
      metadata: { walletId, amount, balanceBefore, balanceAfter },
    });
  }

  async debit(walletId: string, amount: number, description?: string, transactionId?: string): Promise<void> {
    const prisma = PrismaDatabase.getInstance().getClient();
    let balanceBefore = 0;
    let balanceAfter = 0;
    await prisma.$transaction(async (tx) => {
      const wallet = await this.walletRepository.findById(walletId, tx);
      if (!wallet) {
        throw new AuthError("Wallet not found");
      }
      if (wallet.status !== "ACTIVE") {
        throw new ValidationError("Wallet is not active");
      }

      const result = await this.walletRepository.decrementBalance(walletId, amount, tx);
      if (result.count === 0) {
        throw new ValidationError("Insufficient balance");
      }

      const updated = await this.walletRepository.findById(walletId, tx);
      balanceBefore = wallet.balance;
      balanceAfter = updated!.balance;

      await this.ledgerEntryRepository.create({
        transactionId,
        walletId,
        entryType: "DEBIT",
        amount,
        direction: "OUT",
        balanceBefore,
        balanceAfter,
        description,
      }, tx);
    });

    await this.auditService.log("WALLET_DEBITED", {
      metadata: { walletId, amount, balanceBefore, balanceAfter },
    });
  }

  async transfer(
    sourceWalletId: string,
    destinationWalletId: string,
    amount: number,
    description?: string,
    userId?: string,
  ): Promise<void> {
    if (sourceWalletId === destinationWalletId) {
      throw new ValidationError("Cannot transfer to the same wallet");
    }

    const prisma = PrismaDatabase.getInstance().getClient();
    const transaction = await prisma.$transaction(async (tx) => {
      const sourceWallet = await this.walletRepository.findById(sourceWalletId, tx);
      if (!sourceWallet) throw new AuthError("Source wallet not found");
      if (userId) {
        await this.assertWalletAccess(sourceWallet, userId);
        if (sourceWallet.ownerType === "GROUP") {
          await this.assertGroupAdmin(sourceWallet.ownerId, userId);
        }
      }

      const result = await this.walletRepository.decrementBalance(sourceWalletId, amount, tx);
      if (result.count === 0) {
        throw new ValidationError("Insufficient balance");
      }

      const destWallet = await this.walletRepository.findById(destinationWalletId, tx);
      if (!destWallet) throw new AuthError("Destination wallet not found");

      const ft = await this.financialTransactionRepository.create({
        type: "TRANSFER",
        amount,
        currency: sourceWallet.currency,
        status: "SUCCESSFUL",
        sourceWalletId,
        destinationWalletId,
        metadata: { description },
      }, tx);

      const updatedSource = await this.walletRepository.findById(sourceWalletId, tx);

      await this.ledgerEntryRepository.create({
        transactionId: ft.id,
        walletId: sourceWalletId,
        entryType: "DEBIT",
        amount,
        direction: "OUT",
        balanceBefore: sourceWallet.balance,
        balanceAfter: updatedSource!.balance,
        description: description ?? "Transfer out",
      }, tx);

      await this.walletRepository.incrementBalance(destinationWalletId, amount, tx);

      const updatedDest = await this.walletRepository.findById(destinationWalletId, tx);

      await this.ledgerEntryRepository.create({
        transactionId: ft.id,
        walletId: destinationWalletId,
        entryType: "CREDIT",
        amount,
        direction: "IN",
        balanceBefore: destWallet.balance,
        balanceAfter: updatedDest!.balance,
        description: description ?? "Transfer in",
      }, tx);

      return ft;
    });

    await this.auditService.log("TRANSFER_COMPLETED", {
      metadata: {
        sourceWalletId,
        destinationWalletId,
        amount,
        transactionId: transaction.id,
      },
    });

    this.logger.info("Transfer completed", { sourceWalletId, destinationWalletId, amount });
  }

  async processContributionPayment(groupWalletId: string, amount: number, description?: string): Promise<void> {
    const fee = this.feeEngine.calculateFee(amount);
    const netAmount = amount - fee;

    const prisma = PrismaDatabase.getInstance().getClient();
    await prisma.$transaction(async (tx) => {
      const transaction = await this.financialTransactionRepository.create({
        type: "CONTRIBUTION",
        amount,
        currency: "NGN",
        status: "SUCCESSFUL",
        destinationWalletId: groupWalletId,
        metadata: { description, fee },
      }, tx);

      const wallet = await this.walletRepository.findById(groupWalletId, tx);
      if (!wallet) throw new AuthError("Group wallet not found");

      await this.walletRepository.incrementBalance(groupWalletId, netAmount, tx);

      const updatedWallet = await this.walletRepository.findById(groupWalletId, tx);

      await this.ledgerEntryRepository.create({
        transactionId: transaction.id,
        walletId: groupWalletId,
        entryType: "CREDIT",
        amount: netAmount,
        direction: "IN",
        balanceBefore: wallet.balance,
        balanceAfter: updatedWallet!.balance,
        description: description ?? "Contribution payment",
      }, tx);

      if (fee > 0) {
        let platformWallet = await this.walletRepository.findByOwner("PLATFORM", "platform", tx);
        if (!platformWallet) {
          platformWallet = await this.walletRepository.create({ ownerType: "PLATFORM", ownerId: "platform", currency: "NGN" }, tx);
        }
        const platformWalletId = platformWallet.id;
        const platformBalanceBefore = platformWallet.balance;

        await this.walletRepository.incrementBalance(platformWalletId, fee, tx);

        const updatedPlatform = await this.walletRepository.findById(platformWalletId, tx);

        await this.ledgerEntryRepository.create({
          transactionId: transaction.id,
          walletId: platformWalletId,
          entryType: "CREDIT",
          amount: fee,
          direction: "IN",
          balanceBefore: platformBalanceBefore,
          balanceAfter: updatedPlatform!.balance,
          description: `Platform fee (${fee} on ${amount})`,
        }, tx);

        await this.financialTransactionRepository.create({
          type: "FEE",
          amount: fee,
          currency: "NGN",
          status: "SUCCESSFUL",
          destinationWalletId: platformWalletId,
          metadata: { parentTransaction: transaction.id, sourceAmount: amount },
        }, tx);
      }
    });

    await this.auditService.log("CONTRIBUTION_PAYMENT_PROCESSED", {
      metadata: { groupWalletId, amount, fee, netAmount },
    });
  }

  private async assertGroupAdmin(groupId: string, userId: string): Promise<void> {
    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
    if (membership.role !== "GROUP_OWNER" && membership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Only group admins can transfer from group wallets");
    }
  }

  private async assertWalletAccess(
    wallet: { ownerType: string; ownerId: string },
    userId: string,
  ): Promise<void> {
    if (wallet.ownerType === "USER" && wallet.ownerId !== userId) {
      throw new ForbiddenError("You do not have access to this wallet");
    }
    if (wallet.ownerType === "GROUP") {
      const membership = await this.groupMemberRepository.findByGroupAndUser(wallet.ownerId, userId);
      if (!membership || membership.status !== "ACTIVE") {
        throw new ForbiddenError("You are not a member of this group");
      }
    }
  }

  private mapWallet(wallet: {
    id: string; ownerType: string; ownerId: string;
    balance: number; currency: string; status: string; createdAt: Date;
  }): WalletResponse {
    return {
      id: wallet.id,
      ownerType: wallet.ownerType,
      ownerId: wallet.ownerId,
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      createdAt: wallet.createdAt.toISOString(),
    };
  }
}
