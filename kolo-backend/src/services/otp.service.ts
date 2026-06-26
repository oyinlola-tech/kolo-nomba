import { randomInt, createHash } from "crypto";
import { PrismaDatabase } from "../database/prisma";
import { DateUtil } from "../utils/date.util";
import { ValidationError } from "../errors/validation.error";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;

export class OtpService {
  generateCode(): string {
    return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
  }

  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  async create(userId: string, type = "EMAIL_VERIFICATION", channel = "EMAIL"): Promise<string> {
    const db = PrismaDatabase.getInstance().getClient();

    const lastOtp = await db.otpCode.findFirst({
      where: { userId, type, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp) {
      const elapsed = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (elapsed < RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed);
        throw new ValidationError(`Please wait ${remaining} seconds before requesting a new code`);
      }
    }

    const code = this.generateCode();
    const codeHash = this.hashCode(code);

    await db.otpCode.create({
      data: {
        userId,
        codeHash,
        type,
        channel,
        expiresAt: DateUtil.addMinutes(new Date(), OTP_EXPIRY_MINUTES),
      },
    });

    return code;
  }

  async verify(userId: string, code: string, type = "EMAIL_VERIFICATION"): Promise<boolean> {
    const db = PrismaDatabase.getInstance().getClient();

    const existing = await db.otpCode.findFirst({
      where: {
        userId,
        type,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!existing) {
      return false;
    }

    if (existing.lockedUntil && existing.lockedUntil > new Date()) {
      const remaining = Math.ceil((existing.lockedUntil.getTime() - Date.now()) / 1000);
      throw new ValidationError(`Too many attempts. Try again in ${remaining} seconds`);
    }

    const codeHash = this.hashCode(code);

    if (existing.codeHash !== codeHash) {
      const newAttempts = existing.attemptCount + 1;
      const updateData: Record<string, unknown> = { attemptCount: newAttempts };

      if (newAttempts >= MAX_ATTEMPTS) {
        updateData.lockedUntil = DateUtil.addMinutes(new Date(), LOCKOUT_MINUTES);
      }

      await db.otpCode.update({
        where: { id: existing.id },
        data: updateData as never,
      });

      if (newAttempts >= MAX_ATTEMPTS) {
        throw new ValidationError("Too many failed attempts. Code locked for 15 minutes");
      }

      return false;
    }

    await db.otpCode.update({
      where: { id: existing.id },
      data: { used: true },
    });

    return true;
  }

  async invalidatePrevious(userId: string, type = "EMAIL_VERIFICATION"): Promise<void> {
    const db = PrismaDatabase.getInstance().getClient();
    await db.otpCode.updateMany({
      where: { userId, type, used: false },
      data: { used: true },
    });
  }

  static deviceHash(userAgent?: string, ip?: string): string {
    const raw = `${userAgent ?? ""}|${ip ?? ""}`;
    return createHash("sha256").update(raw).digest("hex");
  }
}
