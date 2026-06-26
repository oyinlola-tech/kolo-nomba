import type { FastifyReply, FastifyRequest } from "fastify";
import { PayoutService } from "../services/payout.service";
import { ResponseUtil } from "../utils/response.util";
import {
  createPayoutSchema,
  approvalSchema,
  createScheduleSchema,
  createRecipientAccountSchema,
} from "../validators/payout.validator";
import { ValidationError } from "../errors/validation.error";

export class PayoutController {
  private readonly payoutService: PayoutService;

  constructor() {
    this.payoutService = new PayoutService();
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const parsed = createPayoutSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }
    const result = await this.payoutService.createPayout(parsed.data, groupId, request.userId!);
    ResponseUtil.created(reply, result);
  }

  async listByGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const result = await this.payoutService.getPayouts(groupId, request.userId);
    ResponseUtil.success(reply, result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.payoutService.getPayout(id, request.userId);
    ResponseUtil.success(reply, result);
  }

  async getUserPayouts(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.payoutService.getUserPayouts(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async approve(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = approvalSchema.safeParse(request.body);
    const comment = parsed.success ? parsed.data.comment : undefined;
    const result = await this.payoutService.approvePayout(id, request.userId!, comment);
    ResponseUtil.success(reply, result);
  }

  async reject(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = approvalSchema.safeParse(request.body);
    const comment = parsed.success ? parsed.data.comment : undefined;
    const result = await this.payoutService.rejectPayout(id, request.userId!, comment);
    ResponseUtil.success(reply, result);
  }

  async cancel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.payoutService.cancelPayout(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async process(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.payoutService.processPayout(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async retryFailedTransfer(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { recipientId } = request.params as { recipientId: string };
    const result = await this.payoutService.retryFailedTransfer(recipientId, request.userId);
    ResponseUtil.success(reply, result);
  }

  async getReceipt(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { recipientId } = request.params as { recipientId: string };
    const result = await this.payoutService.generateTransferReceipt(recipientId, request.userId);
    ResponseUtil.success(reply, result);
  }

  async createSchedule(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const parsed = createScheduleSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }
    const result = await this.payoutService.createSchedule(parsed.data, groupId, request.userId!);
    ResponseUtil.created(reply, result);
  }

  async listSchedules(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const result = await this.payoutService.getSchedules(groupId);
    ResponseUtil.success(reply, result);
  }

  async pauseSchedule(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { scheduleId } = request.params as { scheduleId: string };
    const result = await this.payoutService.pauseSchedule(scheduleId, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async createRecipientAccount(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = createRecipientAccountSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }
    const result = await this.payoutService.createRecipientAccount(parsed.data, request.userId!);
    ResponseUtil.created(reply, result);
  }

  async listRecipientAccounts(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.payoutService.getUserRecipientAccounts(request.userId!);
    ResponseUtil.success(reply, result);
  }
}
