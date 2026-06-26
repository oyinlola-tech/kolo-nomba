export interface SendWhatsAppOptions {
  to: string;
  message: string;
}

export interface WhatsAppProviderResult {
  success: boolean;
  providerReference?: string;
  error?: string;
}

export interface WhatsAppProvider {
  send(options: SendWhatsAppOptions): Promise<WhatsAppProviderResult>;
}
