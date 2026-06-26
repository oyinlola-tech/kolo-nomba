import type { FastifyReply, FastifyRequest } from "fastify";
import { LedgerService } from "../services/ledger.service";
import { WalletService } from "../services/wallet.service";
import { ResponseUtil } from "../utils/response.util";

export class LedgerController {
  private readonly ledgerService: LedgerService;
  private readonly walletService: WalletService;

  constructor() {
    this.ledgerService = new LedgerService();
    this.walletService = new WalletService();
  }

  async getByWallet(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { walletId } = request.params as { walletId: string };
    await this.walletService.getWallet(walletId, request.userId);
    const result = await this.ledgerService.getLedgerByWallet(walletId);
    ResponseUtil.success(reply, result);
  }
}
