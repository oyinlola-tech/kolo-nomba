import type { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/user.service";
import { ResponseUtil } from "../utils/response.util";
import { updateProfileSchema } from "../validators/user.validator";
import { ValidationError } from "../errors/validation.error";

export class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const profile = await this.userService.getProfile(request.userId!);
    ResponseUtil.success(reply, profile);
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const profile = await this.userService.updateProfile(request.userId!, parsed.data);
    ResponseUtil.success(reply, profile);
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { currentPassword, newPassword } = request.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      throw new ValidationError("Current password and new password are required");
    }

    if (newPassword.length < 8) {
      throw new ValidationError("New password must be at least 8 characters");
    }

    await this.userService.changePassword(request.userId!, currentPassword, newPassword);
    ResponseUtil.success(reply, { message: "Password updated successfully" });
  }
}
