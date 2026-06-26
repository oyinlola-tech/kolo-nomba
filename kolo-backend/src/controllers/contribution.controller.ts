import type { FastifyReply, FastifyRequest } from "fastify";
import { ContributionPlanService } from "../services/contribution-plan.service";
import { ContributionCycleService } from "../services/contribution-cycle.service";
import { MemberContributionService } from "../services/member-contribution.service";
import { ResponseUtil } from "../utils/response.util";
import { createContributionPlanSchema, updateContributionPlanSchema } from "../validators/contribution.validator";
import { ValidationError } from "../errors/validation.error";

export class ContributionController {
  private readonly planService: ContributionPlanService;
  private readonly cycleService: ContributionCycleService;
  private readonly memberContributionService: MemberContributionService;

  constructor() {
    this.planService = new ContributionPlanService();
    this.cycleService = new ContributionCycleService();
    this.memberContributionService = new MemberContributionService();
  }

  async createPlan(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const parsed = createContributionPlanSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.planService.createPlan(parsed.data, groupId, request.userId!);
    ResponseUtil.created(reply, result);
  }

  async listPlans(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const result = await this.planService.getPlans(groupId);
    ResponseUtil.success(reply, result);
  }

  async getPlanById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.planService.getPlanById(id, request.userId);
    ResponseUtil.success(reply, result);
  }

  async updatePlan(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = updateContributionPlanSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.planService.updatePlan(id, parsed.data, request.userId);
    ResponseUtil.success(reply, result);
  }

  async deletePlan(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await this.planService.deletePlan(id, request.userId);
    ResponseUtil.noContent(reply);
  }

  async listCycles(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.planService.getCycles(id, request.userId);
    ResponseUtil.success(reply, result);
  }

  async getCycleById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.cycleService.getCycleById(id, request.userId);
    ResponseUtil.success(reply, result);
  }

  async getMyContributions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.memberContributionService.getMyContributions(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async getGroupContributions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { groupId } = request.params as { groupId: string };
    const result = await this.memberContributionService.getGroupContributions(groupId, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async getContributionById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.memberContributionService.getContributionById(id, request.userId);
    ResponseUtil.success(reply, result);
  }

  async getDashboard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.cycleService.getDashboard(id, request.userId);
    ResponseUtil.success(reply, result);
  }
}
