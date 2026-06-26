import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationPreferenceRepository } from "../repositories/notification-preference.repository";
import { NotificationDeliveryRepository } from "../repositories/notification-delivery.repository";
import { EmailService } from "./email.service";
import { ChannelResolver } from "../integrations/channels/channel-resolver";
import { EnvConfig } from "../config/env.config";
import { EventBus } from "../events/core/event-bus";
import { SecurityEvent } from "../events/core/event";
import { AuthError } from "../errors/auth.error";
import type {
  CreateNotificationDto,
  NotificationResponse,
  NotificationPreferenceResponse,
  UpdatePreferenceDto,
  NotificationDeliveryResponse,
} from "../dto/notification.dto";
import { Logger } from "../logger/core/logger";

export class NotificationService {
  private readonly notificationRepository: NotificationRepository;
  private readonly preferenceRepository: NotificationPreferenceRepository;
  private readonly deliveryRepository: NotificationDeliveryRepository;
  private readonly emailService: EmailService;
  private readonly channelResolver: ChannelResolver;
  private readonly eventBus: EventBus;
  private readonly env: EnvConfig;
  private readonly logger: Logger;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.preferenceRepository = new NotificationPreferenceRepository();
    this.deliveryRepository = new NotificationDeliveryRepository();
    this.emailService = new EmailService();
    this.channelResolver = new ChannelResolver();
    this.eventBus = EventBus.getInstance();
    this.env = EnvConfig.getInstance();
    this.logger = new Logger("notification-service");
  }

  async create(dto: CreateNotificationDto): Promise<NotificationResponse> {
    const notification = await this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      channel: dto.channel ?? "IN_APP",
      metadata: dto.metadata,
    });

    await this.notificationRepository.updateStatus(notification.id, "SENT");

    const prefs = dto.userId
      ? await this.preferenceRepository.findByUser(dto.userId)
      : null;

    const prefsResponse: NotificationPreferenceResponse | null = prefs
      ? {
          emailEnabled: prefs.emailEnabled,
          smsEnabled: prefs.smsEnabled,
          pushEnabled: prefs.pushEnabled,
          whatsappEnabled: prefs.whatsappEnabled,
          securityAlerts: prefs.securityAlerts,
          paymentAlerts: prefs.paymentAlerts,
          marketingMessages: prefs.marketingMessages,
        }
      : null;

    const channels = await this.channelResolver.resolve(dto.type, prefsResponse);

    for (const channel of channels) {
      if (channel === "IN_APP") continue;

      const delivery = await this.deliveryRepository.create({
        notificationId: notification.id,
        channel,
        status: "PENDING",
      });

      try {
        await this.deliverToChannel(channel, dto, delivery.id);
        await this.deliveryRepository.updateStatus(delivery.id, "SENT");
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        await this.deliveryRepository.updateStatus(delivery.id, "FAILED", undefined, reason);
        this.logger.error("Channel delivery failed", { channel, reason, notificationId: notification.id });
      }
    }

    if (dto.type === "SECURITY") {
      await this.eventBus.publish(new SecurityEvent("notification_sent", {
        userId: dto.userId,
        notificationId: notification.id,
        type: dto.type,
      }));
    }

    this.logger.info("Notification created", { notificationId: notification.id, type: dto.type });
    return this.mapNotification(notification);
  }

  private async deliverToChannel(
    channel: string,
    dto: CreateNotificationDto,
    deliveryId: string,
  ): Promise<void> {
    switch (channel) {
      case "EMAIL":
        await this.emailService.sendNotificationEmail({
          userId: dto.userId,
          template: this.mapTypeToTemplate(dto.type),
          vars: {
            title: dto.title,
            message: dto.message,
            ...(dto.metadata as Record<string, string> ?? {}),
          },
          deliveryId,
        });
        break;
      case "SMS": {
        const { DisabledSmsProvider } = await import("../integrations/sms/disabled-sms.provider");
        const provider = new DisabledSmsProvider();
        await provider.send({ to: dto.userId, message: `${dto.title}: ${dto.message}` });
        break;
      }
      case "WHATSAPP": {
        const { DisabledWhatsAppProvider } = await import("../integrations/whatsapp/disabled-whatsapp.provider");
        const provider = new DisabledWhatsAppProvider();
        await provider.send({ to: dto.userId, message: `${dto.title}: ${dto.message}` });
        break;
      }
    }
  }

  async retryFailedDeliveries(): Promise<number> {
    const maxRetries = this.env.EMAIL_MAX_RETRIES;
    const failed = await this.deliveryRepository.findPendingRetries(maxRetries);
    let retried = 0;

    for (const delivery of failed) {
      try {
        const notification = await this.notificationRepository.findById(delivery.notificationId);
        if (!notification) continue;

        await this.deliveryRepository.updateStatus(delivery.id, "PENDING");
        await this.deliverToChannel(delivery.channel, {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata as Record<string, unknown> | undefined,
        }, delivery.id);
        await this.deliveryRepository.updateStatus(delivery.id, "SENT");
        retried++;
        this.logger.info("Delivery retry succeeded", { deliveryId: delivery.id });
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        await this.deliveryRepository.updateStatus(delivery.id, "FAILED", undefined, reason);
        this.logger.error("Delivery retry failed", { deliveryId: delivery.id, reason });
      }
    }

    return retried;
  }

  async getUserNotifications(userId: string): Promise<NotificationResponse[]> {
    const notifications = await this.notificationRepository.findByUser(userId);
    return notifications.map(this.mapNotification);
  }

  async getUnreadNotifications(userId: string): Promise<NotificationResponse[]> {
    const notifications = await this.notificationRepository.findUnreadByUser(userId);
    return notifications.map(this.mapNotification);
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponse> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) throw new AuthError("Notification not found");
    if (notification.userId !== userId) throw new AuthError("You do not own this notification");

    await this.notificationRepository.markAsRead(notificationId);
    return this.mapNotification({ ...notification, status: "READ" as never, readAt: new Date() });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async getPreferences(userId: string): Promise<NotificationPreferenceResponse> {
    const prefs = await this.preferenceRepository.findByUser(userId);
    return {
      emailEnabled: prefs?.emailEnabled ?? true,
      smsEnabled: prefs?.smsEnabled ?? false,
      pushEnabled: prefs?.pushEnabled ?? true,
      whatsappEnabled: prefs?.whatsappEnabled ?? false,
      securityAlerts: prefs?.securityAlerts ?? true,
      paymentAlerts: prefs?.paymentAlerts ?? true,
      marketingMessages: prefs?.marketingMessages ?? false,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferenceDto): Promise<NotificationPreferenceResponse> {
    const prefs = await this.preferenceRepository.upsert(userId, dto);
    this.logger.info("Notification preferences updated", { userId });

    return {
      emailEnabled: prefs.emailEnabled,
      smsEnabled: prefs.smsEnabled,
      pushEnabled: prefs.pushEnabled,
      whatsappEnabled: prefs.whatsappEnabled,
      securityAlerts: prefs.securityAlerts,
      paymentAlerts: prefs.paymentAlerts,
      marketingMessages: prefs.marketingMessages,
    };
  }

  async getDeliveries(notificationId: string, userId: string): Promise<NotificationDeliveryResponse[]> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) throw new AuthError("Notification not found");
    if (notification.userId !== userId) throw new AuthError("You do not own this notification");

    const deliveries = await this.deliveryRepository.findByNotification(notificationId);
    return deliveries.map(d => ({
      id: d.id,
      notificationId: d.notificationId,
      channel: d.channel,
      status: d.status,
      provider: d.provider,
      providerReference: d.providerReference,
      attempts: d.attempts,
      failureReason: d.failureReason,
      sentAt: d.sentAt?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  private mapTypeToTemplate(type: string): string {
    const map: Record<string, string> = {
      PAYMENT: "paymentSuccessful",
      CONTRIBUTION: "contributionReminder",
      PAYOUT: "payoutCompleted",
      SECURITY: "securityAlert",
      SYSTEM: "welcome",
    };
    return map[type] ?? "welcome";
  }

  private mapNotification(n: {
    id: string; userId: string; type: string; title: string; message: string;
    channel: string; status: string; metadata: unknown; readAt: Date | null; createdAt: Date;
  }): NotificationResponse {
    return {
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      channel: n.channel,
      status: n.status,
      metadata: n.metadata as Record<string, unknown> | null,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  }
}
