import type { FastifyReply, FastifyRequest } from "fastify";
import { WithdrawalService } from "../services/withdrawal.service";
import { ResponseUtil } from "../utils/response.util";
import { createWithdrawalSchema } from "../validators/withdrawal.validator";
import { ValidationError } from "../errors/validation.error";

export class WithdrawalController {
  private readonly withdrawalService: WithdrawalService;

  constructor() {
    this.withdrawalService = new WithdrawalService();
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = createWithdrawalSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.withdrawalService.createWithdrawal(
      request.userId!,
      parsed.data.walletId,
      parsed.data.amount,
      parsed.data.destination,
    );
    ResponseUtil.created(reply, result);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.withdrawalService.getWithdrawals(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.withdrawalService.getWithdrawal(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async approve(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.withdrawalService.approveWithdrawal(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async reject(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.withdrawalService.rejectWithdrawal(id, request.userId!);
    ResponseUtil.success(reply, result);
  }
}
