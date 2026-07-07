import { createHash } from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { VirtualAccountRepository } from "../repositories/virtual-account.repository";
import { PasswordValidationService } from "../services/password.service";
import { VirtualAccountService } from "../services/virtual-account.service";
import { AuditService } from "./audit.service";
import { EmailService } from "./email.service";
import { OtpService } from "./otp.service";
import { QueueManager } from "../jobs/queue-manager";
import { EventBus } from "../events/core/event-bus";
import { UserEvent, GenericEvent } from "../events/core/event";
import { HashUtil } from "../utils/hash.util";
import { JwtUtil } from "../utils/jwt.util";
import { DateUtil } from "../utils/date.util";
import { AuthError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import { PrismaDatabase } from "../database/prisma";
import { RedisClient } from "../database/redis";
import { GroupRepository } from "../repositories/group.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import type { RegisterDto, LoginDto, LoginResponse, TokenResponse } from "../dto/auth.dto";
import type { UserProfileResponse } from "../dto/user.dto";
import { Logger } from "../logger/core/logger";

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly groupRepository: GroupRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly virtualAccountRepository: VirtualAccountRepository;
  private readonly auditService: AuditService;
  private readonly otpService: OtpService;
  private readonly eventBus: EventBus;
  private readonly logger: Logger;

  constructor() {
    this.userRepository = new UserRepository();
    this.groupRepository = new GroupRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.virtualAccountRepository = new VirtualAccountRepository();
    this.auditService = new AuditService();
    this.otpService = new OtpService();
    this.eventBus = EventBus.getInstance();
    this.logger = new Logger("auth-service");
  }

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<{ userId: string }> {
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ValidationError("Registration failed. Please check your information and try again.", { email: ["This email is already registered"] });
    }

    const existingPhone = await this.userRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ValidationError("Registration failed. Please check your information and try again.", { phone: ["This phone number is already registered"] });
    }
    // Validate password strength
    const passwordValidation = new PasswordValidationService().validatePassword(dto.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message, { password: [passwordValidation.message] });
    }

    const passwordHash = await HashUtil.hashPassword(dto.password);

    const user = await this.userRepository.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    await this.otpService.invalidatePrevious(user.id);
    const code = await this.otpService.create(user.id);

    QueueManager.getInstance().addJob("email.queue", "send-email", {
      userId: user.id,
      template: "accountVerification",
      vars: { firstName: user.firstName, verificationCode: code },
    }).catch(err => this.logger.error("Failed to queue verification email", { userId: user.id, error: String(err) }));

    await this.eventBus.publish(new UserEvent("verification_required", {
      userId: user.id,
    }));

    await this.auditService.log("USER_REGISTERED", {
      userId: user.id,
      ipAddress,
      userAgent,
    });

    this.logger.info("User registered", { userId: user.id, email: user.email });

    return { userId: user.id };
  }

  async verifyEmailOtp(userId: string, code: string, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const valid = await this.otpService.verify(userId, code);
    if (!valid) {
      throw new ValidationError("Invalid or expired verification code");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    if (user.status !== "PENDING") {
      throw new ValidationError("Account is already verified");
    }

    await this.userRepository.updateStatus(user.id, "ACTIVE");

    this.provisionVirtualAccountWithTimeout(user).catch(err =>
      this.logger.error("Failed to provision virtual account", { userId: user.id, error: String(err) })
    );

    const tokens = await this.generateTokens(user.id, user.role);
    await this.createSession(user.id, tokens.refreshToken);

    await this.eventBus.publish(new UserEvent("verified", { userId: user.id }));

    await this.auditService.log("EMAIL_VERIFIED", {
      userId: user.id,
      ipAddress,
      userAgent,
    });

    this.logger.info("Email verified", { userId: user.id });

    return {
      user: this.mapUser({ ...user, status: "ACTIVE" }),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: user.role,
    };
  }

  async resendOtp(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    if (user.status !== "PENDING") {
      throw new ValidationError("Account is already active");
    }

    await this.otpService.invalidatePrevious(user.id);
    const code = await this.otpService.create(user.id);

    QueueManager.getInstance().addJob("email.queue", "send-email", {
      userId: user.id,
      template: "accountVerification",
      vars: { firstName: user.firstName, verificationCode: code },
    }).catch(err => this.logger.error("Failed to queue resend OTP email", { userId: user.id, error: String(err) }));

    this.logger.info("OTP resent", { userId: user.id });
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse | { challengeId: string; email: string }> {
    const user = await this.userRepository.findByEmailOrPhone(dto.email);
    if (!user) {
      await this.auditService.log("LOGIN_FAILED", {
        metadata: { email: dto.email, reason: "user_not_found" },
        ipAddress,
        userAgent,
      });
      throw new AuthError("Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      this.logger.warn("Account still locked", { userId: user.id, lockedUntil: user.lockedUntil });
      throw new AuthError("Account is temporarily locked. Please try again later.");
    }

    if (user.status === "SUSPENDED") {
      throw new AuthError("Account is suspended. Please contact support.");
    }

    const passwordValid = await HashUtil.verifyPassword(user.passwordHash, dto.password);
    if (!passwordValid) {
      await this.auditService.log("LOGIN_FAILED", {
        userId: user.id,
        metadata: { reason: "wrong_password" },
        ipAddress,
        userAgent,
      });
      const failCount = await this.auditService.getRecentFailureCount(user.id, 15);
      if (failCount >= 5) {
        const db = PrismaDatabase.getInstance().getClient();
        await db.user.update({
          where: { id: user.id },
          data: { status: "SUSPENDED", lockedUntil: DateUtil.addMinutes(new Date(), 30) } as never,
        });
        this.logger.warn("Account locked due to failed login attempts", { userId: user.id });
        throw new AuthError("Account is temporarily locked. Please try again later.");
      }
      throw new AuthError("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      await this.auditService.log("LOGIN_FAILED", {
        userId: user.id,
        metadata: { reason: `account_${user.status.toLowerCase()}` },
        ipAddress,
        userAgent,
      });
      throw new AuthError("Account is not active. Please contact support.");
    }

    const db = PrismaDatabase.getInstance().getClient();
    const deviceHash = OtpService.deviceHash(userAgent, ipAddress);

    const knownDevice = await db.session.findFirst({
      where: { userId: user.id, deviceHash },
    });

    if (!knownDevice) {
      await this.otpService.invalidatePrevious(user.id, "LOGIN_CHALLENGE");
      const code = await this.otpService.create(user.id, "LOGIN_CHALLENGE");

      QueueManager.getInstance().addJob("email.queue", "send-email", {
        userId: user.id,
        template: "accountVerification",
        vars: { firstName: user.firstName, verificationCode: code },
      }).catch(err => this.logger.error("Failed to queue login challenge email", { userId: user.id, error: String(err) }));

      new EmailService().sendNotificationEmail({
        userId: user.id,
        template: "accountVerification",
        vars: { firstName: user.firstName, verificationCode: code },
      }).catch(err => this.logger.error("Failed to send login challenge email directly", { userId: user.id, error: String(err) }));

      this.logger.info(`Login challenge sent - OTP code: ${code} for user ${user.id}`);
      return { challengeId: user.id, email: user.email };
    }

    return this.issueLoginTokens(user, ipAddress, userAgent, deviceHash);
  }

  async verifyLoginOtp(userId: string, code: string, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const valid = await this.otpService.verify(userId, code, "LOGIN_CHALLENGE");
    if (!valid) {
      throw new ValidationError("Invalid or expired verification code");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    if (user.status !== "ACTIVE") {
      throw new AuthError("Account is not active");
    }

    const deviceHash = OtpService.deviceHash(userAgent, ipAddress);
    return this.issueLoginTokens(user, ipAddress, userAgent, deviceHash);
  }

  private async issueLoginTokens(user: { id: string; firstName: string; lastName: string; email: string; phone: string; role: string; status: string }, ipAddress?: string, userAgent?: string, deviceHash?: string): Promise<LoginResponse> {
    const tokens = await this.generateTokens(user.id, user.role);
    await this.createSession(user.id, tokens.refreshToken, deviceHash);

    await this.auditService.log("LOGIN_SUCCESS", {
      userId: user.id,
      ipAddress,
      userAgent,
    });

    this.logger.info("User logged in", { userId: user.id });

    return {
      user: this.mapUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: user.role,
    };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<TokenResponse> {
    try {
      await JwtUtil.verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthError("Invalid or expired refresh token");
    }

    const db = PrismaDatabase.getInstance().getClient();
    const tokenHash = AuthService.hashToken(refreshToken);
    const session = await db.session.findUnique({
      where: { refreshToken: tokenHash },
      include: { user: true },
    });

    if (!session) {
      throw new AuthError("Refresh token session not found");
    }

    if (DateUtil.isExpired(session.expiresAt)) {
      await db.session.delete({ where: { id: session.id } });
      throw new AuthError("Refresh token has expired");
    }

    if (session.user.status !== "ACTIVE") {
      await db.session.delete({ where: { id: session.id } });
      throw new AuthError("Account is not active");
    }

    await db.session.delete({ where: { id: session.id } });

    const tokens = await this.generateTokens(session.user.id, session.user.role);
    await this.createSession(session.user.id, tokens.refreshToken);

    await this.auditService.log("TOKEN_REFRESHED", {
      userId: session.user.id,
      ipAddress,
      userAgent,
    });

    return tokens;
  }

  async logout(refreshToken: string, userId?: string, accessToken?: string): Promise<void> {
    const db = PrismaDatabase.getInstance().getClient();
    const tokenHash = AuthService.hashToken(refreshToken);
    const session = await db.session.findUnique({ where: { refreshToken: tokenHash } });

    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }

    if (accessToken) {
      try {
        const redis = RedisClient.getInstance().getClient();
        if (redis) {
          const accessHash = JwtUtil.hashToken(accessToken);
          await redis.set(`blacklist:${accessHash}`, "1", "EX", 900);
        }
      } catch {
        this.logger.warn("Failed to blacklist access token", { userId: userId ?? session?.userId });
      }
    }

    await this.auditService.log("LOGOUT", {
      userId: userId ?? session?.userId,
    });

    this.logger.info("User logged out", { userId: userId ?? session?.userId });
  }

  async getProfile(userId: string): Promise<UserProfileResponse & { virtualAccount?: { accountNumber: string; accountName: string; bankName: string } | null }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    const accounts = await this.virtualAccountRepository.findByOwner("USER", userId);
    const activeAccount = accounts.find(a => a.status === "ACTIVE");

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      virtualAccount: activeAccount ? {
        accountNumber: activeAccount.accountNumber,
        accountName: activeAccount.accountName,
        bankName: activeAccount.bankName,
      } : null,
    };
  }

  private async generateTokens(userId: string, role: string): Promise<TokenResponse> {
    const payload = { sub: userId, role };
    const [accessToken, refreshToken] = await Promise.all([
      JwtUtil.signAccessToken(payload),
      JwtUtil.signRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private async createSession(userId: string, refreshToken: string, deviceHash?: string): Promise<void> {
    const db = PrismaDatabase.getInstance().getClient();
    await db.session.create({
      data: {
        userId,
        refreshToken: AuthService.hashToken(refreshToken),
        deviceHash: deviceHash ?? null,
        expiresAt: DateUtil.addDays(new Date(), 7),
      },
    });
  }

  private static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private mapUser(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
  }) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.info("Password reset requested for non-existent email", { email });
      return;
    }

    await this.otpService.invalidatePrevious(user.id, "PASSWORD_RESET");
    const code = await this.otpService.create(user.id, "PASSWORD_RESET");

    QueueManager.getInstance().addJob("email.queue", "send-email", {
      userId: user.id,
      template: "passwordReset",
      vars: { firstName: user.firstName, verificationCode: code },
    }).catch(err => this.logger.error("Failed to queue password reset email", { userId: user.id, error: String(err) }));

    await this.eventBus.publish(new GenericEvent("password.reset_requested", {
      userId: user.id,
    }));

    this.logger.info("Password reset code sent", { userId: user.id });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError("Invalid or expired reset code");
    }

    const valid = await this.otpService.verify(user.id, code, "PASSWORD_RESET");
    if (!valid) {
      throw new ValidationError("Invalid or expired reset code");
    }

    const validation = new PasswordValidationService().validatePassword(newPassword);
    if (!validation.valid) {
      throw new ValidationError(validation.message, { password: [validation.message] });
    }

    const newHash = await HashUtil.hashPassword(newPassword);
    await this.userRepository.updatePassword(user.id, newHash);

    const db = PrismaDatabase.getInstance().getClient();
    await db.session.deleteMany({ where: { userId: user.id } });

    await this.auditService.log("PASSWORD_RESET", {
      userId: user.id,
    });

    await this.eventBus.publish(new GenericEvent("password.changed", {
      userId: user.id,
    }));

    this.logger.info("Password reset successfully", { userId: user.id });
  }

  private async provisionVirtualAccountWithTimeout(user: { id: string; firstName: string; lastName: string }): Promise<void> {
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("Virtual account provisioning timeout")), 5000)
    );

    try {
      const vaService = new VirtualAccountService();
      await Promise.race([
        vaService.createVirtualAccount({
          accountName: `${user.firstName} ${user.lastName}`,
          ownerType: "USER",
          ownerId: user.id,
        }),
        timeoutPromise,
      ]);
    } catch (error) {
      this.logger.error("Virtual account provisioning failed", { userId: user.id, error: String(error) });
      throw error;
    }
  }

  async createCooperativeAfterRegistration(userId: string, coopName: string): Promise<void> {
    const group = await this.groupRepository.create({
      name: coopName,
      createdBy: userId,
    });
    await this.groupMemberRepository.create({
      groupId: group.id,
      userId,
      role: "GROUP_OWNER",
      status: "ACTIVE",
    });
    this.logger.info("Cooperative auto-created after registration", { userId, groupId: group.id, name: coopName });
  }
}
