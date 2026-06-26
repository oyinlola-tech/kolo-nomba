import { PrismaDatabase } from "../database/prisma";

export class WebhookRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.webhookEvent.findUnique({ where: { id } });
  }

  async findByProviderAndType(provider: string, eventType: string) {
    return this.db.webhookEvent.findFirst({
      where: { provider, eventType },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    provider: string;
    eventId?: string;
    eventType: string;
    payload: Record<string, unknown>;
    signature?: string;
  }) {
    return this.db.webhookEvent.create({
      data: {
        provider: data.provider,
        eventId: data.eventId ?? null,
        eventType: data.eventType,
        payload: data.payload as never,
        signature: data.signature ?? null,
        status: "PENDING",
      },
    });
  }

  async markProcessed(id: string) {
    return this.db.webhookEvent.update({
      where: { id },
      data: { processed: true, status: "PROCESSED", processedAt: new Date() },
    });
  }

  async markFailed(id: string) {
    return this.db.webhookEvent.update({
      where: { id },
      data: { status: "FAILED" },
    });
  }

  async findByEventId(provider: string, eventId: string) {
    return this.db.webhookEvent.findFirst({ where: { provider, eventId } });
  }

  async findRecentBySignature(provider: string, signature: string, since: Date) {
    return this.db.webhookEvent.findFirst({
      where: {
        provider,
        signature,
        createdAt: { gte: since },
      },
    });
  }

  async findMany(provider: string, take = 50) {
    return this.db.webhookEvent.findMany({
      where: { provider },
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  async isDuplicate(provider: string, eventType: string, payload: Record<string, unknown>): Promise<boolean> {
    const reference = (payload as any).reference ?? (payload as any).id;
    if (!reference) return false;

    const existing = await this.db.webhookEvent.findFirst({
      where: {
        provider,
        eventType,
        OR: [
          { eventId: String(reference) },
          { payload: { path: "$.reference", equals: reference } as never },
          { payload: { path: "$.providerReference", equals: reference } as never },
        ],
      },
    });
    return !!existing;
  }
}
