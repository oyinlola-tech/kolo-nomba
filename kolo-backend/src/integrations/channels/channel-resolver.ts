import { PlatformSettingService } from "../../services/platform-setting.service";
import type { NotificationPreferenceResponse } from "../../dto/notification.dto";

export type ResolvedChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";

export class ChannelResolver {
  private readonly platformSettingService: PlatformSettingService;

  constructor() {
    this.platformSettingService = new PlatformSettingService();
  }

  async resolve(
    type: string,
    preferences?: NotificationPreferenceResponse | null,
  ): Promise<ResolvedChannel[]> {
    const channels: ResolvedChannel[] = ["IN_APP"];

    const isSecurityOrPayment =
      type === "SECURITY" || type === "PAYMENT" || type === "PAYOUT";

    const platformSettings = await this.platformSettingService.getNotificationSettings();

    if (isSecurityOrPayment || platformSettings.emailEnabled) {
      const emailEnabled = isSecurityOrPayment
        ? true
        : (preferences?.emailEnabled ?? true);
      if (emailEnabled) {
        channels.push("EMAIL");
      }
    }

    if (platformSettings.smsEnabled) {
      const smsEnabled = preferences?.smsEnabled ?? false;
      if (smsEnabled) {
        channels.push("SMS");
      }
    }

    if (platformSettings.whatsappEnabled) {
      const whatsappEnabled = preferences?.whatsappEnabled ?? false;
      if (whatsappEnabled) {
        channels.push("WHATSAPP");
      }
    }

    return channels;
  }
}
