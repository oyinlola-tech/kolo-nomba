export class EnvConfig {
  private static instance: EnvConfig;

  public readonly DATABASE_URL: string;
  public readonly JWT_SECRET: string;
  public readonly JWT_REFRESH_SECRET: string;
  public readonly PORT: number;
  public readonly NODE_ENV: string;
  public readonly CORS_ORIGIN: string;
  public readonly RATE_LIMIT_MAX: number;
  public readonly LOG_LEVEL: string;
  public readonly NOMBA_ENVIRONMENT: "test" | "live";
  public readonly NOMBA_PARENT_ACCOUNT_ID: string;
  public readonly NOMBA_SUB_ACCOUNT_ID: string;
  public readonly NOMBA_TEST_CLIENT_ID: string;
  public readonly NOMBA_TEST_PRIVATE_KEY: string;
  public readonly NOMBA_LIVE_CLIENT_ID: string;
  public readonly NOMBA_LIVE_PRIVATE_KEY: string;
  public readonly NOMBA_CLIENT_ID: string;
  public readonly NOMBA_PRIVATE_KEY: string;
  public readonly NOMBA_WEBHOOK_SECRET: string;
  public readonly NOMBA_BASE_URL: string;
  public readonly NOMBA_WEBHOOK_URL: string;
  public readonly SUPER_ADMIN_EMAIL: string;
  public readonly SUPER_ADMIN_PASSWORD: string;
  public readonly SUPER_ADMIN_FIRST_NAME: string;
  public readonly SUPER_ADMIN_LAST_NAME: string;

  public readonly FRONTEND_URL: string;
  public readonly ADMIN_FRONTEND_URL: string;

  public readonly ENABLE_EMAIL_NOTIFICATIONS: boolean;
  public readonly ENABLE_SMS_NOTIFICATIONS: boolean;
  public readonly ENABLE_WHATSAPP_NOTIFICATIONS: boolean;

  public readonly SMTP_HOST: string;
  public readonly SMTP_PORT: number;
  public readonly SMTP_USER: string;
  public readonly SMTP_PASSWORD: string;
  public readonly SMTP_FROM_EMAIL: string;
  public readonly SMTP_FROM_NAME: string;

  public readonly SMS_PROVIDER: string;
  public readonly SMS_API_KEY: string;
  public readonly SMS_API_SECRET: string;

  public readonly WHATSAPP_PROVIDER: string;
  public readonly WHATSAPP_API_KEY: string;

  public readonly EMAIL_MAX_RETRIES: number;
  public readonly EMAIL_RETRY_DELAY: number;

  public readonly REDIS_URL: string;
  public readonly REDIS_HOST: string;
  public readonly REDIS_PORT: number;
  public readonly REDIS_PASSWORD: string;
  public readonly REDIS_DB: number;
  public readonly QUEUE_PREFIX: string;

  public readonly AUTO_MIGRATE: boolean;
  public readonly PRISMA_POOL_SIZE: number;
  public readonly JOB_ATTEMPTS: number;
  public readonly JOB_BACKOFF_DELAY: number;
  public readonly JOB_TIMEOUT: number;

  public readonly APP_NAME: string;
  public readonly APP_LOGO_URL: string;
  public readonly APP_FRONTEND_URL: string;
  public readonly APP_SUPPORT_EMAIL: string;
  public readonly APP_PRIVACY_URL: string;
  public readonly APP_TERMS_URL: string;
  public readonly PRIMARY_COLOR: string;
  public readonly SECONDARY_COLOR: string;

  public readonly ENCRYPTION_KEY: string;
  public readonly COOKIE_SECRET: string;
  public readonly COOKIE_SECURE: boolean;
  public readonly COOKIE_SAME_SITE: "strict" | "lax" | "none";
  public readonly COOKIE_DOMAIN: string;
  public readonly NOMBA_TRANSFER_BASE_URL: string;

  private constructor() {
    this.DATABASE_URL = EnvConfig.getEnvOrThrow("DATABASE_URL");
    this.JWT_SECRET = EnvConfig.getEnvOrThrow("JWT_SECRET");
    this.JWT_REFRESH_SECRET = EnvConfig.getEnvOrThrow("JWT_REFRESH_SECRET");
    this.PORT = parseInt(EnvConfig.getEnvOrDefault("PORT", "3000"), 10);
    this.NODE_ENV = EnvConfig.getEnvOrDefault("NODE_ENV", "development");
    this.CORS_ORIGIN = EnvConfig.getEnvOrDefault("CORS_ORIGIN", "*");
    this.RATE_LIMIT_MAX = parseInt(EnvConfig.getEnvOrDefault("RATE_LIMIT_MAX", "100"), 10);
    this.LOG_LEVEL = EnvConfig.getEnvOrDefault("LOG_LEVEL", "info");
    this.NOMBA_ENVIRONMENT = EnvConfig.getEnvOrDefault("NOMBA_ENVIRONMENT", "test").toLowerCase() === "live" ? "live" : "test";
    this.NOMBA_PARENT_ACCOUNT_ID = EnvConfig.getEnvOrThrow("NOMBA_PARENT_ACCOUNT_ID");
    this.NOMBA_SUB_ACCOUNT_ID = EnvConfig.getEnvOrThrow("NOMBA_SUB_ACCOUNT_ID");
    this.NOMBA_TEST_CLIENT_ID = EnvConfig.getEnvOrDefault("NOMBA_TEST_CLIENT_ID", "");
    this.NOMBA_TEST_PRIVATE_KEY = EnvConfig.getEnvOrDefault("NOMBA_TEST_PRIVATE_KEY", "");
    this.NOMBA_LIVE_CLIENT_ID = EnvConfig.getEnvOrDefault("NOMBA_LIVE_CLIENT_ID", "");
    this.NOMBA_LIVE_PRIVATE_KEY = EnvConfig.getEnvOrDefault("NOMBA_LIVE_PRIVATE_KEY", "");
    this.NOMBA_CLIENT_ID = this.NOMBA_ENVIRONMENT === "live"
      ? this.NOMBA_LIVE_CLIENT_ID
      : this.NOMBA_TEST_CLIENT_ID;
    this.NOMBA_PRIVATE_KEY = this.NOMBA_ENVIRONMENT === "live"
      ? this.NOMBA_LIVE_PRIVATE_KEY
      : this.NOMBA_TEST_PRIVATE_KEY;
    this.validateNombaConfig();
    this.NOMBA_WEBHOOK_SECRET = EnvConfig.getEnvOrDefault("NOMBA_WEBHOOK_SECRET", "");
    this.NOMBA_BASE_URL = EnvConfig.getEnvOrDefault("NOMBA_BASE_URL", "https://api.nomba.com");
    this.NOMBA_WEBHOOK_URL = EnvConfig.getEnvOrDefault("NOMBA_WEBHOOK_URL", "");
    this.SUPER_ADMIN_EMAIL = EnvConfig.getEnvOrThrow("SUPER_ADMIN_EMAIL");
    this.SUPER_ADMIN_PASSWORD = EnvConfig.getEnvOrThrow("SUPER_ADMIN_PASSWORD");
    this.SUPER_ADMIN_FIRST_NAME = EnvConfig.getEnvOrDefault("SUPER_ADMIN_FIRST_NAME", "Super");
    this.SUPER_ADMIN_LAST_NAME = EnvConfig.getEnvOrDefault("SUPER_ADMIN_LAST_NAME", "Admin");

    this.FRONTEND_URL = EnvConfig.getEnvOrDefault("FRONTEND_URL", "http://localhost:5173");
    this.ADMIN_FRONTEND_URL = process.env.ADMIN_FRONTEND_URL
      ? process.env.ADMIN_FRONTEND_URL
      : this.FRONTEND_URL;
    this.validateFrontendUrls();

    this.ENABLE_EMAIL_NOTIFICATIONS = EnvConfig.getEnvOrDefault("ENABLE_EMAIL_NOTIFICATIONS", "true") === "true";
    this.ENABLE_SMS_NOTIFICATIONS = EnvConfig.getEnvOrDefault("ENABLE_SMS_NOTIFICATIONS", "false") === "true";
    this.ENABLE_WHATSAPP_NOTIFICATIONS = EnvConfig.getEnvOrDefault("ENABLE_WHATSAPP_NOTIFICATIONS", "false") === "true";

    this.SMTP_HOST = EnvConfig.getEnvOrDefault("SMTP_HOST", "localhost");
    this.SMTP_PORT = parseInt(EnvConfig.getEnvOrDefault("SMTP_PORT", "587"), 10);
    this.SMTP_USER = EnvConfig.getEnvOrDefault("SMTP_USER", "");
    this.SMTP_PASSWORD = EnvConfig.getEnvOrDefault("SMTP_PASSWORD", "");
    this.SMTP_FROM_EMAIL = EnvConfig.getEnvOrDefault("SMTP_FROM_EMAIL", "noreply@kolo.app");
    this.SMTP_FROM_NAME = EnvConfig.getEnvOrDefault("SMTP_FROM_NAME", "Kolo");

    this.SMS_PROVIDER = EnvConfig.getEnvOrDefault("SMS_PROVIDER", "");
    this.SMS_API_KEY = EnvConfig.getEnvOrDefault("SMS_API_KEY", "");
    this.SMS_API_SECRET = EnvConfig.getEnvOrDefault("SMS_API_SECRET", "");

    this.WHATSAPP_PROVIDER = EnvConfig.getEnvOrDefault("WHATSAPP_PROVIDER", "");
    this.WHATSAPP_API_KEY = EnvConfig.getEnvOrDefault("WHATSAPP_API_KEY", "");

    this.EMAIL_MAX_RETRIES = parseInt(EnvConfig.getEnvOrDefault("EMAIL_MAX_RETRIES", "3"), 10);
    this.EMAIL_RETRY_DELAY = parseInt(EnvConfig.getEnvOrDefault("EMAIL_RETRY_DELAY", "60000"), 10);

    this.REDIS_URL = EnvConfig.getEnvOrDefault("REDIS_URL", "");
    this.REDIS_HOST = EnvConfig.getEnvOrDefault("REDIS_HOST", "localhost");
    this.REDIS_PORT = parseInt(EnvConfig.getEnvOrDefault("REDIS_PORT", "6379"), 10);
    this.REDIS_PASSWORD = EnvConfig.getEnvOrDefault("REDIS_PASSWORD", "");
    this.REDIS_DB = parseInt(EnvConfig.getEnvOrDefault("REDIS_DB", "0"), 10);
    this.QUEUE_PREFIX = EnvConfig.getEnvOrDefault("QUEUE_PREFIX", "KOLO");

    this.JOB_ATTEMPTS = parseInt(EnvConfig.getEnvOrDefault("JOB_ATTEMPTS", "3"), 10);
    this.JOB_BACKOFF_DELAY = parseInt(EnvConfig.getEnvOrDefault("JOB_BACKOFF_DELAY", "5000"), 10);
    this.JOB_TIMEOUT = parseInt(EnvConfig.getEnvOrDefault("JOB_TIMEOUT", "30000"), 10);

    this.AUTO_MIGRATE = EnvConfig.getEnvOrDefault("AUTO_MIGRATE", "false") === "true";
    this.PRISMA_POOL_SIZE = parseInt(EnvConfig.getEnvOrDefault("PRISMA_POOL_SIZE", "25"), 10);
    this.ENCRYPTION_KEY = EnvConfig.getEnvOrDefault("ENCRYPTION_KEY", "");
    this.APP_NAME = EnvConfig.getEnvOrDefault("APP_NAME", "Kolo");
    this.APP_LOGO_URL = EnvConfig.getEnvOrDefault("APP_LOGO_URL", "");
    this.APP_FRONTEND_URL = EnvConfig.getEnvOrDefault("APP_FRONTEND_URL", "http://localhost:5173");
    this.APP_SUPPORT_EMAIL = EnvConfig.getEnvOrDefault("APP_SUPPORT_EMAIL", "support@kolo.app");
    this.APP_PRIVACY_URL = EnvConfig.getEnvOrDefault("APP_PRIVACY_URL", "https://kolo.app/privacy");
    this.APP_TERMS_URL = EnvConfig.getEnvOrDefault("APP_TERMS_URL", "https://kolo.app/terms");
    this.PRIMARY_COLOR = EnvConfig.getEnvOrDefault("PRIMARY_COLOR", "#00A86B");
    this.SECONDARY_COLOR = EnvConfig.getEnvOrDefault("SECONDARY_COLOR", "#1F2937");

    this.COOKIE_SECRET = EnvConfig.getEnvOrThrow("COOKIE_SECRET");
    this.COOKIE_SECURE = EnvConfig.getEnvOrDefault("COOKIE_SECURE", String(!this.isDevelopment)) === "true";
    this.COOKIE_SAME_SITE = this.parseSameSite();
    this.COOKIE_DOMAIN = EnvConfig.getEnvOrDefault("COOKIE_DOMAIN", "");
    this.validateCookieConfig();
    this.NOMBA_TRANSFER_BASE_URL = EnvConfig.getEnvOrDefault("NOMBA_TRANSFER_BASE_URL", "https://api.nomba.com/v1");
  }

  static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  private static getEnvOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private static getEnvOrDefault(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
  }

  private validateNombaConfig(): void {
    if (!this.NOMBA_CLIENT_ID) {
      throw new Error(`Missing required environment variable: NOMBA_${this.NOMBA_ENVIRONMENT.toUpperCase()}_CLIENT_ID`);
    }
    if (!this.NOMBA_PRIVATE_KEY) {
      throw new Error(`Missing required environment variable: NOMBA_${this.NOMBA_ENVIRONMENT.toUpperCase()}_PRIVATE_KEY`);
    }
  }

  private validateFrontendUrls(): void {
    if (!this.isProduction) return;
    if (this.CORS_ORIGIN === "*") {
      throw new Error("CORS_ORIGIN cannot be '*' in production");
    }
    const localhostPattern = /^http:\/\/localhost(:\d+)?$/;
    if (localhostPattern.test(this.FRONTEND_URL)) {
      throw new Error("FRONTEND_URL must be an explicit HTTPS URL in production");
    }
    if (localhostPattern.test(this.ADMIN_FRONTEND_URL)) {
      throw new Error("ADMIN_FRONTEND_URL must be an explicit HTTPS URL in production");
    }
  }

  private parseSameSite(): "strict" | "lax" | "none" {
    const raw = EnvConfig.getEnvOrDefault("COOKIE_SAME_SITE", "strict").toLowerCase();
    if (raw === "strict" || raw === "lax" || raw === "none") return raw;
    throw new Error(`Invalid COOKIE_SAME_SITE value: "${raw}". Must be "strict", "lax", or "none"`);
  }

  private validateCookieConfig(): void {
    if (this.isProduction && !this.COOKIE_SECURE) {
      throw new Error("COOKIE_SECURE must be true in production");
    }
    if (this.COOKIE_SAME_SITE === "none" && !this.COOKIE_SECURE) {
      throw new Error("COOKIE_SECURE must be true when COOKIE_SAME_SITE is 'none'");
    }
  }

  get isDevelopment(): boolean {
    return this.NODE_ENV === "development";
  }

  get isProduction(): boolean {
    return this.NODE_ENV === "production";
  }
}
