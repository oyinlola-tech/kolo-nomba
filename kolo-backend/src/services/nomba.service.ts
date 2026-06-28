import { NombaConfig } from "../config/nomba.config";
import { NombaAuthService } from "../integrations/nomba/nomba.auth";
import { NombaClient } from "../integrations/nomba/nomba.client";
import { NombaPayment } from "../integrations/nomba/nomba.payment";
import { NombaTransfer } from "../integrations/nomba/nomba.transfer";
import { NombaVirtualAccount } from "../integrations/nomba/nomba.virtual-account";
import { NombaWebhook } from "../integrations/nomba/nomba.webhook";
import { NombaPaymentLogger } from "../logger/implementations/nomba-payment.logger";
import { NombaTransferLogger } from "../logger/implementations/nomba-transfer.logger";
import { NombaWebhookLogger } from "../logger/implementations/nomba-webhook.logger";
import { Logger } from "../logger/core/logger";

export class NombaService {
  private readonly config: NombaConfig;
  private readonly authService: NombaAuthService;
  private readonly client: NombaClient;
  private readonly payment: NombaPayment;
  private readonly transfer: NombaTransfer;
  private readonly virtualAccount: NombaVirtualAccount;
  private readonly webhook: NombaWebhook;
  private readonly paymentLogger: NombaPaymentLogger;
  private readonly transferLogger: NombaTransferLogger;
  private readonly webhookLogger: NombaWebhookLogger;
  private readonly logger: Logger;

  constructor() {
    this.config = new NombaConfig();
    this.authService = new NombaAuthService();
    this.client = new NombaClient();
    this.payment = new NombaPayment();
    this.transfer = new NombaTransfer();
    this.virtualAccount = new NombaVirtualAccount();
    this.webhook = new NombaWebhook();
    this.paymentLogger = new NombaPaymentLogger();
    this.transferLogger = new NombaTransferLogger();
    this.webhookLogger = new NombaWebhookLogger();
    this.logger = new Logger("nomba-service");
  }

  getConfig() {
    return this.config;
  }

  getAuth() {
    return this.authService;
  }

  getClient() {
    return this.client;
  }

  getPayment() {
    return this.payment;
  }

  getTransfer() {
    return this.transfer;
  }

  getVirtualAccount() {
    return this.virtualAccount;
  }

  getWebhook() {
    return this.webhook;
  }

  getPaymentLogger() {
    return this.paymentLogger;
  }

  getTransferLogger() {
    return this.transferLogger;
  }

  getWebhookLogger() {
    return this.webhookLogger;
  }

  getStatus() {
    const safe = this.config.safeStatus;
    return {
      configured: safe.clientConfigured && safe.privateKeyConfigured,
      environment: safe.environment,
      baseUrl: safe.baseUrl,
      parentAccountConfigured: safe.parentAccountConfigured,
      subAccountConfigured: safe.subAccountConfigured,
      clientConfigured: safe.clientConfigured,
      privateKeyConfigured: safe.privateKeyConfigured,
      webhookConfigured: safe.webhookConfigured,
      webhookUrl: safe.webhookUrl,
    };
  }

  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const token = await this.authService.getAccessToken();
      if (token) {
        return { connected: true, message: "Nomba API connected successfully" };
      }
      return { connected: false, message: "Failed to obtain access token" };
    } catch (error) {
      this.logger.error("Nomba connection check failed", { error: String(error) });
      return { connected: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  async initiatePayment(data: {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerName: string;
    paymentMethod: string;
  }) {
    this.paymentLogger.log("Initiating payment", { reference: data.reference, amount: data.amount });
    return this.payment.initiatePayment(data);
  }

  async verifyPayment(reference: string) {
    this.paymentLogger.log("Verifying payment", { reference });
    return this.payment.verifyPayment(reference);
  }

  async lookupTransaction(reference: string) {
    return this.payment.lookupTransaction(reference);
  }

  async listTransactions(query?: { from?: string; to?: string; page?: number; limit?: number }) {
    return this.payment.listTransactions(query);
  }

  async createTransfer(data: {
    amount: number;
    currency: string;
    reference: string;
    destinationAccount: string;
    destinationBank: string;
    accountName: string;
    narration?: string;
  }) {
    this.transferLogger.log("Initiating transfer", { reference: data.reference, amount: data.amount });
    return this.transfer.createTransfer(data);
  }

  async checkTransferStatus(reference: string) {
    return this.transfer.checkTransferStatus(reference);
  }

  async createVirtualAccount(data: {
    reference: string;
    accountName: string;
    ownerType: "USER" | "GROUP" | "PLATFORM";
    ownerId: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.virtualAccount.create(data);
  }

  async getVirtualAccountByRef(providerReference: string) {
    return this.virtualAccount.get(providerReference);
  }

  async deactivateVirtualAccount(providerReference: string) {
    return this.virtualAccount.deactivate(providerReference);
  }

  verifyWebhookSignature(signature: string | undefined, body: string, timestamp?: string): boolean {
    return this.webhook.verifySignature(signature, body, timestamp ?? "");
  }

  getSafeStatus() {
    return this.config.safeStatus;
  }
}
