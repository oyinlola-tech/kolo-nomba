export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProviderResult {
  success: boolean;
  providerReference?: string;
  error?: string;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<EmailProviderResult>;
}
