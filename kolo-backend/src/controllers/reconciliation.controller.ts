import type { FastifyReply, FastifyRequest } from "fastify";
import { ReconciliationService } from "../services/reconciliation.service";
import { ResponseUtil } from "../utils/response.util";
import { resolveReconciliationSchema } from "../validators/reconciliation.validator";
import { ValidationError } from "../errors/validation.error";

export class ReconciliationController {
  private readonly reconciliationService: ReconciliationService;

  constructor() {
    this.reconciliationService = new ReconciliationService();
  }

  async list(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.reconciliationService.getAll();
    ResponseUtil.success(reply, result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.reconciliationService.getById(id);
    ResponseUtil.success(reply, result);
  }

  async resolve(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = resolveReconciliationSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.reconciliationService.resolve(id, parsed.data.status, parsed.data.resolvedBy);
    ResponseUtil.success(reply, result);
  }
}
