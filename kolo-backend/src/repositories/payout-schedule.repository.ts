import { PrismaDatabase } from "../database/prisma";

export class PayoutScheduleRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.payoutSchedule.findUnique({ where: { id } });
  }

  async findByGroup(groupId: string) {
    return this.db.payoutSchedule.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActive() {
    return this.db.payoutSchedule.findMany({
      where: { status: "ACTIVE" },
    });
  }

  async create(data: {
    groupId: string;
    type: string;
    frequency: string;
    amount: number;
    nextExecutionDate: Date;
    dayOfMonth?: number;
    dayOfWeek?: number;
    customInterval?: number;
    createdBy: string;
  }) {
    return this.db.payoutSchedule.create({
      data: {
        groupId: data.groupId,
        type: data.type as never,
        frequency: data.frequency as never,
        amount: data.amount,
        nextExecutionDate: data.nextExecutionDate,
        dayOfMonth: data.dayOfMonth ?? null,
        dayOfWeek: data.dayOfWeek ?? null,
        customInterval: data.customInterval ?? null,
        createdBy: data.createdBy,
        status: "ACTIVE" as never,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.payoutSchedule.update({
      where: { id },
      data: { status: status as never },
    });
  }

  async updateNextExecution(id: string, nextDate: Date) {
    return this.db.payoutSchedule.update({
      where: { id },
      data: {
        nextExecutionDate: nextDate,
        lastExecutedAt: new Date(),
      },
    });
  }
}
