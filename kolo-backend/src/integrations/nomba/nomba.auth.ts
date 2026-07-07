import { QueueManager } from "../../jobs/queue-manager";
import { Logger } from "../../logger/core/logger";
import { NombaConfig } from "../../config/nomba.config";

interface NombaTokenResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  expires_in?: number;
  expiresIn?: number;
  data?: {
    access_token?: string;
    accessToken?: string;
    token?: string;
    expires_in?: number;
    expiresIn?: number;
  };
}

export class NombaAuthService {
  private readonly config = new NombaConfig().runtime;
  private readonly logger = new Logger("nomba-auth");
  private readonly tokenKey = `nomba:${this.config.environment}:access-token:${this.config.parentAccountId}`;

  async getAccessToken(): Promise<string> {
    const redis = QueueManager.getInstance().getConnection();
    if (redis) {
      const cached = await redis.get(this.tokenKey);
      if (cached) return cached;
    }

    const token = await this.authenticate();
    if (redis) {
      await redis.set(this.tokenKey, token.accessToken, "EX", token.ttlSeconds);
    }
    return token.accessToken;
  }

  async refreshAccessToken(): Promise<string> {
    const redis = QueueManager.getInstance().getConnection();
    if (redis) {
      await redis.del(this.tokenKey);
    }
    return this.getAccessToken();
  }

  private async authenticate(): Promise<{ accessToken: string; ttlSeconds: number }> {
    const started = Date.now();
    const response = await fetch(`${this.config.baseUrl}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.config.clientId,
        clientId: this.config.clientId,
        private_key: this.config.privateKey,
        privateKey: this.config.privateKey,
        accountId: this.config.parentAccountId,
      }),
    });

    if (!response.ok) {
      this.logger.error("Nomba authentication failed", {
        status: response.status,
        durationMs: Date.now() - started,
      });
      throw new Error(`Nomba authentication failed: ${response.status}`);
    }

    const body = await response.json() as NombaTokenResponse;
    const data = body.data ?? body;
    const accessToken = data.access_token ?? data.accessToken ?? data.token;
    if (!accessToken) {
      throw new Error("Nomba authentication response did not include an access token");
    }

    const expiresIn = data.expires_in ?? data.expiresIn ?? 3600;
    const ttlSeconds = Math.max(60, Number(expiresIn) - 60);

    this.logger.info("Nomba token refreshed", {
      environment: this.config.environment,
      durationMs: Date.now() - started,
      ttlSeconds,
    });

    return { accessToken, ttlSeconds };
  }
}
