import type { SmsProvider, SendSmsOptions, SmsProviderResult } from "./sms-provider.interface";
import { Logger } from "../../logger/core/logger";

export class DisabledSmsProvider implements SmsProvider {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("disabled-sms-provider");
  }

  async send(options: SendSmsOptions): Promise<SmsProviderResult> {
    this.logger.info("SMS not enabled — delivery skipped", { to: options.to });
    return {
      success: false,
      error: "SMS notifications are disabled. Set ENABLE_SMS_NOTIFICATIONS=true to enable.",
    };
  }
}
