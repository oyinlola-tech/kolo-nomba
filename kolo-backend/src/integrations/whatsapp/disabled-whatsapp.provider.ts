import type { WhatsAppProvider, SendWhatsAppOptions, WhatsAppProviderResult } from "./whatsapp-provider.interface";
import { Logger } from "../../logger/core/logger";

export class DisabledWhatsAppProvider implements WhatsAppProvider {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("disabled-whatsapp-provider");
  }

  async send(options: SendWhatsAppOptions): Promise<WhatsAppProviderResult> {
    this.logger.info("WhatsApp not enabled — delivery skipped", { to: options.to });
    return {
      success: false,
      error: "WhatsApp notifications are disabled. Set ENABLE_WHATSAPP_NOTIFICATIONS=true to enable.",
    };
  }
}
