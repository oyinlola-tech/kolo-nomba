import { PrismaDatabase } from "../database/prisma";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { AuthError } from "../errors/auth.error";

export class AnalyticsService {
  private readonly groupMemberRepo: GroupMemberRepository;

  constructor() {
    this.groupMemberRepo = new GroupMemberRepository();
  }

  async getGroupPaymentAnalytics(groupId: string, userId: string) {
    const membership = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!membership || (membership.role !== "GROUP_ADMIN" && membership.role !== "GROUP_OWNER")) {
      throw new AuthError("You do not have access to this group's analytics");
    }

    const db = PrismaDatabase.getInstance().getClient();

    const [totalContributions, paidContributions, totalAmount, paidAmount, memberCount, recentPayments] = await Promise.all([
      db.memberContribution.count({
        where: { groupMember: { groupId } },
      }),
      db.memberContribution.count({
        where: { groupMember: { groupId }, status: "PAID" },
      }),
      db.memberContribution.aggregate({
        where: { groupMember: { groupId } },
        _sum: { expectedAmount: true },
      }),
      db.memberContribution.aggregate({
        where: { groupMember: { groupId }, status: "PAID" },
        _sum: { paidAmount: true },
      }),
      db.groupMember.count({
        where: { groupId, status: "ACTIVE" },
      }),
      db.payment.findMany({
        where: { groupId, status: "SUCCESSFUL" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          createdAt: true,
          userId: true,
        },
      }),
    ]);

    const collectionRate = totalContributions > 0
      ? Math.round((paidContributions / totalContributions) * 100)
      : 0;

    return {
      summary: {
        totalContributions,
        paidContributions,
        pendingContributions: totalContributions - paidContributions,
        collectionRate,
        totalExpectedAmount: totalAmount._sum.expectedAmount ?? 0,
        totalPaidAmount: paidAmount._sum.paidAmount ?? 0,
        outstandingAmount: (totalAmount._sum.expectedAmount ?? 0) - (paidAmount._sum.paidAmount ?? 0),
        activeMembers: memberCount,
      },
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

  async getMemberPaymentAnalytics(userId: string) {
    const db = PrismaDatabase.getInstance().getClient();

    const [totalContributions, paidContributions, totalExpected, totalPaid, recentPayments] = await Promise.all([
      db.memberContribution.count({
        where: { groupMember: { userId } },
      }),
      db.memberContribution.count({
        where: { groupMember: { userId }, status: "PAID" },
      }),
      db.memberContribution.aggregate({
        where: { groupMember: { userId } },
        _sum: { expectedAmount: true },
      }),
      db.memberContribution.aggregate({
        where: { groupMember: { userId }, status: "PAID" },
        _sum: { paidAmount: true },
      }),
      db.payment.findMany({
        where: { userId, status: "SUCCESSFUL" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          createdAt: true,
          groupId: true,
        },
      }),
    ]);

    const onTimeRate = totalContributions > 0
      ? Math.round((paidContributions / totalContributions) * 100)
      : 0;

    return {
      summary: {
        totalContributions,
        paidContributions,
        pendingContributions: totalContributions - paidContributions,
        onTimeRate,
        totalExpected: totalExpected._sum.expectedAmount ?? 0,
        totalPaid: totalPaid._sum.paidAmount ?? 0,
      },
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
}
