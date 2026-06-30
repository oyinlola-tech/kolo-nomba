import { AdminRepository } from "../repositories/admin.repository";
import { DisputeRepository } from "../repositories/dispute.repository";
import { UserRepository } from "../repositories/user.repository";
import { GroupRepository } from "../repositories/group.repository";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import type {
  DashboardMetrics, ChartDataPoint, AdminUserResponse,
  AdminGroupResponse, AdminTransactionResponse,
  SecurityEventResponse, PaginatedResponse, AdminRevenueResponse,
  DisputeResponse,
} from "../dto/admin.dto";
import { Logger } from "../logger/core/logger";

export class AdminService {
  private readonly adminRepository: AdminRepository;
  private readonly disputeRepository: DisputeRepository;
  private readonly userRepository: UserRepository;
  private readonly groupRepository: GroupRepository;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.disputeRepository = new DisputeRepository();
    this.userRepository = new UserRepository();
    this.groupRepository = new GroupRepository();
    this.auditService = new AuditService();
    this.logger = new Logger("admin-service");
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.adminRepository.getDashboardMetrics();
  }

  async getRevenueAnalytics(): Promise<AdminRevenueResponse> {
    const [monthlyRevenue, revenueBySource] = await Promise.all([
      this.adminRepository.getMonthlyRevenue(),
      this.adminRepository.getRevenueBySource(),
    ]);

    const totalRevenue = revenueBySource.reduce((sum, r) => sum + r.amount, 0);

    return { totalRevenue, monthlyRevenue, revenueBySource };
  }

  async getChartData(): Promise<{
    transactionVolume: ChartDataPoint[];
    userGrowth: ChartDataPoint[];
    groupCreation: ChartDataPoint[];
    monthlyRevenue: ChartDataPoint[];
  }> {
    const [transactionVolume, userGrowth, groupCreation, monthlyRevenue] = await Promise.all([
      this.adminRepository.getTransactionVolumeByDay(),
      this.adminRepository.getUserGrowthByDay(),
      this.adminRepository.getGroupCreationByDay(),
      this.adminRepository.getMonthlyRevenue(),
    ]);

    return { transactionVolume, userGrowth, groupCreation, monthlyRevenue };
  }

  async getRecentActivities() {
    return this.adminRepository.getRecentActivities();
  }

  async getUsers(page: number, limit: number, search?: string): Promise<PaginatedResponse<AdminUserResponse>> {
    const { data, total } = await this.adminRepository.getUsers(page, limit, search);
    return {
      data: data.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(id: string): Promise<AdminUserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AuthError("User not found");
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateUserStatus(id: string, status: string, adminId: string): Promise<AdminUserResponse> {
    await this.userRepository.updateStatus(id, status);
    await this.auditService.log("USER_STATUS_UPDATED", {
      userId: adminId,
      metadata: { targetUserId: id, newStatus: status },
    });
    this.logger.info("User status updated", { userId: id, status, by: adminId });
    return this.getUserById(id);
  }

  async verifyUser(id: string, adminId: string): Promise<AdminUserResponse> {
    await this.userRepository.updateStatus(id, "ACTIVE");
    await this.auditService.log("USER_VERIFIED", {
      userId: adminId,
      metadata: { targetUserId: id },
    });
    this.logger.info("User verified", { userId: id, by: adminId });
    return this.getUserById(id);
  }

  async getGroups(page: number, limit: number, search?: string): Promise<PaginatedResponse<AdminGroupResponse>> {
    const { data, total } = await this.adminRepository.getGroups(page, limit, search);
    return {
      data: data.map(g => ({
        id: g.id,
        name: g.name,
        category: g.category,
        status: g.status,
        memberCount: g._count.members,
        createdBy: g.createdBy,
        createdAt: g.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getGroupById(id: string): Promise<AdminGroupResponse> {
    const group = await this.groupRepository.findById(id);
    if (!group) throw new AuthError("Group not found");
    return {
      id: group.id,
      name: group.name,
      category: group.category,
      status: group.status,
      memberCount: group._count.members,
      createdBy: group.createdBy,
      createdAt: group.createdAt.toISOString(),
    };
  }

  async updateGroupStatus(id: string, status: string, adminId: string): Promise<AdminGroupResponse> {
    await this.groupRepository.update(id, { status });
    await this.auditService.log("GROUP_STATUS_UPDATED", {
      userId: adminId,
      metadata: { targetGroupId: id, newStatus: status },
    });
    this.logger.info("Group status updated", { groupId: id, status, by: adminId });
    return this.getGroupById(id);
  }

  async getTransactions(
    page: number, limit: number, filters?: {
      type?: string; status?: string; startDate?: string; endDate?: string; userId?: string;
    },
  ): Promise<PaginatedResponse<AdminTransactionResponse>> {
    const { data, total } = await this.adminRepository.getTransactions(page, limit, filters);
    return {
      data: data.map(t => ({
        id: t.id,
        reference: t.reference,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        userId: null,
        createdAt: t.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTransactionById(id: string): Promise<AdminTransactionResponse> {
    const db = (await import("../database/prisma")).PrismaDatabase.getInstance().getClient();
    const txn = await db.financialTransaction.findUnique({ where: { id } });
    if (!txn) throw new AuthError("Transaction not found");
    return {
      id: txn.id,
      reference: txn.reference,
      type: txn.type,
      amount: txn.amount,
      currency: txn.currency,
      status: txn.status,
      userId: null,
      createdAt: txn.createdAt.toISOString(),
    };
  }

  async getWithdrawals(page: number, limit: number): Promise<PaginatedResponse<{
    id: string; userId: string; walletId: string; amount: number; status: string; createdAt: string;
  }>> {
    const { data, total } = await this.adminRepository.getWithdrawals(page, limit);
    return {
      data: data.map(w => ({
        id: w.id, userId: w.userId, walletId: w.walletId,
        amount: w.amount, status: w.status, createdAt: w.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateWithdrawalStatus(id: string, status: string, adminId: string): Promise<void> {
    const db = (await import("../database/prisma")).PrismaDatabase.getInstance().getClient();
    await db.withdrawalRequest.update({ where: { id }, data: { status: status as never } });
    await this.auditService.log("WITHDRAWAL_STATUS_UPDATED", {
      userId: adminId,
      metadata: { withdrawalId: id, newStatus: status },
    });
  }

  async getSecurityEvents(page: number, limit: number): Promise<PaginatedResponse<SecurityEventResponse>> {
    const { data, total } = await this.adminRepository.getSecurityEvents(page, limit);
    return {
      data: data.map(e => ({
        id: e.id, userId: e.userId, action: e.action,
        ipAddress: e.ipAddress, userAgent: e.userAgent, createdAt: e.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAuditLogs(page: number, limit: number): Promise<PaginatedResponse<SecurityEventResponse>> {
    const { data, total } = await this.adminRepository.getAuditLogs(page, limit);
    return {
      data: data.map(e => ({
        id: e.id, userId: e.userId, action: e.action,
        ipAddress: e.ipAddress, userAgent: e.userAgent, createdAt: e.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDisputes(page: number, limit: number): Promise<PaginatedResponse<DisputeResponse>> {
    const skip = (page - 1) * limit;
    const { data, total } = await this.disputeRepository.findMany({ skip, take: limit });
    return {
      data: data.map(d => ({
        id: d.id,
        userId: d.userId,
        userEmail: d.user?.email ?? null,
        type: d.type,
        description: d.title,
        status: d.status,
        reference: d.reference,
        amount: d.amount,
        createdAt: d.createdAt.toISOString(),
        resolvedAt: d.resolvedAt?.toISOString() ?? null,
        resolvedBy: d.resolvedBy,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async resolveDispute(id: string, adminId: string): Promise<DisputeResponse> {
    const resolved = await this.disputeRepository.resolve(id, adminId);
    await this.auditService.log("DISPUTE_RESOLVED", {
      userId: adminId,
      metadata: { disputeId: id },
    });
    return {
      id: resolved.id,
      userId: resolved.userId,
      userEmail: null,
      type: resolved.type,
      description: resolved.title,
      status: resolved.status,
      reference: resolved.reference,
      amount: resolved.amount,
      createdAt: resolved.createdAt.toISOString(),
      resolvedAt: resolved.resolvedAt?.toISOString() ?? null,
      resolvedBy: resolved.resolvedBy,
    };
  }
}
