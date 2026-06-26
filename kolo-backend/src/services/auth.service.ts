import { createHash } from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { PasswordValidationService } from "../services/password.service";
import { AuditService } from "./audit.service";
import { HashUtil } from "../utils/hash.util";
import { JwtUtil } from "../utils/jwt.util";
import { DateUtil } from "../utils/date.util";
import { AuthError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import { PrismaDatabase } from "../database/prisma";
import type { RegisterDto, LoginDto, LoginResponse, TokenResponse } from "../dto/auth.dto";
import type { UserProfileResponse } from "../dto/user.dto";
import { Logger } from "../logger/core/logger";

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
    this.logger = new Logger("auth-service");
  }

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ValidationError("Email already registered", { email: ["Email is already in use"] });
    }

    const existingPhone = await this.userRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ValidationError("Phone already registered", { phone: ["Phone number is already in use"] });
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

    const tokens = await this.generateTokens(user.id, user.role);

    await this.createSession(user.id, tokens.refreshToken);

    await this.auditService.log("USER_REGISTERED", {
      userId: user.id,
      ipAddress,
      userAgent,
    });

    this.logger.info("User registered", { userId: user.id, email: user.email });

    return {
      user: this.mapUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: user.role,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmailOrPhone(dto.email);
    if (!user) {
      await this.auditService.log("LOGIN_FAILED", {
        metadata: { email: dto.email, reason: "user_not_found" },
        ipAddress,
        userAgent,
      });
      throw new AuthError("Invalid email or password");
    }

    const passwordValid = await HashUtil.verifyPassword(user.passwordHash, dto.password);
    if (!passwordValid) {
      await this.auditService.log("LOGIN_FAILED", {
        userId: user.id,
        metadata: { reason: "wrong_password" },
        ipAddress,
        userAgent,
      });
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

    const tokens = await this.generateTokens(user.id, user.role);

    await this.createSession(user.id, tokens.refreshToken);

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

  async logout(refreshToken: string, userId?: string): Promise<void> {
    const db = PrismaDatabase.getInstance().getClient();
    const tokenHash = AuthService.hashToken(refreshToken);
    const session = await db.session.findUnique({ where: { refreshToken: tokenHash } });

    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }

    await this.auditService.log("LOGOUT", {
      userId: userId ?? session?.userId,
    });

    this.logger.info("User logged out", { userId: userId ?? session?.userId });
  }

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
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

  private async createSession(userId: string, refreshToken: string): Promise<void> {
    const db = PrismaDatabase.getInstance().getClient();
    await db.session.create({
      data: {
        userId,
        refreshToken: AuthService.hashToken(refreshToken),
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
}
