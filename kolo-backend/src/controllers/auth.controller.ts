import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { ResponseUtil } from "../utils/response.util";
import { registerSchema, loginSchema, refreshTokenSchema } from "../validators/auth.validator";
import { ValidationError } from "../errors/validation.error";

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"];

    const result = await this.authService.register(parsed.data, ipAddress, userAgent);
    ResponseUtil.created(reply, result);
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"];

    const result = await this.authService.login(parsed.data, ipAddress, userAgent);
    ResponseUtil.success(reply, result);
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = refreshTokenSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError("Refresh token is required");
    }

    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"];

    const tokens = await this.authService.refresh(parsed.data.refreshToken, ipAddress, userAgent);
    ResponseUtil.success(reply, tokens);
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = refreshTokenSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError("Refresh token is required");
    }

    await this.authService.logout(parsed.data.refreshToken, request.userId);
    ResponseUtil.success(reply, { message: "Logged out successfully" });
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const profile = await this.authService.getProfile(request.userId!);
    ResponseUtil.success(reply, profile);
  }
}
