import type { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/user.service";
import { ResponseUtil } from "../utils/response.util";
import { updateProfileSchema } from "../validators/user.validator";
import { changePasswordSchema } from "../validators/user.validator";
import { PasswordValidationService } from "../services/password.service";
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
    const parsed = changePasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const passwordValidation = new PasswordValidationService().validatePassword(parsed.data.newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message, { newPassword: [passwordValidation.message] });
    }

    await this.userService.changePassword(request.userId!, parsed.data.currentPassword, parsed.data.newPassword);
    ResponseUtil.success(reply, { message: "Password updated successfully" });
  }
}
