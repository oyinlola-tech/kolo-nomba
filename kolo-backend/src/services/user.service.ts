import { UserRepository } from "../repositories/user.repository";
import { AuditService } from "./audit.service";
import { PasswordValidationService } from "./password.service";
import { HashUtil } from "../utils/hash.util";
import { AuthError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import type { UpdateProfileDto, UserProfileResponse } from "../dto/user.dto";
import { PrismaDatabase } from "../database/prisma";
import { Logger } from "../logger/core/logger";

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
    this.logger = new Logger("user-service");
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

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.userRepository.findByPhone(dto.phone);
      if (existing) {
        throw new ValidationError("Phone already in use", { phone: ["Phone number is already taken"] });
      }
    }

    const updated = await this.userRepository.update(userId, dto);

    await this.auditService.log("PROFILE_UPDATED", { userId });

    this.logger.info("Profile updated", { userId });

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    const valid = await HashUtil.verifyPassword(user.passwordHash, currentPassword);
    if (!valid) {
      throw new AuthError("Current password is incorrect");
    }

    const validation = new PasswordValidationService().validatePassword(newPassword);
    if (!validation.valid) {
      throw new ValidationError(validation.message, validation.requirements);
    }

    const newHash = await HashUtil.hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, newHash);

    const db = PrismaDatabase.getInstance().getClient();
    await db.session.deleteMany({ where: { userId } });

    await this.auditService.log("PASSWORD_CHANGED", { userId, metadata: { sessionsRevoked: true } });

    this.logger.info("Password changed, sessions revoked", { userId });
  }
}
