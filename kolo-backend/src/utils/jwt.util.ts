import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { EnvConfig } from "../config/env.config";

export interface JwtPayload {
  sub: string;
  role: string;
  [key: string]: unknown;
}

export class JwtUtil {
  private static get secret(): Uint8Array {
    return new TextEncoder().encode(EnvConfig.getInstance().JWT_SECRET);
  }

  private static get refreshSecret(): Uint8Array {
    return new TextEncoder().encode(EnvConfig.getInstance().JWT_REFRESH_SECRET);
  }

  static async signAccessToken(payload: JwtPayload): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(JwtUtil.secret);
  }

  static async signRefreshToken(payload: JwtPayload): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JwtUtil.refreshSecret);
  }

  static async verifyAccessToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, JwtUtil.secret);
    return payload as unknown as JwtPayload;
  }

  static async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, JwtUtil.refreshSecret);
    return payload as unknown as JwtPayload;
  }

  static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
