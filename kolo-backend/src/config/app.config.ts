import { EnvConfig } from "./env.config";

export class AppConfig {
  private readonly env: EnvConfig;

  constructor() {
    this.env = EnvConfig.getInstance();
  }

  get port(): number {
    return this.env.PORT;
  }

  get nodeEnv(): string {
    return this.env.NODE_ENV;
  }

  get isDevelopment(): boolean {
    return this.env.isDevelopment;
  }

  get isProduction(): boolean {
    return this.env.isProduction;
  }

  get corsOrigin(): string {
    return this.env.CORS_ORIGIN;
  }

  get cookieSecret(): string {
    return this.env.COOKIE_SECRET;
  }

  get rateLimitMax(): number {
    return this.env.RATE_LIMIT_MAX;
  }

  get logLevel(): string {
    return this.env.LOG_LEVEL;
  }

  get apiPrefix(): string {
    return "/v1";
  }

  get swaggerPath(): string {
    return "/docs";
  }

  get frontendUrl(): string {
    return this.env.FRONTEND_URL;
  }

  get adminFrontendUrl(): string {
    return this.env.ADMIN_FRONTEND_URL;
  }

  get allowedOrigins(): string[] {
    const origins: string[] = [this.frontendUrl, this.adminFrontendUrl];
    if (this.corsOrigin && this.corsOrigin !== "*") {
      for (const o of this.corsOrigin.split(",")) {
        origins.push(o.trim());
      }
    }
    return [...new Set(origins)];
  }
}
