import type { FastifyReply, FastifyRequest } from "fastify";
import { WalletService } from "../services/wallet.service";
import { ResponseUtil } from "../utils/response.util";
import { transferSchema } from "../validators/wallet.validator";
import { ValidationError } from "../errors/validation.error";

export class WalletController {
  private readonly walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.walletService.getWallet(id, request.userId);
    ResponseUtil.success(reply, result);
  }

  async getBalance(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.walletService.getBalance(id, request.userId);
    ResponseUtil.success(reply, result);
  }

  async transfer(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = transferSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    await this.walletService.transfer(
      parsed.data.sourceWalletId,
      parsed.data.destinationWalletId,
      parsed.data.amount,
      parsed.data.description,
      request.userId,
    );
    ResponseUtil.success(reply, { message: "Transfer completed successfully" });
  }
}
