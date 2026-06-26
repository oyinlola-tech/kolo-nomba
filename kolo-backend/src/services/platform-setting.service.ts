import { PlatformSettingRepository } from "../repositories/platform-setting.repository";
import { EnvConfig } from "../config/env.config";
import { Logger } from "../logger/core/logger";

export interface NotificationSettingsDto {
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
}

export class PlatformSettingService {
  private readonly repo: PlatformSettingRepository;
  private readonly env: EnvConfig;
  private readonly logger: Logger;

  constructor() {
    this.repo = new PlatformSettingRepository();
    this.env = EnvConfig.getInstance();
    this.logger = new Logger("platform-setting-service");
  }

  async getNotificationSettings(): Promise<NotificationSettingsDto> {
    const envDefaults: NotificationSettingsDto = {
      smsEnabled: this.env.ENABLE_SMS_NOTIFICATIONS,
      emailEnabled: this.env.ENABLE_EMAIL_NOTIFICATIONS,
      whatsappEnabled: this.env.ENABLE_WHATSAPP_NOTIFICATIONS,
    };

    try {
      const settings = await this.repo.findByKeys(["smsEnabled", "emailEnabled", "whatsappEnabled"]);
      const map = new Map(settings.map((s) => [s.key, s.value]));

      return {
        smsEnabled: map.has("smsEnabled") ? map.get("smsEnabled") === "true" : envDefaults.smsEnabled,
        emailEnabled: map.has("emailEnabled") ? map.get("emailEnabled") === "true" : envDefaults.emailEnabled,
        whatsappEnabled: map.has("whatsappEnabled") ? map.get("whatsappEnabled") === "true" : envDefaults.whatsappEnabled,
      };
    } catch (error) {
      this.logger.warn("Failed to read platform settings, using env defaults", { error });
      return envDefaults;
    }
  }

  async updateNotificationSettings(dto: NotificationSettingsDto, updatedBy: string): Promise<NotificationSettingsDto> {
    const notifications = [
      { key: "smsEnabled", value: String(dto.smsEnabled), type: "boolean", description: "SMS notifications enabled" },
      { key: "emailEnabled", value: String(dto.emailEnabled), type: "boolean", description: "Email notifications enabled" },
      { key: "whatsappEnabled", value: String(dto.whatsappEnabled), type: "boolean", description: "WhatsApp notifications enabled" },
    ];

    for (const setting of notifications) {
      await this.repo.upsert(setting.key, setting.value, setting.type, setting.description, updatedBy);
    }

    return dto;
  }

  async isSmsEnabled(): Promise<boolean> {
    const settings = await this.getNotificationSettings();
    return settings.smsEnabled;
  }

  async isEmailEnabled(): Promise<boolean> {
    const settings = await this.getNotificationSettings();
    return settings.emailEnabled;
  }
}
