import { LedgerEntryRepository } from "../repositories/ledger-entry.repository";
import type { LedgerEntryResponse } from "../dto/ledger.dto";

export class LedgerService {
  private readonly ledgerEntryRepository: LedgerEntryRepository;

  constructor() {
    this.ledgerEntryRepository = new LedgerEntryRepository();
  }

  async getLedgerByWallet(walletId: string): Promise<LedgerEntryResponse[]> {
    const entries = await this.ledgerEntryRepository.findByWallet(walletId);
    return entries.map(e => ({
      id: e.id,
      transactionId: e.transactionId,
      walletId: e.walletId,
      entryType: e.entryType,
      amount: e.amount,
      direction: e.direction,
      balanceBefore: e.balanceBefore,
      balanceAfter: e.balanceAfter,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
    }));
  }
}
