import { PrismaDatabase } from "../database/prisma";

export class GroupRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.group.findUnique({
      where: { id },
      include: {
        members: {
          where: { status: "ACTIVE" },
          include: { user: true },
        },
        _count: { select: { members: { where: { status: "ACTIVE" } } } },
      },
    });
  }

  async findByUser(userId: string) {
    return this.db.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: { select: { members: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    category?: string;
    location?: string;
    createdBy: string;
  }) {
    return this.db.group.create({ data });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    location?: string;
    status?: string;
  }) {
    return this.db.group.update({ where: { id }, data: data as never });
  }

  async softDelete(id: string) {
    return this.db.group.update({
      where: { id },
      data: { status: "COMPLETED" as never },
    });
  }
}
