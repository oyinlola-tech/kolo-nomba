import { Prisma } from "../generated/prisma/client";
import { WebhookRepository } from "../repositories/webhook.repository";
import { PaymentService } from "./payment.service";
import { NombaWebhook } from "../integrations/nomba/nomba.webhook";
import { WebhookLogger } from "../logger/implementations/webhook.logger";
import { Logger } from "../logger/core/logger";
import { QueueManager } from "../jobs/queue-manager";
import { VirtualAccountService } from "./virtual-account.service";
import { nombaWebhookPayloadSchema } from "../validators/webhook.validator";
import { WebhookSignatureError, WebhookPayloadError, WebhookNotFoundError } from "../errors/webhook.error";

export class WebhookService {
  private readonly webhookRepository: WebhookRepository;
  private readonly paymentService: PaymentService;
  private readonly nombaWebhook: NombaWebhook;
  private readonly webhookLogger: WebhookLogger;
  private readonly logger: Logger;
  private readonly queueManager: QueueManager;
  private readonly virtualAccountService: VirtualAccountService;

  constructor() {
    this.webhookRepository = new WebhookRepository();
    this.paymentService = new PaymentService();
    this.nombaWebhook = new NombaWebhook();
    this.webhookLogger = new WebhookLogger();
    this.logger = new Logger("webhook-service");
    this.queueManager = QueueManager.getInstance();
    this.virtualAccountService = new VirtualAccountService();
  }

  async processNombaWebhook(
    signature: string | undefined,
    rawBody: string,
    body: Record<string, unknown>,
    timestamp: string | undefined,
  ): Promise<{ received: boolean }> {
    const isValid = this.nombaWebhook.verifySignature(signature, rawBody, timestamp ?? "");
    if (!isValid) {
      this.webhookLogger.log("Webhook signature verification failed");
      throw new WebhookSignatureError();
    }

    const parsed = nombaWebhookPayloadSchema.safeParse(body);
    if (!parsed.success) {
      this.webhookLogger.log("Webhook payload validation failed", {
        errors: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`),
      });
      throw new WebhookPayloadError();
    }

    const eventType = this.extractEventType(body);
    const eventId = this.extractEventId(body);

    if (eventId) {
      const existing = await this.webhookRepository.findByEventId("nomba", eventId);
      if (existing) {
        this.webhookLogger.log("Duplicate webhook event ID received", { eventType, eventId });
        return { received: true };
      }
    }

    if (signature) {
      const recentReplay = await this.webhookRepository.findRecentBySignature(
        "nomba",
        signature,
        new Date(Date.now() - 5 * 60 * 1000),
      );
      if (recentReplay) {
        this.webhookLogger.log("Duplicate webhook signature received", { eventType });
        return { received: true };
      }
    }

    const isDuplicate = await this.webhookRepository.isDuplicate("nomba", eventType, body);
    if (isDuplicate) {
      this.webhookLogger.log("Duplicate webhook received", { eventType });
      return { received: true };
    }

    let webhookEvent;
    try {
      webhookEvent = await this.webhookRepository.create({
        provider: "nomba",
        eventId,
        eventType,
        payload: body as Record<string, unknown>,
        signature,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        this.webhookLogger.log("Duplicate webhook event ID (race) received", { eventType, eventId });
        return { received: true };
      }
      throw err;
    }

    this.webhookLogger.log("Webhook received", { eventType, webhookId: webhookEvent.id });

    await this.ensureQueue("nomba-webhook");
    await this.queueManager.addJob("nomba-webhook", "PROCESS_WEBHOOK", {
      webhookId: webhookEvent.id,
      provider: "nomba",
      eventType,
    }, { jobId: `nomba-webhook-${webhookEvent.id}` });

    return { received: true };
  }

  async processStoredNombaWebhook(webhookId: string): Promise<void> {
    const webhook = await this.webhookRepository.findById(webhookId);
    if (!webhook) throw new WebhookNotFoundError();
    if (webhook.processed) return;

    try {
      await this.handleEvent(webhook.eventType, webhook.payload as Record<string, unknown>);
      await this.webhookRepository.markProcessed(webhook.id);
    } catch (error) {
      await this.webhookRepository.markFailed(webhook.id);
      throw error;
    }
  }

  private async handleEvent(eventType: string, body: Record<string, unknown>): Promise<void> {
    switch (eventType) {
      case "payment.success":
      case "charge.success":
      case "payment_success":
        await this.handlePaymentSuccess(body);
        break;

      case "payment.failed":
      case "charge.failed":
      case "payment_failed":
        this.webhookLogger.log("Payment failed event received", { body });
        break;
      case "payment_reversal":
        this.webhookLogger.log("Payment reversal event received", { body });
        break;
      case "transfer_success":
      case "transfer.failed":
      case "transfer_failed":
        this.webhookLogger.log("Transfer event received", { eventType, body });
        break;
      case "virtual_account_created":
        this.webhookLogger.log("Virtual account created event received", { body });
        break;
      case "virtual_account_transaction":
        await this.handleVirtualAccountTransaction(body);
        break;

      default:
        this.logger.info("Unhandled webhook event type", { eventType });
    }
  }

  private async handlePaymentSuccess(body: Record<string, unknown>): Promise<void> {
    const data = (body.data ?? body) as Record<string, unknown>;
    const paymentId = String(data.paymentId ?? data.payment_id ?? "");
    const reference = String(data.reference ?? data.providerReference ?? data.transactionReference ?? "");

    if (!paymentId || !reference) {
      this.logger.error("Webhook missing paymentId or reference", { eventType: body.eventType ?? body.event });
      return;
    }

    await this.paymentService.verifyAndCompletePayment(paymentId, reference);
  }

  private async handleVirtualAccountTransaction(body: Record<string, unknown>): Promise<void> {
    const data = (body.data ?? body) as Record<string, unknown>;
    const accountNumber = String(data.accountNumber ?? data.account_number ?? "");
    const reference = String(data.reference ?? data.providerReference ?? "");
    const amount = Number(data.amount ?? 0);
    if (!accountNumber || !reference || amount <= 0) {
      this.logger.warn("Virtual account webhook missing required data", { accountNumberPresent: Boolean(accountNumber) });
      return;
    }

    const account = await this.virtualAccountService.getByAccountNumber(accountNumber);
    if (!account) {
      this.logger.warn("Virtual account webhook for unknown account", { accountNumber });
      return;
    }

    this.logger.info("Virtual account transaction received", {
      ownerType: account.ownerType,
      ownerId: account.ownerId,
      reference,
      amount,
    });
  }

  private extractEventType(body: Record<string, unknown>): string {
    return String(body.event ?? body.eventType ?? body.type ?? "unknown");
  }

  private extractEventId(body: Record<string, unknown>): string | undefined {
    const data = (body.data ?? body) as Record<string, unknown>;
    const value = body.id ?? body.eventId ?? body.event_id ?? data.id ?? data.eventId ?? data.reference;
    return value ? String(value) : undefined;
  }

  private async ensureQueue(name: string): Promise<void> {
    if (!this.queueManager.getQueue(name)) {
      this.queueManager.createQueue(name);
    }
  }
}
