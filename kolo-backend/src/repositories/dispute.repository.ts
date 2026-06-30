import { PrismaDatabase } from "../database/prisma";
import type { Prisma } from "../generated/prisma/client";

export class DisputeRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findMany(params: { skip: number; take: number; status?: string; type?: string }) {
    const where: Prisma.DisputeWhereInput = {};
    if (params.status) where.status = params.status as never;
    if (params.type) where.type = params.type as never;

    const [data, total] = await Promise.all([
      this.db.dispute.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.db.dispute.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.db.dispute.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async create(data: Prisma.DisputeCreateInput) {
    return this.db.dispute.create({ data });
  }

  async update(id: string, data: Prisma.DisputeUpdateInput) {
    return this.db.dispute.update({ where: { id }, data });
  }

  async resolve(id: string, resolvedBy: string) {
    return this.db.dispute.update({
      where: { id },
      data: { status: "RESOLVED", resolvedBy, resolvedAt: new Date() },
    });
  }
}
