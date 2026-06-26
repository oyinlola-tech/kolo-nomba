import type { FastifyReply, FastifyRequest } from "fastify";
import { FinancialTransactionService } from "../services/financial-transaction.service";
import { ResponseUtil } from "../utils/response.util";

export class FinancialTransactionController {
  private readonly transactionService: FinancialTransactionService;

  constructor() {
    this.transactionService = new FinancialTransactionService();
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.transactionService.getUserTransactions(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.transactionService.getTransaction(id, request.userId);
    ResponseUtil.success(reply, result);
  }
}
