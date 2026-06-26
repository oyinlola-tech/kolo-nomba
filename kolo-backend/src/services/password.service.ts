import { Logger } from "../logger/core/logger";
import { EnvConfig } from "../config/env.config";

export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  strength?: string;
  requirements?: string[];
}

export class PasswordValidationService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("password-validation");
  }

  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password) {
      return {
        valid: false,
        message: "Password is required",
        requirements: ["Password cannot be empty"],
      };
    }

    const config = EnvConfig.getInstance();
    const minLength = 12;

    if (password.length < minLength) {
      errors.push(
        `Password must be at least ${minLength} characters long (current: ${password.length})`
      );
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one digit");
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push("Password must contain at least one special character (@$!%*?&)");
    }

    const commonPatterns = [
      /password/i,
      /123456|12345678|123456789|12345678|qwerty|admin/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push("Password contains common or weak patterns");
        break;
      }
    }

    const strength = this.calculatePasswordStrength(password);

    if (errors.length > 0) {
      this.logger.warn("Password validation failed", {
        passwordLength: password.length,
        errors,
        strength,
      });

      return {
        valid: false,
        message: errors[0],
        strength,
        requirements: errors,
      };
    }

    this.logger.debug("Password validation passed", { strength });
    return {
      valid: true,
      message: "Password meets strength requirements",
      strength,
    };
  }

  private calculatePasswordStrength(password: string): string {
    let score = 0;

    if (password.length >= 12) score += 25;
    else if (password.length >= 10) score += 15;

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;

    if (/[0-9]/.test(password) && /[@$!%*?&]/.test(password)) score += 25;

    if (!/(.)\1{2,}/.test(password)) score += 15;

    if (!/123456789|abcdefghijklmno|qwertyuiop/.test(password.toLowerCase()))
      score += 10;

    if (score >= 80) return "strong";
    if (score >= 60) return "good";
    if (score >= 40) return "fair";
    return "weak";
  }
}
