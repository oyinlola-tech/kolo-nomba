import type { FastifyReply, FastifyRequest } from "fastify";
import { NotificationService } from "../services/notification.service";
import { ResponseUtil } from "../utils/response.util";
import { updatePreferenceSchema } from "../validators/notification.validator";
import { ValidationError } from "../errors/validation.error";

export class NotificationController {
  private readonly notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.notificationService.getUserNotifications(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async unread(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.notificationService.getUnreadNotifications(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async markAsRead(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.notificationService.markAsRead(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async markAllAsRead(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.notificationService.markAllAsRead(request.userId!);
    ResponseUtil.success(reply, { message: "All notifications marked as read" });
  }

  async getPreferences(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.notificationService.getPreferences(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async updatePreferences(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = updatePreferenceSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.notificationService.updatePreferences(request.userId!, parsed.data);
    ResponseUtil.success(reply, result);
  }

  async getDeliveries(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { notificationId } = request.params as { notificationId: string };
    const result = await this.notificationService.getDeliveries(notificationId);
    ResponseUtil.success(reply, result);
  }

  async retryFailed(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const retried = await this.notificationService.retryFailedDeliveries();
    ResponseUtil.success(reply, { retried });
  }
}
