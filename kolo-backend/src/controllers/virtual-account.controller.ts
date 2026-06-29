import type { FastifyReply, FastifyRequest } from "fastify";
import { VirtualAccountService } from "../services/virtual-account.service";
import { ResponseUtil } from "../utils/response.util";
import { AuthError } from "../errors/auth.error";

export class VirtualAccountController {
  private readonly virtualAccountService: VirtualAccountService;

  constructor() {
    this.virtualAccountService = new VirtualAccountService();
  }

  async getMyAccount(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const accounts = await this.virtualAccountService.getByOwner("USER", request.userId!);
    const active = accounts.find(a => a.status === "ACTIVE");
    if (!active) {
      ResponseUtil.success(reply, null);
      return;
    }
    ResponseUtil.success(reply, {
      id: active.id,
      accountNumber: active.accountNumber,
      accountName: active.accountName,
      bankName: active.bankName,
      providerReference: active.providerReference,
      status: active.status,
      createdAt: active.createdAt.toISOString(),
    });
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const account = await this.virtualAccountService.getAccount(id);
    if (!account) throw new AuthError("Virtual account not found");
    ResponseUtil.success(reply, {
      id: account.id,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      bankName: account.bankName,
      ownerType: account.ownerType,
      ownerId: account.ownerId,
      status: account.status,
      createdAt: account.createdAt.toISOString(),
    });
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const existing = await this.virtualAccountService.getByOwner("USER", request.userId!);
    const active = existing.find(a => a.status === "ACTIVE");
    if (active) {
      ResponseUtil.success(reply, {
        id: active.id,
        accountNumber: active.accountNumber,
        accountName: active.accountName,
        bankName: active.bankName,
        status: active.status,
      });
      return;
    }

    const user = await this.virtualAccountService.getUser(request.userId!);
    const account = await this.virtualAccountService.createVirtualAccount({
      accountName: `${user.firstName} ${user.lastName}`,
      ownerType: "USER",
      ownerId: request.userId!,
    });
    ResponseUtil.created(reply, {
      id: account.id,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      bankName: account.bankName,
      status: account.status,
    });
  }
}
