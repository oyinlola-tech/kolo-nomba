export interface SendSmsOptions {
  to: string;
  message: string;
}

export interface SmsProviderResult {
  success: boolean;
  providerReference?: string;
  error?: string;
}

export interface SmsProvider {
  send(options: SendSmsOptions): Promise<SmsProviderResult>;
}
