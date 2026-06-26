import { EnvConfig } from "./env.config";

export interface NombaRuntimeConfig {
  environment: "test" | "live";
  baseUrl: string;
  parentAccountId: string;
  subAccountId: string;
  clientId: string;
  privateKey: string;
  webhookUrl: string;
  webhookSecret: string;
}

export class NombaConfig {
  private readonly env: EnvConfig;

  constructor() {
    this.env = EnvConfig.getInstance();
  }

  get runtime(): NombaRuntimeConfig {
    return {
      environment: this.env.NOMBA_ENVIRONMENT,
      baseUrl: this.env.NOMBA_BASE_URL.replace(/\/$/, ""),
      parentAccountId: this.env.NOMBA_PARENT_ACCOUNT_ID,
      subAccountId: this.env.NOMBA_SUB_ACCOUNT_ID,
      clientId: this.env.NOMBA_CLIENT_ID,
      privateKey: this.env.NOMBA_PRIVATE_KEY,
      webhookUrl: this.env.NOMBA_WEBHOOK_URL,
      webhookSecret: this.env.NOMBA_WEBHOOK_SECRET,
    };
  }

  get safeStatus() {
    return {
      environment: this.env.NOMBA_ENVIRONMENT,
      baseUrl: this.env.NOMBA_BASE_URL,
      parentAccountConfigured: Boolean(this.env.NOMBA_PARENT_ACCOUNT_ID),
      subAccountConfigured: Boolean(this.env.NOMBA_SUB_ACCOUNT_ID),
      clientConfigured: Boolean(this.env.NOMBA_CLIENT_ID),
      privateKeyConfigured: Boolean(this.env.NOMBA_PRIVATE_KEY),
      webhookConfigured: Boolean(this.env.NOMBA_WEBHOOK_SECRET),
      webhookUrl: this.env.NOMBA_WEBHOOK_URL,
    };
  }
}
