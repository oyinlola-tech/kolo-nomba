import { PaymentRepository } from "../repositories/payment.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { MemberContributionRepository } from "../repositories/member-contribution.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { AuditService } from "./audit.service";
import { WalletService } from "./wallet.service";
import { NotificationService } from "./notification.service";
import { NombaPayment } from "../integrations/nomba/nomba.payment";
import { NombaPaymentLogger } from "../logger/implementations/nomba-payment.logger";
import { AuthError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import type { InitiatePaymentDto, PaymentResponse, InitiatePaymentResult } from "../dto/payment.dto";
import { Logger } from "../logger/core/logger";

export class PaymentService {
  private readonly paymentRepository: PaymentRepository;
  private readonly transactionRepository: TransactionRepository;
  private readonly memberContributionRepository: MemberContributionRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly auditService: AuditService;
  private readonly walletService: WalletService;
  private readonly notificationService: NotificationService;
  private readonly nombaPayment: NombaPayment;
  private readonly paymentLogger: NombaPaymentLogger;
  private readonly logger: Logger;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.transactionRepository = new TransactionRepository();
    this.memberContributionRepository = new MemberContributionRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.auditService = new AuditService();
    this.walletService = new WalletService();
    this.notificationService = new NotificationService();
    this.nombaPayment = new NombaPayment();
    this.paymentLogger = new NombaPaymentLogger();
    this.logger = new Logger("payment-service");
  }

  async initiatePayment(dto: InitiatePaymentDto, userId: string): Promise<InitiatePaymentResult> {
    const contribution = await this.memberContributionRepository.findById(dto.contributionId);
    if (!contribution) {
      throw new AuthError("Contribution not found");
    }

    if (contribution.status === "PAID") {
      throw new ValidationError("Contribution is already paid");
    }

    const groupMember = await this.groupMemberRepository.findById(contribution.groupMemberId);
    if (!groupMember || groupMember.userId !== userId) {
      throw new AuthError("You do not own this contribution");
    }

    const outstanding = contribution.expectedAmount - contribution.paidAmount;
    if (outstanding <= 0) {
      throw new ValidationError("Contribution is already fully paid");
    }
    if (dto.amount !== outstanding) {
      throw new ValidationError(`Amount must equal the outstanding balance of ${outstanding}`);
    }

    const payment = await this.paymentRepository.create({
      userId,
      groupId: groupMember.groupId,
      contributionId: dto.contributionId,
      amount: dto.amount,
      currency: "NGN",
      provider: "nomba",
      status: "INITIALIZED",
      paymentMethod: dto.paymentMethod,
    });

    const reference = `PAY-${payment.id.slice(0, 8).toUpperCase()}-${Date.now()}`;

    let nombaResult: { reference: string; paymentUrl: string | null };
    try {
      nombaResult = await this.nombaPayment.initiatePayment({
        amount: dto.amount,
        currency: "NGN",
        reference,
        customerEmail: groupMember.user.email,
        customerName: `${groupMember.user.firstName} ${groupMember.user.lastName}`,
        paymentMethod: dto.paymentMethod,
      });
    } catch {
      await this.paymentRepository.updateStatus(payment.id, "FAILED");
      throw new Error("Payment provider unavailable. Please try again.");
    }

    await this.paymentRepository.updateStatus(
      payment.id,
      "PENDING",
      undefined,
      nombaResult.reference,
    );

    await this.auditService.log("PAYMENT_INITIALIZED", {
      userId,
      metadata: { paymentId: payment.id, amount: dto.amount },
    });

    this.paymentLogger.log("Payment initialized", {
      paymentId: payment.id,
      amount: dto.amount,
    });

    return {
      paymentId: payment.id,
      reference: nombaResult.reference,
      paymentUrl: nombaResult.paymentUrl,
    };
  }

  async getPayment(paymentId: string, userId: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AuthError("Payment not found");
    }

    if (payment.userId !== userId) {
      throw new AuthError("You do not have access to this payment");
    }

    return {
      id: payment.id,
      userId: payment.userId,
      groupId: payment.groupId,
      contributionId: payment.contributionId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      providerReference: payment.providerReference,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  async getPaymentHistory(userId: string): Promise<PaymentResponse[]> {
    const payments = await this.paymentRepository.findByUser(userId);
    return payments.map(p => ({
      id: p.id,
      userId: p.userId,
      groupId: p.groupId,
      contributionId: p.contributionId,
      transactionId: p.transactionId,
      amount: p.amount,
      currency: p.currency,
      provider: p.provider,
      providerReference: p.providerReference,
      status: p.status,
      paymentMethod: p.paymentMethod,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async getContributionPayments(contributionId: string, userId: string): Promise<PaymentResponse[]> {
    const contribution = await this.memberContributionRepository.findById(contributionId);
    if (!contribution) {
      throw new AuthError("Contribution not found");
    }

    const groupMember = await this.groupMemberRepository.findById(contribution.groupMemberId);
    if (!groupMember || groupMember.userId !== userId) {
      throw new AuthError("You do not have access to this contribution");
    }

    const payments = await this.paymentRepository.findByContribution(contributionId);
    return payments.map(p => ({
      id: p.id,
      userId: p.userId,
      groupId: p.groupId,
      contributionId: p.contributionId,
      transactionId: p.transactionId,
      amount: p.amount,
      currency: p.currency,
      provider: p.provider,
      providerReference: p.providerReference,
      status: p.status,
      paymentMethod: p.paymentMethod,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async processSuccessfulPayment(paymentId: string, providerReference: string): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      this.logger.error("Payment not found for webhook processing", { paymentId });
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      this.logger.warn("Duplicate webhook: payment already successful", { paymentId });
      return;
    }

    const transaction = await this.transactionRepository.create({
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      type: "CONTRIBUTION_PAYMENT",
      status: "SUCCESSFUL",
      reference: providerReference,
      metadata: { paymentId, providerReference },
    });

    await this.paymentRepository.updateStatus(payment.id, "SUCCESSFUL", transaction.id, providerReference);

    if (payment.contributionId) {
      await this.memberContributionRepository.updateStatus(
        payment.contributionId,
        "PAID",
        payment.amount,
      );
    }

    await this.auditService.log("PAYMENT_SUCCESSFUL", {
      userId: payment.userId,
      metadata: { paymentId, transactionId: transaction.id, amount: payment.amount },
    });

    this.paymentLogger.log("Payment successful", {
      paymentId,
      transactionId: transaction.id,
      amount: payment.amount,
    });
  }

  async verifyAndCompletePayment(paymentId: string, reference: string): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      this.logger.error("Payment not found for verification", { paymentId });
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      this.logger.warn("Payment already completed", { paymentId });
      return;
    }

    try {
      const verification = await this.nombaPayment.verifyPayment(reference);
      if (verification.status !== "SUCCESSFUL" && verification.status !== "SUCCESS") {
        await this.paymentRepository.updateStatus(paymentId, "FAILED");
        this.paymentLogger.log("Payment verification failed", { paymentId, reference, status: verification.status });
        return;
      }

      const providerRef = verification.providerReference || reference;

      await this.processSuccessfulPayment(paymentId, providerRef);

      if (payment.groupId) {
        const groupWallet = await this.walletService.getOrCreateWallet("GROUP", payment.groupId);
        await this.walletService.processContributionPayment(groupWallet.id, payment.amount, `Contribution payment ${paymentId}`);

        await this.notificationService.create({
          userId: payment.userId,
          type: "PAYMENT",
          title: "Payment Successful",
          message: `Your payment of ${payment.amount} NGN has been received successfully.`,
          metadata: { paymentId, reference: providerRef },
        });
      }
    } catch (error) {
      this.logger.error("Payment verification failed with error", {
        paymentId,
        reference,
        error: String(error),
      });
    }
  }
}
