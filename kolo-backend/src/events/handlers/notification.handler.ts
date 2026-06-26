import { EventBus } from "../core/event-bus";
import { NotificationService } from "../../services/notification.service";
import { UserRepository } from "../../repositories/user.repository";
import { GroupMemberRepository } from "../../repositories/group-member.repository";
import { Logger } from "../../logger/core/logger";

export class NotificationEventHandler {
  private readonly notificationService: NotificationService;
  private readonly userRepository: UserRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly logger: Logger;

  constructor() {
    this.notificationService = new NotificationService();
    this.userRepository = new UserRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.logger = new Logger("notification-event-handler");
  }

  register(): void {
    const bus = EventBus.getInstance();

    // ===== AUTHENTICATION EVENTS =====

    bus.subscribe("user.registered", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        const user = await this.userRepository.findById(String(userId));
        await this.notificationService.create({
          userId: String(userId),
          type: "SYSTEM",
          title: "Welcome to Kolo",
          message: "Your account has been created successfully. Welcome to your savings journey.",
          channel: "EMAIL",
          metadata: { ...event.payload, firstName: user?.firstName ?? "" },
        });
      }
    });

    bus.subscribe("user.login_success", async (event) => {
      const { userId, device, location, ip } = event.payload;
      if (userId) {
        const user = await this.userRepository.findById(String(userId));
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "New Login Detected",
          message: "A new login was detected on your account.",
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            device: String(device ?? "Unknown device"),
            location: String(location ?? "Unknown location"),
            ip: String(ip ?? ""),
            firstName: user?.firstName ?? "",
          },
        });
      }
    });

    bus.subscribe("user.login_failed", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        const user = await this.userRepository.findById(String(userId));
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "Failed Login Attempt",
          message: "A failed login attempt was detected on your account.",
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            firstName: user?.firstName ?? "",
            time: new Date().toLocaleString(),
          },
        });
      }
    });

    bus.subscribe("password.changed", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        const user = await this.userRepository.findById(String(userId));
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "Password Changed",
          message: "Your password has been changed successfully.",
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            firstName: user?.firstName ?? "",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
          },
        });
      }
    });

    bus.subscribe("password.reset_requested", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "Password Reset Requested",
          message: "A password reset was requested for your account.",
          channel: "EMAIL",
          metadata: { ...event.payload, time: new Date().toLocaleString() },
        });
      }
    });

    bus.subscribe("email.verified", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "SYSTEM",
          title: "Email Verified",
          message: "Your email address has been verified successfully.",
          channel: "EMAIL",
          metadata: event.payload,
        });
      }
    });

    bus.subscribe("account.suspended", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        const user = await this.userRepository.findById(String(userId));
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "Account Suspended",
          message: "Your account has been suspended. Please contact support.",
          channel: "EMAIL",
          metadata: { ...event.payload, firstName: user?.firstName ?? "" },
        });
      }
    });

    // ===== GROUP EVENTS =====

    bus.subscribe("group.created", async (event) => {
      const { userId, groupName, groupId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "GROUP",
          title: "Group Created",
          message: `Your group "${String(groupName ?? "")}" has been created successfully.`,
          channel: "EMAIL",
          metadata: { ...event.payload, groupName: String(groupName ?? ""), groupId: String(groupId ?? "") },
        });
      }
    });

    bus.subscribe("group.updated", async (event) => {
      const { userId, groupName, groupId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "GROUP",
          title: "Group Updated",
          message: `Your group "${String(groupName ?? "")}" has been updated.`,
          channel: "EMAIL",
          metadata: { ...event.payload, groupName: String(groupName ?? ""), groupId: String(groupId ?? "") },
        });
      }
    });

    bus.subscribe("group.member_invited", async (event) => {
      const { userId, groupName, adminName, contributionAmount, contributionFrequency, inviteCode } = event.payload;
      if (userId) {
        const user = await this.userRepository.findById(String(userId));
        await this.notificationService.create({
          userId: String(userId),
          type: "GROUP",
          title: "Group Invitation",
          message: `You've been invited to join ${String(groupName ?? "")}.`,
          channel: user?.email ? "EMAIL" : "IN_APP",
          metadata: {
            ...event.payload,
            groupName: String(groupName ?? ""),
            adminName: String(adminName ?? ""),
            contributionAmount: String(contributionAmount ?? ""),
            contributionFrequency: String(contributionFrequency ?? ""),
            inviteCode: String(inviteCode ?? ""),
          },
        });
      }
    });

    bus.subscribe("group.member_joined", async (event) => {
      const { userId, groupId, memberName, groupName } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "GROUP",
          title: "New Member Joined",
          message: `${String(memberName ?? "Someone")} has joined your group ${String(groupName ?? "")}.`,
          channel: "EMAIL",
          metadata: { ...event.payload, groupName: String(groupName ?? ""), groupId: String(groupId ?? ""), memberName: String(memberName ?? "") },
        });
      }
      // Notify group admins
      if (groupId) {
        const members = await this.groupMemberRepository.findActiveByGroup(String(groupId));
        const admins = members.filter((m: { role: string }) => m.role === "GROUP_OWNER" || m.role === "GROUP_ADMIN");
        for (const admin of admins) {
          if (admin.userId !== userId) {
            await this.notificationService.create({
              userId: admin.userId,
              type: "GROUP",
              title: "New Member Joined",
              message: `${String(memberName ?? "A new member")} has joined ${String(groupName ?? "your group")}.`,
              channel: "EMAIL",
              metadata: { ...event.payload, memberName: String(memberName ?? "") },
            });
          }
        }
      }
    });

    bus.subscribe("group.member_removed", async (event) => {
      const { userId, groupName, memberName, groupId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "GROUP",
          title: "Member Removed",
          message: `${String(memberName ?? "A member")} has been removed from ${String(groupName ?? "")}.`,
          channel: "EMAIL",
          metadata: { ...event.payload, groupName: String(groupName ?? ""), groupId: String(groupId ?? ""), memberName: String(memberName ?? "") },
        });
      }
    });

    bus.subscribe("group.admin_changed", async (event) => {
      const { userId, groupName, groupId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "GROUP",
          title: "Group Admin Changed",
          message: `The group admin for ${String(groupName ?? "your group")} has been updated.`,
          channel: "EMAIL",
          metadata: { ...event.payload, groupName: String(groupName ?? ""), groupId: String(groupId ?? "") },
        });
      }
    });

    // ===== CONTRIBUTION EVENTS =====

    bus.subscribe("contribution.created", async (event) => {
      const { userId, groupName, amount } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "CONTRIBUTION",
          title: "Contribution Plan Created",
          message: `A new contribution plan is active for ${String(groupName ?? "your group")}.`,
          channel: "EMAIL",
          metadata: { ...event.payload, groupName: String(groupName ?? ""), amount: String(amount ?? "") },
        });
      }
    });

    bus.subscribe("contribution.reminder", async (event) => {
      const { userId, amount, groupName, dueDate } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "CONTRIBUTION",
          title: "Contribution Reminder",
          message: `Your contribution of ${String(amount ?? 0)} NGN is due.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            amount: String(amount ?? "0"),
            groupName: String(groupName ?? ""),
            dueDate: String(dueDate ?? ""),
          },
        });
      }
    });

    bus.subscribe("contribution.received", async (event) => {
      const { userId, amount, reference, groupName } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "CONTRIBUTION",
          title: "Contribution Received",
          message: `Your contribution of ${String(amount ?? 0)} NGN has been received.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            amount: String(amount ?? "0"),
            reference: String(reference ?? ""),
            groupName: String(groupName ?? ""),
          },
        });
      }
    });

    bus.subscribe("contribution.completed", async (event) => {
      const { userId, groupName, cycleNumber } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "CONTRIBUTION",
          title: "Contribution Cycle Completed",
          message: `The contribution cycle for ${String(groupName ?? "your group")} has been completed.`,
          channel: "EMAIL",
          metadata: { ...event.payload, groupName: String(groupName ?? ""), cycleNumber: String(cycleNumber ?? "") },
        });
      }
    });

    bus.subscribe("contribution.overdue", async (event) => {
      const { userId, amount, groupName, dueDate } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "CONTRIBUTION",
          title: "Overdue Contribution",
          message: `Your contribution of ${String(amount ?? 0)} NGN is overdue.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            amount: String(amount ?? "0"),
            groupName: String(groupName ?? ""),
            dueDate: String(dueDate ?? ""),
          },
        });
      }
      // Notify group admins about overdue member
      if (event.payload.groupId) {
        const members = await this.groupMemberRepository.findActiveByGroup(String(event.payload.groupId));
        const admins = members.filter((m: { role: string }) => m.role === "GROUP_OWNER" || m.role === "GROUP_ADMIN");
        for (const admin of admins) {
          await this.notificationService.create({
            userId: admin.userId,
            type: "CONTRIBUTION",
            title: "Member Payment Overdue",
            message: `A member has an overdue contribution of ${String(amount ?? 0)} NGN.`,
            channel: "EMAIL",
            metadata: { ...event.payload, amount: String(amount ?? "0"), groupName: String(groupName ?? "") },
          });
        }
      }
    });

    bus.subscribe("contribution.cycle_started", async (event) => {
      const { userId, groupName, cycleNumber, amount } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "CONTRIBUTION",
          title: "New Contribution Cycle",
          message: `A new contribution cycle has started for ${String(groupName ?? "your group")}.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            groupName: String(groupName ?? ""),
            cycleNumber: String(cycleNumber ?? ""),
            amount: String(amount ?? ""),
          },
        });
      }
    });

    // ===== PAYMENT EVENTS =====

    bus.subscribe("payment.initialized", async (event) => {
      const { userId, amount, reference, groupName } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYMENT",
          title: "Payment Initiated",
          message: `A payment of ${String(amount ?? 0)} NGN has been initiated.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0"), reference: String(reference ?? ""), groupName: String(groupName ?? "") },
        });
      }
    });

    bus.subscribe("payment.successful", async (event) => {
      const { userId, amount, reference, groupName, paymentMethod } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYMENT",
          title: "Payment Successful",
          message: `Payment of ${String(amount ?? 0)} NGN was successful.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            amount: String(amount ?? "0"),
            reference: String(reference ?? ""),
            groupName: String(groupName ?? ""),
            method: String(paymentMethod ?? "Bank Transfer"),
            date: new Date().toLocaleDateString(),
            receiptNumber: `RCP-${String(reference ?? "").slice(0, 8)}`,
          },
        });
      }
    });

    bus.subscribe("payment.failed", async (event) => {
      const { userId, amount, reason, groupName } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYMENT",
          title: "Payment Failed",
          message: `Payment of ${String(amount ?? 0)} NGN failed.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            amount: String(amount ?? "0"),
            reason: String(reason ?? "Unable to process payment"),
            groupName: String(groupName ?? ""),
          },
        });
      }
    });

    bus.subscribe("payment.reversed", async (event) => {
      const { userId, amount, reference } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYMENT",
          title: "Payment Reversed",
          message: `A payment of ${String(amount ?? 0)} NGN has been reversed.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0"), reference: String(reference ?? "") },
        });
      }
    });

    bus.subscribe("payment.refunded", async (event) => {
      const { userId, amount, reference } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYMENT",
          title: "Payment Refunded",
          message: `A refund of ${String(amount ?? 0)} NGN has been issued.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0"), reference: String(reference ?? "") },
        });
      }
    });

    // ===== PAYOUT EVENTS =====

    bus.subscribe("payout.created", async (event) => {
      const { userId, amount, payoutId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYOUT",
          title: "Payout Created",
          message: `A payout of ${String(amount ?? 0)} NGN has been created.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0"), payoutId: String(payoutId ?? "") },
        });
      }
    });

    bus.subscribe("payout.requested", async (event) => {
      const { userId, amount, recipientName, recipientAccount, groupId } = event.payload;
      const adminUserId = userId ? String(userId) : null;
      if (!adminUserId) return;

      const members = groupId ? await this.groupMemberRepository.findActiveByGroup(String(groupId)) : [];
      const admins = members.filter((m: { role: string }) => m.role === "GROUP_OWNER" || m.role === "GROUP_ADMIN");
      const notifyUsers = admins.length > 0 ? admins.map((a: { userId: string }) => a.userId) : [adminUserId];

      for (const notifyUserId of notifyUsers) {
        await this.notificationService.create({
          userId: notifyUserId,
          type: "PAYOUT",
          title: "Payout Approval Required",
          message: `A payout of ${String(amount ?? 0)} NGN requires your approval.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            amount: String(amount ?? "0"),
            recipientName: String(recipientName ?? ""),
            recipientAccount: String(recipientAccount ?? ""),
            requestedByName: event.payload.requestedByName ? String(event.payload.requestedByName) : "",
          },
        });
      }
    });

    bus.subscribe("payout.approved", async (event) => {
      const { userId, amount, payoutId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYOUT",
          title: "Payout Approved",
          message: `A payout of ${String(amount ?? 0)} NGN has been approved.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0"), payoutId: String(payoutId ?? "") },
        });
      }
    });

    bus.subscribe("payout.rejected", async (event) => {
      const { userId, amount } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYOUT",
          title: "Payout Rejected",
          message: `Your payout request of ${String(amount ?? 0)} NGN was not approved.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0") },
        });
      }
    });

    bus.subscribe("payout.processing", async (event) => {
      const { userId, amount, payoutId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYOUT",
          title: "Payout Processing",
          message: `Your payout of ${String(amount ?? 0)} NGN is being processed.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0"), payoutId: String(payoutId ?? "") },
        });
      }
    });

    bus.subscribe("payout.completed", async (event) => {
      const { userId, amount, reference, recipientName, bankName, accountMasked } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYOUT",
          title: "Payout Completed",
          message: `A payout of ${String(amount ?? 0)} NGN has been sent to your account.`,
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            amount: String(amount ?? "0"),
            reference: String(reference ?? ""),
            recipientName: String(recipientName ?? ""),
            bankName: String(bankName ?? ""),
            accountMasked: String(accountMasked ?? ""),
            date: new Date().toLocaleDateString(),
            receiptNumber: `RCP-PO-${String(reference ?? "").slice(0, 8)}`,
          },
        });
      }
    });

    bus.subscribe("payout.failed", async (event) => {
      const { userId, amount, reason } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYOUT",
          title: "Payout Failed",
          message: `A payout of ${String(amount ?? 0)} NGN could not be completed.`,
          channel: "EMAIL",
          metadata: { ...event.payload, amount: String(amount ?? "0"), reason: String(reason ?? "Transfer failed") },
        });
      }
    });

    bus.subscribe("payout.transfer_processed", async (event) => {
      const { recipientId } = event.payload;
      if (recipientId) {
        this.logger.info("Payout transfer processed notification", { recipientId: String(recipientId) });
      }
    });

    bus.subscribe("payout.transfer_failed", async (event) => {
      const { recipientId, error } = event.payload;
      if (recipientId) {
        this.logger.warn("Payout transfer failed notification", { recipientId: String(recipientId), error: String(error ?? "") });
      }
    });

    // ===== SECURITY EVENTS =====

    bus.subscribe("security.suspicious_login", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "Security Alert",
          message: "Suspicious login detected on your account.",
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            issue: "Suspicious login attempt",
            recommendation: "Change your password and review your account security settings.",
          },
        });
      }
    });

    bus.subscribe("security.system_alert", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "System Security Alert",
          message: String(event.payload.message ?? "A system security issue was detected."),
          channel: "EMAIL",
          metadata: event.payload,
        });
      }
    });

    bus.subscribe("security.admin_action", async (event) => {
      const { userId } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "SECURITY",
          title: "Admin Action Performed",
          message: "An administrative action was performed on your account.",
          channel: "EMAIL",
          metadata: { ...event.payload, time: new Date().toLocaleString() },
        });
      }
    });

    // ===== LEGACY / BACKWARD COMPATIBILITY =====

    bus.subscribe("user.verification_required", async (event) => {
      const { userId, verificationCode } = event.payload;
      if (userId) {
        const user = await this.userRepository.findById(String(userId));
        await this.notificationService.create({
          userId: String(userId),
          type: "SYSTEM",
          title: "Verify Your Account",
          message: "Please verify your email address to activate your account.",
          channel: "EMAIL",
          metadata: {
            ...event.payload,
            firstName: user?.firstName ?? "",
            verificationCode: String(verificationCode ?? ""),
          },
        });
      }
    });

    bus.subscribe("payment.large_transaction", async (event) => {
      const { userId, amount } = event.payload;
      if (userId) {
        await this.notificationService.create({
          userId: String(userId),
          type: "PAYMENT",
          title: "Large Transaction Alert",
          message: `A large transaction of ${String(amount ?? 0)} NGN was processed.`,
          channel: "EMAIL",
          metadata: event.payload,
        });
      }
    });

    this.logger.info("Notification event handlers registered");
  }
}
