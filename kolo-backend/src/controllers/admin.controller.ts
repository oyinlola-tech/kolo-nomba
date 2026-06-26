import type { FastifyReply, FastifyRequest } from "fastify";
import { AdminService } from "../services/admin.service";
import { NombaService } from "../services/nomba.service";
import { ResponseUtil } from "../utils/response.util";
import {
  updateUserStatusSchema,
  updateGroupStatusSchema,
  updateWithdrawalStatusSchema,
  paginationSchema,
  transactionFilterSchema,
} from "../validators/admin.validator";
import { ValidationError } from "../errors/validation.error";
import { QueueManager } from "../jobs/queue-manager";
import { BackgroundJobRepository } from "../jobs/background-job.repository";
import { PlatformSettingService, type NotificationSettingsDto } from "../services/platform-setting.service";
import { PrismaDatabase } from "../database/prisma";
import { z } from "zod";

export class AdminController {
  private readonly adminService: AdminService;
  private readonly nombaService: NombaService;
  private readonly queueManager: QueueManager;
  private readonly jobRepo: BackgroundJobRepository;
  private readonly platformSettingService: PlatformSettingService;

  constructor() {
    this.adminService = new AdminService();
    this.nombaService = new NombaService();
    this.queueManager = QueueManager.getInstance();
    this.jobRepo = new BackgroundJobRepository();
    this.platformSettingService = new PlatformSettingService();
  }

  async getNotificationSettings(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const settings = await this.platformSettingService.getNotificationSettings();
    ResponseUtil.success(reply, settings);
  }

  async updateNotificationSettings(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const schema = z.object({
      smsEnabled: z.boolean(),
      emailEnabled: z.boolean(),
      whatsappEnabled: z.boolean(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError("Invalid settings");
    const result = await this.platformSettingService.updateNotificationSettings(parsed.data as NotificationSettingsDto, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async getDashboard(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const [metrics, revenue, charts, activities] = await Promise.all([
      this.adminService.getDashboardMetrics(),
      this.adminService.getRevenueAnalytics(),
      this.adminService.getChartData(),
      this.adminService.getRecentActivities(),
    ]);

    ResponseUtil.success(reply, { metrics, revenue, charts, activities });
  }

  // Users
  async listUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(request.query);
    const search = (request.query as { search?: string }).search;
    const result = await this.adminService.getUsers(page, limit, search);
    ResponseUtil.success(reply, result);
  }

  async getUserById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.adminService.getUserById(id);
    ResponseUtil.success(reply, result);
  }

  async updateUserStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = updateUserStatusSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError("Validation failed");
    const result = await this.adminService.updateUserStatus(id, parsed.data.status, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async verifyUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.adminService.verifyUser(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  // Groups
  async listGroups(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(request.query);
    const search = (request.query as { search?: string }).search;
    const result = await this.adminService.getGroups(page, limit, search);
    ResponseUtil.success(reply, result);
  }

  async getGroupById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.adminService.getGroupById(id);
    ResponseUtil.success(reply, result);
  }

  async updateGroupStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = updateGroupStatusSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError("Validation failed");
    const result = await this.adminService.updateGroupStatus(id, parsed.data.status, request.userId!);
    ResponseUtil.success(reply, result);
  }

  // Transactions
  async listTransactions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, ...filters } = transactionFilterSchema.parse(request.query);
    const result = await this.adminService.getTransactions(page, limit, filters);
    ResponseUtil.success(reply, result);
  }

  async getTransactionById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.adminService.getTransactionById(id);
    ResponseUtil.success(reply, result);
  }

  // Revenue
  async getRevenue(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.adminService.getRevenueAnalytics();
    ResponseUtil.success(reply, result);
  }

  // Withdrawals
  async listWithdrawals(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(request.query);
    const result = await this.adminService.getWithdrawals(page, limit);
    ResponseUtil.success(reply, result);
  }

  async updateWithdrawalStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = updateWithdrawalStatusSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError("Validation failed");
    await this.adminService.updateWithdrawalStatus(id, parsed.data.status, request.userId!);
    ResponseUtil.success(reply, { message: "Withdrawal status updated" });
  }

  // Security
  async listSecurityEvents(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(request.query);
    const result = await this.adminService.getSecurityEvents(page, limit);
    ResponseUtil.success(reply, result);
  }

  // Audit
  async listAuditLogs(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit } = paginationSchema.parse(request.query);
    const result = await this.adminService.getAuditLogs(page, limit);
    ResponseUtil.success(reply, result);
  }

  // Background Jobs
  async listJobs(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page = "1", limit = "20", status, queue } = request.query as { page?: string; limit?: string; status?: string; queue?: string };
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let jobs;
    if (status && queue) {
      const queueJobs = await this.jobRepo.findByQueue(queue, limitNum, offset);
      jobs = queueJobs.filter(j => j.status === status);
    } else if (status) {
      jobs = await this.jobRepo.findByStatus(status, limitNum, offset);
    } else if (queue) {
      jobs = await this.jobRepo.findByQueue(queue, limitNum, offset);
    } else {
      jobs = await this.jobRepo.findRecent(limitNum, offset);
    }

    ResponseUtil.success(reply, { jobs, page: pageNum, limit: limitNum });
  }

  async getJobById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const job = await this.jobRepo.findById(id);
    if (!job) {
      ResponseUtil.error(reply, "Job not found", "NOT_FOUND", 404);
      return;
    }
    ResponseUtil.success(reply, job);
  }

  async retryJob(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const job = await this.jobRepo.findById(id);
    if (!job) {
      ResponseUtil.error(reply, "Job not found", "NOT_FOUND", 404);
      return;
    }
    await this.queueManager.addJob(job.queue, job.type, (job.payload ?? {}) as Record<string, unknown>);
    ResponseUtil.success(reply, { message: "Job requeued" });
  }

  async getQueueStats(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const queueNames = ["email.queue", "notification.queue", "payment.queue", "webhook.queue", "nomba-auth", "nomba-payment", "nomba-webhook", "nomba-transfer", "nomba-reconciliation", "contribution.queue", "payout.queue", "reconciliation.queue", "report.queue", "analytics.queue", "security.queue"];
    const stats: Record<string, Record<string, number>> = {};

    for (const name of queueNames) {
      const counts = await this.queueManager.getJobCounts(name);
      stats[name] = counts;
    }

    ResponseUtil.success(reply, { queues: stats });
  }

  // Nomba Monitoring
  async getNombaStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const status = this.nombaService.getStatus();
    const connection = await this.nombaService.checkConnection();
    ResponseUtil.success(reply, { ...status, connection });
  }

  async getNombaTransactions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page = "1", limit = "20", status } = request.query as { page?: string; limit?: string; status?: string };
    const db = PrismaDatabase.getInstance().getClient();
    const where: Record<string, unknown> = { provider: "nomba" };
    if (status) where.status = status as never;

    const [data, total] = await Promise.all([
      db.payment.findMany({
        where: where as never,
        skip: (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        take: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        orderBy: { createdAt: "desc" },
      }),
      db.payment.count({ where: where as never }),
    ]);

    ResponseUtil.success(reply, {
      data: data.map(p => ({
        id: p.id,
        userId: p.userId,
        groupId: p.groupId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        providerReference: p.providerReference,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt.toISOString(),
      })),
      meta: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        total,
        totalPages: Math.ceil(total / Math.min(100, Math.max(1, parseInt(limit, 10) || 20))),
      },
    });
  }

  async getNombaWebhookEvents(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page = "1", limit = "20", eventStatus } = request.query as { page?: string; limit?: string; eventStatus?: string };
    const db = PrismaDatabase.getInstance().getClient();
    const where: Record<string, unknown> = { provider: "nomba" };
    if (eventStatus) where.status = eventStatus as never;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [data, total] = await Promise.all([
      db.webhookEvent.findMany({
        where: where as never,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      db.webhookEvent.count({ where: where as never }),
    ]);

    const mapped = data.map(w => {
      const ev = w as unknown as Record<string, unknown>;
      return {
        id: String(ev.id),
        eventId: ev.eventId ? String(ev.eventId) : null,
        eventType: String(ev.eventType),
        status: String(ev.status ?? "PENDING"),
        processed: Boolean(ev.processed),
        processedAt: ev.processedAt ? String(ev.processedAt) : null,
        createdAt: String(ev.createdAt),
      };
    });

    ResponseUtil.success(reply, {
      data: mapped,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  }

  async getNombaFailedPayments(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const db = PrismaDatabase.getInstance().getClient();
    const { page = "1", limit = "20" } = request.query as { page?: string; limit?: string };

    const where = { provider: "nomba", status: "FAILED" as never };
    const [data, total] = await Promise.all([
      db.payment.findMany({
        where,
        skip: (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        take: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        orderBy: { updatedAt: "desc" },
      }),
      db.payment.count({ where }),
    ]);

    ResponseUtil.success(reply, {
      data: data.map(p => ({
        id: p.id,
        userId: p.userId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        providerReference: p.providerReference,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt.toISOString(),
      })),
      meta: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        total,
        totalPages: Math.ceil(total / Math.min(100, Math.max(1, parseInt(limit, 10) || 20))),
      },
    });
  }

  async getNombaReconciliationResults(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page = "1", limit = "20", status } = request.query as { page?: string; limit?: string; status?: string };
    const db = PrismaDatabase.getInstance().getClient();
    const where: Record<string, unknown> = { provider: "nomba" };
    if (status) where.status = status as never;

    const [data, total] = await Promise.all([
      db.reconciliationRecord.findMany({
        where: where as never,
        skip: (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        take: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        orderBy: { createdAt: "desc" },
      }),
      db.reconciliationRecord.count({ where: where as never }),
    ]);

    ResponseUtil.success(reply, {
      data: data.map(r => ({
        id: r.id,
        provider: r.provider,
        providerReference: r.providerReference,
        internalReference: r.internalReference,
        amount: r.amount,
        status: r.status,
        difference: r.difference,
        resolvedBy: r.resolvedBy,
        resolvedAt: r.resolvedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      meta: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        total,
        totalPages: Math.ceil(total / Math.min(100, Math.max(1, parseInt(limit, 10) || 20))),
      },
    });
  }
}
