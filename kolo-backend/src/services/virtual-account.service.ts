import { v4 as uuidv4 } from "uuid";
import { VirtualAccountRepository } from "../repositories/virtual-account.repository";
import { UserRepository } from "../repositories/user.repository";
import { NombaVirtualAccount } from "../integrations/nomba/nomba.virtual-account";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import { Logger } from "../logger/core/logger";

export class VirtualAccountService {
  private readonly repository = new VirtualAccountRepository();
  private readonly userRepository = new UserRepository();
  private readonly nomba = new NombaVirtualAccount();
  private readonly auditService = new AuditService();
  private readonly logger = new Logger("virtual-account-service");

  async createVirtualAccount(data: {
    accountName: string;
    ownerType: "USER" | "GROUP" | "PLATFORM";
    ownerId: string;
    metadata?: Record<string, unknown>;
  }) {
    const existing = await this.repository.findByOwner(data.ownerType, data.ownerId);
    const active = existing.find(account => account.status === "ACTIVE");
    if (active) return active;

    const accountRef = `VA-${uuidv4().slice(0, 8).toUpperCase()}`;
    const provider = await this.nomba.create({
      accountRef,
      accountName: data.accountName,
      ownerType: data.ownerType,
      ownerId: data.ownerId,
      metadata: data.metadata,
    });

    const account = await this.repository.create({
      provider: "nomba",
      providerReference: provider.providerReference,
      accountNumber: provider.accountNumber,
      accountName: provider.accountName,
      bankName: provider.bankName,
      ownerType: data.ownerType,
      ownerId: data.ownerId,
      status: provider.status,
      metadata: data.metadata,
    });

    await this.auditService.log("VIRTUAL_ACCOUNT_CREATED", {
      metadata: {
        virtualAccountId: account.id,
        ownerType: data.ownerType,
        ownerId: data.ownerId,
      },
    });

    this.logger.info("Virtual account created", {
      virtualAccountId: account.id,
      ownerType: data.ownerType,
      ownerId: data.ownerId,
    });

    return account;
  }

  async getAccount(id: string) {
    const account = await this.repository.findById(id);
    if (!account) throw new AuthError("Virtual account not found");
    return account;
  }

  async getByOwner(ownerType: string, ownerId: string) {
    return this.repository.findByOwner(ownerType, ownerId);
  }

  async getUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AuthError("User not found");
    return user;
  }

  async getByAccountNumber(accountNumber: string) {
    return this.repository.findByAccountNumber(accountNumber);
  }

  async getTransactions(id: string) {
    const account = await this.getAccount(id);
    return this.nomba.listTransactions(account.providerReference);
  }

  async deactivate(id: string) {
    const account = await this.getAccount(id);
    await this.nomba.deactivate(account.providerReference);
    return this.repository.updateStatus(id, "INACTIVE");
  }
}
