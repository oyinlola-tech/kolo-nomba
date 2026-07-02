import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { ResponseUtil } from "../utils/response.util";
import { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator";
import { ValidationError } from "../errors/validation.error";
import { EnvConfig } from "../config/env.config";
import { Logger } from "../logger/core/logger";

const REFRESH_COOKIE = "refreshToken";
const COOKIE_PATH = "/v1/auth";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export class AuthController {
  private readonly authService: AuthService;
  private readonly env: EnvConfig;
  private readonly logger: Logger;

  constructor() {
    this.authService = new AuthService();
    this.env = EnvConfig.getInstance();
    this.logger = new Logger("auth-controller");
  }

  private domain(): string | undefined {
    return this.env.COOKIE_DOMAIN || undefined;
  }

  private setRefreshCookie(reply: FastifyReply, token: string): void {
    reply.setCookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.env.COOKIE_SECURE,
      sameSite: this.env.COOKIE_SAME_SITE,
      path: COOKIE_PATH,
      maxAge: COOKIE_MAX_AGE,
      domain: this.domain(),
    });
  }

  private clearRefreshCookie(reply: FastifyReply): void {
    reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH, domain: this.domain() });
  }

  private assertCookieOrigin(request: FastifyRequest): void {
    if (this.env.isDevelopment) return;
    const rawOrigin = request.headers.origin ?? request.headers.referer;
    if (!rawOrigin) {
      throw new ValidationError("Missing Origin or Referer header");
    }
    let parsedOrigin: string;
    try {
      parsedOrigin = new URL(rawOrigin).origin;
    } catch {
      throw new ValidationError("Invalid Origin or Referer header");
    }
    const normalizedAllowed: string[] = [];
    for (const url of [this.env.FRONTEND_URL, this.env.ADMIN_FRONTEND_URL]) {
      try { normalizedAllowed.push(new URL(url).origin); } catch { normalizedAllowed.push(url); }
    }
    if (this.env.CORS_ORIGIN && this.env.CORS_ORIGIN !== "*") {
      for (const o of this.env.CORS_ORIGIN.split(",")) {
        const trimmed = o.trim();
        try { normalizedAllowed.push(new URL(trimmed).origin); } catch { normalizedAllowed.push(trimmed); }
      }
    }
    if (!normalizedAllowed.includes(parsedOrigin)) {
      if (!parsedOrigin.endsWith(".vercel.app") && !parsedOrigin.endsWith(".telente.site") && !parsedOrigin.startsWith("http://localhost")) {
        throw new ValidationError("Invalid request origin");
      }
    }
    if (request.headers["x-requested-with"] !== "XMLHttpRequest") {
      throw new ValidationError("Missing anti-CSRF header");
    }
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
    if (parsed.data.coopName && result.userId) {
      try {
        await this.authService.createCooperativeAfterRegistration(result.userId, parsed.data.coopName);
      } catch {
        this.logger.warn("Cooperative auto-creation failed after registration", { userId: result.userId });
      }
    }
    ResponseUtil.created(reply, {
      userId: result.userId,
      message: "Account created. Check your email for verification code.",
    });
  }

  async verifyOtp(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = verifyOtpSchema.safeParse(request.body);
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

    const result = await this.authService.verifyEmailOtp(parsed.data.userId, parsed.data.code, ipAddress, userAgent);
    this.setRefreshCookie(reply, result.refreshToken);
    ResponseUtil.success(reply, {
      user: result.user,
      accessToken: result.accessToken,
      role: result.role,
    });
  }

  async resendOtp(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = resendOtpSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    await this.authService.resendOtp(parsed.data.userId);
    ResponseUtil.success(reply, { message: "Verification code resent to your email." });
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

    if ("challengeId" in result) {
      ResponseUtil.success(reply, {
        challengeId: result.challengeId,
        email: result.email.replace(/(.{3}).+(@.+)/, "$1•••$2"),
        type: "login_challenge",
      });
      return;
    }

    this.setRefreshCookie(reply, result.refreshToken);
    ResponseUtil.success(reply, {
      user: result.user,
      accessToken: result.accessToken,
      role: result.role,
    });
  }

  async verifyLoginOtp(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = verifyOtpSchema.safeParse(request.body);
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

    const result = await this.authService.verifyLoginOtp(parsed.data.userId, parsed.data.code, ipAddress, userAgent);
    this.setRefreshCookie(reply, result.refreshToken);
    ResponseUtil.success(reply, {
      user: result.user,
      accessToken: result.accessToken,
      role: result.role,
    });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.assertCookieOrigin(request);
    const refreshToken = request.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"];

    const tokens = await this.authService.refresh(refreshToken, ipAddress, userAgent);
    this.setRefreshCookie(reply, tokens.refreshToken);
    ResponseUtil.success(reply, {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.assertCookieOrigin(request);
    const refreshToken = request.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      await this.authService.logout(refreshToken, request.userId, request.accessToken);
    }
    this.clearRefreshCookie(reply);
    ResponseUtil.success(reply, { message: "Logged out successfully" });
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const profile = await this.authService.getProfile(request.userId!);
    ResponseUtil.success(reply, profile);
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    await this.authService.forgotPassword(parsed.data.email);
    ResponseUtil.success(reply, {
      message: "If the email exists, a reset code has been sent.",
    });
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    await this.authService.resetPassword(parsed.data.email, parsed.data.code, parsed.data.newPassword);
    ResponseUtil.success(reply, {
      message: "Password reset successfully. Please log in with your new password.",
    });
  }
}
