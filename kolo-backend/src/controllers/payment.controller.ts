import type { FastifyReply, FastifyRequest } from "fastify";
import { PaymentService } from "../services/payment.service";
import { ResponseUtil } from "../utils/response.util";
import { PaginationUtil } from "../utils/pagination.util";
import { initiatePaymentSchema } from "../validators/payment.validator";
import { ValidationError } from "../errors/validation.error";

export class PaymentController {
  private readonly paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async initiate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = initiatePaymentSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.paymentService.initiatePayment(parsed.data, request.userId!);
    ResponseUtil.created(reply, result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.paymentService.getPayment(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async history(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = request.query as { page?: string; limit?: string };
    const { page, limit } = PaginationUtil.parse({ page: Number(query.page) || undefined, limit: Number(query.limit) || undefined });
    const result = await this.paymentService.getPaymentHistory(request.userId!, page, limit);
    ResponseUtil.success(reply, result);
  }

  async getContributionPayments(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.paymentService.getContributionPayments(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async receipt(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { reference } = request.params as { reference: string };
    const result = await this.paymentService.getReceiptByReference(reference, request.userId!);
    ResponseUtil.success(reply, result);
  }
}
