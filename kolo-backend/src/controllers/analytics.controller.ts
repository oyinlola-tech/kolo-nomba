import type { FastifyReply, FastifyRequest } from "fastify";
import { AnalyticsService } from "../services/analytics.service";
import { ResponseUtil } from "../utils/response.util";

export class AnalyticsController {
  private readonly analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async groupPaymentAnalytics(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const result = await this.analyticsService.getGroupPaymentAnalytics(groupId, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async memberPaymentAnalytics(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.analyticsService.getMemberPaymentAnalytics(request.userId!);
    ResponseUtil.success(reply, result);
  }
}
