import { PrismaDatabase } from "../database/prisma";

interface UpsertJobData {
  jobId: string;
  queue: string;
  type: string;
  status: string;
  error?: string;
  payload?: Record<string, unknown>;
}

export class BackgroundJobRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async createOrUpdate(data: UpsertJobData): Promise<void> {
    await this.db.backgroundJob.upsert({
      where: { jobId_queue: { jobId: data.jobId, queue: data.queue } },
      update: {
        status: data.status as never,
        error: data.error ?? null,
        progress: data.status === "COMPLETED" ? 100 : data.status === "PROCESSING" ? 50 : 0,
      },
      create: {
        jobId: data.jobId,
        queue: data.queue,
        type: data.type,
        status: data.status as never,
        error: data.error ?? null,
        payload: (data.payload ?? {}) as never,
      },
    });
  }

  async findById(id: string) {
    return this.db.backgroundJob.findUnique({ where: { id } });
  }

  async findByJobId(jobId: string, queue: string) {
    return this.db.backgroundJob.findUnique({
      where: { jobId_queue: { jobId, queue } },
    });
  }

  async findRecent(limit = 50, offset = 0) {
    return this.db.backgroundJob.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findByStatus(status: string, limit = 50, offset = 0) {
    return this.db.backgroundJob.findMany({
      where: { status: status as never },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findByQueue(queue: string, limit = 50, offset = 0) {
    return this.db.backgroundJob.findMany({
      where: { queue },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async countByStatus(status: string): Promise<number> {
    return this.db.backgroundJob.count({ where: { status: status as never } });
  }

  async countAll(): Promise<number> {
    return this.db.backgroundJob.count();
  }
}
