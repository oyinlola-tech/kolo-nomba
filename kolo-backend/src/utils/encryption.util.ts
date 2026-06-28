import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { EnvConfig } from "../config/env.config";

const ALGORITHM = "aes-256-gcm";

export class EncryptionUtil {
  private static getKey(): Buffer {
    const env = EnvConfig.getInstance();
    const secret = env.ENCRYPTION_KEY || env.JWT_REFRESH_SECRET;
    return Buffer.from(secret.padEnd(32, "x").slice(0, 32));
  }

  static encrypt(text: string): string {
    const key = EncryptionUtil.getKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  static decrypt(encryptedText: string): string {
    const key = EncryptionUtil.getKey();
    const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  }
}
