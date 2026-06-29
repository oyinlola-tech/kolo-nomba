import { EnvConfig } from "../../config/env.config";
import { Logger } from "../../logger/core/logger";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailTemplateService {
  private readonly env: EnvConfig;
  private readonly logger: Logger;

  constructor() {
    this.env = EnvConfig.getInstance();
    this.logger = new Logger("email-template-service");
  }

  private get appName(): string { return this.env.APP_NAME; }
  private get logoUrl(): string { return this.env.APP_LOGO_URL || `<h1 style="margin:0;font-size:26px;font-weight:700;color:${this.primaryColor};">${this.escapeHtml(this.appName)}<span style="color:${this.secondaryColor};">.</span></h1>`; }
  private get frontendUrl(): string { return this.env.APP_FRONTEND_URL; }
  private get supportEmail(): string { return this.env.APP_SUPPORT_EMAIL; }
  private get privacyUrl(): string { return this.env.APP_PRIVACY_URL; }
  private get termsUrl(): string { return this.env.APP_TERMS_URL; }
  private get primaryColor(): string { return this.env.PRIMARY_COLOR; }
  private get secondaryColor(): string { return this.env.SECONDARY_COLOR; }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  private stripHtml(s: string): string {
    return s.replace(/[<>]/g, "");
  }

  private safeUrl(href: string): string {
    try {
      const url = new URL(href, this.frontendUrl);
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch {}
    return this.frontendUrl;
  }

  render(templateName: string, raw: Record<string, string>): EmailTemplate {
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key === "verificationCode" || key === "confirmLink" || key === "inviteCode") {
        vars[key] = value;
      } else {
        vars[key] = this.escapeHtml(value);
      }
    }

    const renderer = this.getTemplate(templateName);
    if (!renderer) {
      this.logger.warn("Template not found, using fallback", { templateName });
      return this.fallbackTemplate(vars);
    }
    return renderer(vars);
  }

  private getTemplate(name: string): ((vars: Record<string, string>) => EmailTemplate) | null {
    const templates: Record<string, (vars: Record<string, string>) => EmailTemplate> = {
      welcome: (v) => this.authTemplate("Welcome", v, "Your savings journey begins here."),
      accountVerification: (v) => this.verificationTemplate(v),
      passwordChanged: (v) => this.authTemplate("Password Changed", v, "Your password has been updated successfully."),
      newLoginAlert: (v) => this.loginAlertTemplate(v),
      loginFailed: (v) => this.authTemplate("Failed Login Attempt", v, "We detected a failed login attempt on your account.", "warning"),
      passwordReset: (v) => this.passwordResetTemplate(v),
      passwordResetRequested: (v) => this.authTemplate("Password Reset Requested", v, "A password reset was requested for your account."),
      emailVerified: (v) => this.authTemplate("Email Verified", v, "Your email address has been verified successfully."),
      accountSuspended: (v) => this.authTemplate("Account Suspended", v, "Your account has been suspended. Please contact support.", "warning"),

      groupCreated: (v) => this.groupTemplate("Group Created", v, `Your group <strong>${v.groupName}</strong> has been created successfully.`),
      groupUpdated: (v) => this.groupTemplate("Group Updated", v, `Your group <strong>${v.groupName}</strong> has been updated.`),
      groupMemberInvited: (v) => this.groupInvitationTemplate(v),
      groupMemberJoined: (v) => this.groupTemplate("New Member Joined", v, `<strong>${v.memberName}</strong> has joined your group <strong>${v.groupName}</strong>.`),
      groupMemberRemoved: (v) => this.groupTemplate("Member Removed", v, `<strong>${v.memberName}</strong> has been removed from <strong>${v.groupName}</strong>.`),
      groupAdminChanged: (v) => this.groupTemplate("Group Admin Changed", v, `The group admin for <strong>${v.groupName}</strong> has been updated.`),

      contributionCreated: (v) => this.contributionTemplate("Contribution Plan Created", v, `A new contribution plan has been created for <strong>${v.groupName}</strong>.`),
      contributionReminder: (v) => this.contributionReminderTemplate(v),
      contributionReceived: (v) => this.contributionTemplate("Contribution Received", v, `Your contribution of <strong>${v.amount} NGN</strong> for <strong>${v.groupName}</strong> has been received.`),
      contributionCompleted: (v) => this.contributionTemplate("Contribution Cycle Completed", v, `The contribution cycle for <strong>${v.groupName}</strong> has been completed.`),
      contributionOverdue: (v) => this.contributionOverdueTemplate(v),
      contributionCycleStarted: (v) => this.contributionTemplate("New Contribution Cycle", v, `A new contribution cycle has started for <strong>${v.groupName}</strong>.`),

      paymentInitialized: (v) => this.paymentTemplate("Payment Initiated", v, `Your payment of <strong>${v.amount} NGN</strong> has been initiated.`),
      paymentSuccessful: (v) => this.paymentReceiptTemplate(v),
      paymentFailed: (v) => this.paymentFailedTemplate(v),
      paymentReversed: (v) => this.paymentTemplate("Payment Reversed", v, `A payment of <strong>${v.amount} NGN</strong> has been reversed.`),
      paymentRefunded: (v) => this.paymentTemplate("Payment Refunded", v, `A refund of <strong>${v.amount} NGN</strong> has been issued.`),

      payoutCreated: (v) => this.payoutTemplate("Payout Created", v, `A payout of <strong>${v.amount} NGN</strong> has been created.`),
      payoutPendingApproval: (v) => this.payoutPendingApprovalTemplate(v),
      payoutApproved: (v) => this.payoutTemplate("Payout Approved", v, `A payout of <strong>${v.amount} NGN</strong> has been approved and is being processed.`),
      payoutRejected: (v) => this.payoutTemplate("Payout Rejected", v, `Your payout request of <strong>${v.amount} NGN</strong> was not approved.`, "warning"),
      payoutProcessing: (v) => this.payoutTemplate("Payout Processing", v, `Your payout of <strong>${v.amount} NGN</strong> is being sent to your bank account.`),
      payoutCompleted: (v) => this.payoutReceiptTemplate(v),
      payoutFailed: (v) => this.payoutFailedTemplate(v),

      newDeviceLogin: (v) => this.loginAlertTemplate(v, "New Device Login"),
      securityAlert: (v) => this.securityAlertTemplate(v),
      suspiciousActivity: (v) => this.securityAlertTemplate(v),
      adminActionPerformed: (v) => this.authTemplate("Admin Action Performed", v, "An administrative action was performed on your account.", "warning"),

      paymentReceipt: (v) => this.paymentReceiptTemplate(v),
      payoutReceipt: (v) => this.payoutReceiptTemplate(v),
    };
    return templates[name] ?? null;
  }

  private layout(contentHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body{margin:0;padding:0;background-color:#f4f7f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}
    .container{max-width:600px;margin:0 auto;padding:24px 16px}
    .card{background-color:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
    .header{text-align:center;margin-bottom:28px}
    .header h1{margin:0;font-size:26px;font-weight:700;color:${this.primaryColor};letter-spacing:-0.5px}
    .header span{color:${this.secondaryColor}}
    .content{color:#374151;line-height:1.7;font-size:15px}
    .content h2{margin:0 0 8px;font-size:22px;font-weight:600;color:${this.secondaryColor}}
    .content p{margin:0 0 12px}
    .card-summary{background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0}
    .card-summary table{width:100%;border-collapse:collapse}
    .card-summary td{padding:8px 0;font-size:14px;border-bottom:1px solid #f3f4f6}
    .card-summary td:last-child{text-align:right;font-weight:600;color:${this.secondaryColor}}
    .card-summary tr:last-child td{border-bottom:none}
    .amount-box{background-color:${this.primaryColor}10;border:1px solid ${this.primaryColor}30;border-radius:10px;padding:20px;text-align:center;margin:20px 0}
    .amount-box .amount{font-size:28px;font-weight:700;color:${this.primaryColor};margin:0}
    .amount-box .label{font-size:13px;color:#6b7280;margin:4px 0 0}
    .btn{text-align:center;margin:24px 0}
    .btn a{display:inline-block;background-color:${this.primaryColor};color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px}
    .btn a:hover{opacity:0.9}
    .footer{text-align:center;padding:28px 16px 0;font-size:13px;color:#9ca3af}
    .footer a{color:${this.primaryColor};text-decoration:none}
    .footer p{margin:4px 0}
    .security-notice{background-color:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:13px;color:#92400e}
    .security-notice strong{color:#78350f}
    .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
    .badge-success{background-color:#d1fae5;color:#065f46}
    .badge-warning{background-color:#fef3c7;color:#92400e}
    .badge-error{background-color:#fee2e2;color:#991b1b}
    hr{border:none;border-top:1px solid #e5e7eb;margin:20px 0}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">${typeof this.logoUrl === "string" && this.logoUrl.startsWith("<") ? this.logoUrl : `<img src="${this.logoUrl}" alt="${this.appName}" style="max-height:40px;" />`}</div>
      <div class="content">${contentHtml}</div>
      <hr />
      <div style="text-align:center;font-size:13px;color:#9ca3af;">
        <p>${this.appName} Savings Platform</p>
        <p><a href="mailto:${this.supportEmail}">${this.supportEmail}</a> &middot; <a href="${this.privacyUrl}">Privacy Policy</a> &middot; <a href="${this.termsUrl}">Terms of Service</a></p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
      <p>You received this email because you have an account with ${this.appName}.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private greeting(vars: Record<string, string>): string {
    const name = this.escapeHtml(vars.firstName ?? vars.recipientName ?? "there");
    return `<p>Hello ${name},</p>`;
  }

  private summaryCard(items: { label: string; value: string }[]): string {
    const rows = items.map(i =>
      `<tr><td>${this.escapeHtml(i.label)}</td><td>${i.value}</td></tr>`
    ).join("");
    return `<div class="card-summary"><table>${rows}</table></div>`;
  }

  private amountBox(amount: string, label: string): string {
    return `<div class="amount-box"><p class="amount">${this.escapeHtml(amount)}</p><p class="label">${this.escapeHtml(label)}</p></div>`;
  }

  private button(href: string, text: string): string {
    return `<div class="btn"><a href="${this.safeUrl(href)}">${this.escapeHtml(text)}</a></div>`;
  }

  private securityNotice(message: string): string {
    return `<div class="security-notice"><strong>Security Notice:</strong> ${message}</div>`;
  }

  private badge(type: "success" | "warning" | "error", text: string): string {
    const cls = type === "success" ? "badge-success" : type === "warning" ? "badge-warning" : "badge-error";
    return `<span class="badge ${cls}">${this.escapeHtml(text)}</span>`;
  }

  // --- AUTHENTICATION TEMPLATES ---

  private authTemplate(title: string, vars: Record<string, string>, message: string, level?: "warning"): EmailTemplate {
    const name = vars.firstName ?? "there";
    const time = vars.time ?? new Date().toLocaleString();
    return {
      subject: `${title} — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:${level === "warning" ? "#dc2626" : this.secondaryColor};">${title}</h2>
        ${this.greeting(vars)}
        <p>${message}</p>
        ${vars.details ? `<p>${vars.details}</p>` : ""}
        ${this.summaryCard([{ label: "Time", value: time }, ...(vars.date ? [{ label: "Date", value: vars.date }] : [])])}
        ${level === "warning" ? this.securityNotice("If you did not perform this action, please contact support immediately.") : ""}
        ${this.button(`${this.frontendUrl}/dashboard`, "Go to Dashboard")}
        <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">Need help? Contact us at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
      `),
      text: `${title}\n\nHello ${name},\n\n${this.stripHtml(message)}\n\nTime: ${time}\n\nDashboard: ${this.frontendUrl}/dashboard`,
    };
  }

  private verificationTemplate(vars: Record<string, string>): EmailTemplate {
    const name = vars.firstName ?? "there";
    const code = vars.verificationCode ?? "------";
    return {
      subject: `Verify Your ${this.appName} Account`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">Verify Your Email Address</h2>
        ${this.greeting(vars)}
        <p>Thank you for creating an account with ${this.appName}. Please use the verification code below to activate your account:</p>
        <div style="text-align:center;margin:24px 0;padding:16px;background-color:${this.primaryColor}10;border-radius:8px;border:1px solid ${this.primaryColor}30;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:${this.primaryColor};">${code}</span>
        </div>
        <p style="font-size:13px;color:#6b7280;">This code expires in 10 minutes. If you did not create an account, please ignore this email.</p>
        ${vars.confirmLink ? this.button(vars.confirmLink, "Verify Email") : ""}
      `),
      text: `Verify Your ${this.appName} Account\n\nHello ${name},\n\nThank you for creating an account. Use this verification code:\n\n${code}\n\nThis code expires in 10 minutes.`,
    };
  }

  private passwordResetTemplate(vars: Record<string, string>): EmailTemplate {
    const name = vars.firstName ?? "there";
    const code = vars.verificationCode ?? "------";
    return {
      subject: `Reset Your ${this.appName} Password`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">Reset Your Password</h2>
        ${this.greeting(vars)}
        <p>We received a request to reset the password for your ${this.appName} account. Use the code below to reset your password:</p>
        <div style="text-align:center;margin:24px 0;padding:16px;background-color:${this.primaryColor}10;border-radius:8px;border:1px solid ${this.primaryColor}30;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:${this.primaryColor};">${code}</span>
        </div>
        <p style="font-size:13px;color:#6b7280;">This code expires in 10 minutes. If you did not request a password reset, please ignore this email or contact support.</p>
        ${this.securityNotice("If you didn't request this, someone else may be trying to access your account. Please secure your account immediately.")}
      `),
      text: `Reset Your ${this.appName} Password\n\nHello ${name},\n\nWe received a password reset request. Use this code:\n\n${code}\n\nThis code expires in 10 minutes. If you didn't request this, please contact support.`,
    };
  }

  private loginAlertTemplate(vars: Record<string, string>, customTitle?: string): EmailTemplate {
    const device = vars.device ?? "Unknown device";
    const time = vars.time ?? new Date().toLocaleString();
    const location = vars.location ?? "Unknown location";
    const title = customTitle ?? "New Login Detected";
    return {
      subject: `${title} — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">${title}</h2>
        ${this.greeting(vars)}
        <p>A new sign-in was detected on your ${this.appName} account. If this was you, no action is needed.</p>
        ${this.summaryCard([
          { label: "Device", value: device },
          { label: "Time", value: time },
          { label: "Location", value: location },
          ...(vars.ip ? [{ label: "IP Address", value: vars.ip }] : []),
        ])}
        ${this.securityNotice("If you don't recognize this activity, secure your account immediately.")}
        ${this.button(`${this.frontendUrl}/security`, "Review Account Security")}
      `),
      text: `${title}\n\nDevice: ${device}\nTime: ${time}\nLocation: ${location}\n\nIf you don't recognize this activity, secure your account immediately.\n\nReview account security: ${this.frontendUrl}/security`,
    };
  }

  // --- GROUP TEMPLATES ---

  private groupTemplate(title: string, vars: Record<string, string>, message: string): EmailTemplate {
    return {
      subject: `${title} — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">${title}</h2>
        ${this.greeting(vars)}
        <p>${message}</p>
        ${this.summaryCard([
          ...(vars.groupName ? [{ label: "Group", value: vars.groupName }] : []),
          ...(vars.memberCount ? [{ label: "Members", value: vars.memberCount }] : []),
          ...(vars.groupType ? [{ label: "Type", value: vars.groupType }] : []),
        ])}
        ${this.button(`${this.frontendUrl}/groups/${vars.groupId ?? ""}`, "View Group")}
      `),
      text: `${title}\n\n${this.stripHtml(message)}\n\nGroup: ${vars.groupName ?? "N/A"}\n\nView group: ${this.frontendUrl}/groups/${vars.groupId ?? ""}`,
    };
  }

  private groupInvitationTemplate(vars: Record<string, string>): EmailTemplate {
    const groupName = vars.groupName ?? "a savings group";
    const adminName = vars.adminName ?? "the group admin";
    const contributionAmount = vars.contributionAmount ?? "---";
    const contributionFrequency = vars.contributionFrequency ?? "---";
    return {
      subject: `You're Invited to Join "${groupName}" on ${this.appName}`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">You're Invited to Join!</h2>
        ${this.greeting(vars)}
        <p><strong>${adminName}</strong> has invited you to join <strong>${groupName}</strong> on ${this.appName}.</p>
        <p>${this.appName} helps groups save together, track contributions, and manage payouts — all in one place.</p>
        ${this.amountBox(`${contributionAmount} NGN`, `${contributionFrequency} contribution`)}
        ${this.summaryCard([
          { label: "Group", value: groupName },
          { label: "Invited by", value: adminName },
          { label: "Frequency", value: contributionFrequency },
        ])}
        ${this.button(`${this.frontendUrl}/invitations?code=${vars.inviteCode ?? ""}`, "Accept Invitation")}
        <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">This invitation expires in 7 days. If you don't have an account, you'll be guided to create one.</p>
      `),
      text: `You're Invited to Join "${groupName}" on ${this.appName}\n\nHello ${vars.firstName ?? "there"},\n\n${adminName} has invited you to join ${groupName}.\n\nGroup: ${groupName}\nInvited by: ${adminName}\nContribution: ${contributionAmount} NGN\nFrequency: ${contributionFrequency}\n\nAccept invitation: ${this.frontendUrl}/invitations?code=${vars.inviteCode ?? ""}`,
    };
  }

  // --- CONTRIBUTION TEMPLATES ---

  private contributionTemplate(title: string, vars: Record<string, string>, message: string): EmailTemplate {
    return {
      subject: `${title} — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">${title}</h2>
        ${this.greeting(vars)}
        <p>${message}</p>
        ${this.summaryCard([
          ...(vars.groupName ? [{ label: "Group", value: vars.groupName }] : []),
          ...(vars.amount ? [{ label: "Amount", value: `${vars.amount} NGN` }] : []),
          ...(vars.dueDate ? [{ label: "Due Date", value: vars.dueDate }] : []),
          ...(vars.cycleNumber ? [{ label: "Cycle", value: vars.cycleNumber }] : []),
          ...(vars.status ? [{ label: "Status", value: this.badge(vars.status === "Overdue" || vars.status === "Failed" ? "error" : "success", vars.status) }] : []),
        ])}
        ${this.button(`${this.frontendUrl}/contributions`, "View Contributions")}
      `),
      text: `${title}\n\n${this.stripHtml(message)}\n\nGroup: ${vars.groupName ?? "N/A"}\nAmount: ${vars.amount ? `${vars.amount} NGN` : "N/A"}\n\nView contributions: ${this.frontendUrl}/contributions`,
    };
  }

  private contributionReminderTemplate(vars: Record<string, string>): EmailTemplate {
    const amount = vars.amount ?? "0";
    const dueDate = vars.dueDate ?? "---";
    const groupName = vars.groupName ?? "your group";
    return {
      subject: `Contribution Reminder — ${amount} NGN Due for ${groupName}`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">Contribution Reminder</h2>
        ${this.greeting(vars)}
        <p>This is a friendly reminder that your contribution is due. Making timely payments keeps your group's savings on track.</p>
        ${this.amountBox(`${amount} NGN`, `Due ${dueDate}`)}
        ${this.summaryCard([
          { label: "Group", value: groupName },
          { label: "Amount Due", value: `${amount} NGN` },
          { label: "Due Date", value: dueDate },
        ])}
        <p>What happens next: After you contribute, the payment is verified and credited to the group's savings pool. Your group can then distribute payouts according to the schedule.</p>
        ${this.button(`${this.frontendUrl}/contribute`, "Make Payment Now")}
        <p style="font-size:13px;color:#6b7280;">If you have already made this payment, please ignore this reminder.</p>
      `),
      text: `Contribution Reminder — ${amount} NGN Due for ${groupName}\n\nYour contribution of ${amount} NGN is due on ${dueDate} for ${groupName}.\n\nMake payment: ${this.frontendUrl}/contribute`,
    };
  }

  private contributionOverdueTemplate(vars: Record<string, string>): EmailTemplate {
    const amount = vars.amount ?? "0";
    const groupName = vars.groupName ?? "your group";
    const dueDate = vars.dueDate ?? "---";
    return {
      subject: `Overdue Contribution — ${amount} NGN for ${groupName}`,
      html: this.layout(`
        <h2 style="color:#dc2626;">Contribution Overdue</h2>
        ${this.greeting(vars)}
        <p>Your contribution of <strong>${amount} NGN</strong> for <strong>${groupName}</strong> is now overdue. Please make your payment as soon as possible to avoid any disruption to your group's savings cycle.</p>
        ${this.amountBox(`${amount} NGN`, "Outstanding Balance")}
        ${this.summaryCard([
          { label: "Group", value: groupName },
          { label: "Outstanding Amount", value: `${amount} NGN` },
          { label: "Original Due Date", value: dueDate },
          { label: "Status", value: this.badge("error", "Overdue") },
        ])}
        <p>Continued missed contributions may affect your standing in the group and delay payouts for other members.</p>
        ${this.button(`${this.frontendUrl}/contribute`, "Pay Now")}
        <p style="font-size:13px;color:#6b7280;">If you need assistance, contact your group admin or our support team at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
      `),
      text: `Overdue Contribution — ${amount} NGN for ${groupName}\n\nYour contribution of ${amount} NGN for ${groupName} is overdue (due ${dueDate}).\n\nPay now: ${this.frontendUrl}/contribute`,
    };
  }

  // --- PAYMENT TEMPLATES ---

  private paymentTemplate(title: string, vars: Record<string, string>, message: string): EmailTemplate {
    return {
      subject: `${title} — ${vars.amount ? `${vars.amount} NGN` : this.appName}`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">${title}</h2>
        ${this.greeting(vars)}
        <p>${message}</p>
        ${this.summaryCard([
          ...(vars.amount ? [{ label: "Amount", value: `${vars.amount} NGN` }] : []),
          ...(vars.reference ? [{ label: "Reference", value: vars.reference }] : []),
          ...(vars.date ? [{ label: "Date", value: vars.date }] : []),
          ...(vars.method ? [{ label: "Payment Method", value: vars.method }] : []),
          ...(vars.groupName ? [{ label: "Group", value: vars.groupName }] : []),
          ...(vars.status ? [{ label: "Status", value: vars.status }] : []),
        ])}
        ${this.button(`${this.frontendUrl}/payments`, "View Payment History")}
      `),
      text: `${title}\n\n${this.stripHtml(message)}\n\nAmount: ${vars.amount ? `${vars.amount} NGN` : "N/A"}\nReference: ${vars.reference ?? "N/A"}\n\nView payments: ${this.frontendUrl}/payments`,
    };
  }

  private paymentReceiptTemplate(vars: Record<string, string>): EmailTemplate {
    const amount = vars.amount ?? "0";
    const reference = vars.reference ?? "---";
    const date = vars.date ?? new Date().toLocaleDateString();
    const method = vars.method ?? "Bank Transfer";
    const groupName = vars.groupName ?? "---";
    const receiptNo = vars.receiptNumber ?? `RCP-${reference.slice(0, 8)}`;
    return {
      subject: `Payment Receipt — ${amount} NGN — ${this.appName}`,
      html: this.layout(`
        <div style="text-align:center;margin-bottom:16px;">
          <p style="font-size:12px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin:0;">Payment Receipt</p>
          <p style="font-size:13px;color:#6b7280;margin:4px 0 0;">${receiptNo}</p>
        </div>
        ${this.amountBox(`${amount} NGN`, "Total Paid")}
        <p>Your payment has been processed successfully. Below are the details of this transaction.</p>
        ${this.summaryCard([
          { label: "Receipt Number", value: receiptNo },
          { label: "Amount Paid", value: `${amount} NGN` },
          { label: "Transaction Reference", value: reference },
          { label: "Date", value: date },
          { label: "Payment Method", value: method },
          ...(groupName !== "---" ? [{ label: "Group", value: groupName }] : []),
          { label: "Status", value: this.badge("success", "Successful") },
        ])}
        <p style="font-size:13px;color:#6b7280;margin:8px 0 0;">
          This receipt serves as confirmation of your payment. Please retain it for your records.
          You can view and download all your receipts from your payment history.
        </p>
        ${this.button(`${this.frontendUrl}/payments/${vars.paymentId ?? ""}`, "View Receipt Online")}
        <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">
          Need a PDF copy? Visit your payment history to download a printable receipt.
        </p>
      `),
      text: `PAYMENT RECEIPT\n${receiptNo}\n\nAmount: ${amount} NGN\nReference: ${reference}\nDate: ${date}\nMethod: ${method}\nGroup: ${groupName}\nStatus: Successful\n\nView receipt: ${this.frontendUrl}/payments/${vars.paymentId ?? ""}`,
    };
  }

  private paymentFailedTemplate(vars: Record<string, string>): EmailTemplate {
    const amount = vars.amount ?? "0";
    const reason = vars.reason ?? "Unable to process payment";
    const groupName = vars.groupName ?? "---";
    return {
      subject: `Payment Failed — ${amount} NGN — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:#dc2626;">Payment Failed</h2>
        ${this.greeting(vars)}
        <p>We were unable to process your payment of <strong>${amount} NGN</strong>. Don't worry — here's what happened and what you can do next.</p>
        ${this.summaryCard([
          { label: "Amount", value: `${amount} NGN` },
          { label: "Reason", value: reason },
          ...(groupName !== "---" ? [{ label: "Group", value: groupName }] : []),
          { label: "Status", value: this.badge("error", "Failed") },
        ])}
        <p><strong>Recommended steps:</strong></p>
        <ol style="color:#374151;line-height:1.8;padding-left:20px;">
          <li>Check that your payment method has sufficient funds</li>
          <li>Verify your account details are correct</li>
          <li>Try the payment again</li>
          <li>If the issue persists, contact your bank or our support team</li>
        </ol>
        ${this.button(`${this.frontendUrl}/payments/retry/${vars.paymentId ?? ""}`, "Retry Payment")}
        <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">Need assistance? Contact <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
      `),
      text: `Payment Failed — ${amount} NGN\n\nYour payment of ${amount} NGN failed.\n\nReason: ${reason}\nGroup: ${groupName}\n\nRecommended steps:\n1. Check your payment method\n2. Verify account details\n3. Try again\n4. Contact support\n\nRetry: ${this.frontendUrl}/payments/retry/${vars.paymentId ?? ""}`,
    };
  }

  // --- PAYOUT TEMPLATES ---

  private payoutTemplate(title: string, vars: Record<string, string>, message: string, level?: "warning"): EmailTemplate {
    return {
      subject: `${title} — ${vars.amount ? `${vars.amount} NGN` : this.appName}`,
      html: this.layout(`
        <h2 style="color:${level === "warning" ? "#dc2626" : this.secondaryColor};">${title}</h2>
        ${this.greeting(vars)}
        <p>${message}</p>
        ${this.summaryCard([
          ...(vars.amount ? [{ label: "Amount", value: `${vars.amount} NGN` }] : []),
          ...(vars.recipientName ? [{ label: "Recipient", value: vars.recipientName }] : []),
          ...(vars.reference ? [{ label: "Reference", value: vars.reference }] : []),
          ...(vars.date ? [{ label: "Date", value: vars.date }] : []),
          ...(vars.status ? [{ label: "Status", value: level === "warning" ? this.badge("error", vars.status) : this.badge("success", vars.status) }] : []),
        ])}
        ${this.button(`${this.frontendUrl}/payouts`, "View Payouts")}
        <p style="font-size:13px;color:#6b7280;">Need help? Contact <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
      `),
      text: `${title}\n\n${this.stripHtml(message)}\n\nAmount: ${vars.amount ? `${vars.amount} NGN` : "N/A"}\n\nView payouts: ${this.frontendUrl}/payouts`,
    };
  }

  private payoutPendingApprovalTemplate(vars: Record<string, string>): EmailTemplate {
    const amount = vars.amount ?? "0";
    const recipientName = vars.recipientName ?? "---";
    const recipientAccount = vars.recipientAccount ?? "---";
    return {
      subject: `Payout Requires Your Approval — ${amount} NGN — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:${this.secondaryColor};">Payout Approval Required</h2>
        ${this.greeting(vars)}
        <p>A new payout request requires your review and approval. As a group admin, please verify the details below before approving.</p>
        ${this.amountBox(`${amount} NGN`, "Payout Amount")}
        ${this.summaryCard([
          { label: "Amount", value: `${amount} NGN` },
          { label: "Recipient", value: recipientName },
          { label: "Destination Account", value: recipientAccount },
          { label: "Requested by", value: vars.requestedByName ?? "---" },
          { label: "Status", value: this.badge("warning", "Pending Approval") },
        ])}
        <p><strong>Please review carefully:</strong> Once approved, the payout will be processed and funds will be transferred to the recipient's account. Ensure the group wallet has sufficient balance.</p>
        ${this.button(`${this.frontendUrl}/payouts/${vars.payoutId ?? ""}/review`, "Review & Approve")}
        <p style="font-size:13px;color:#6b7280;">If you have questions about this payout, contact the requestor or group members.</p>
      `),
      text: `Payout Requires Your Approval — ${amount} NGN\n\nA new payout request needs your approval.\n\nAmount: ${amount} NGN\nRecipient: ${recipientName}\nAccount: ${recipientAccount}\n\nReview: ${this.frontendUrl}/payouts/${vars.payoutId ?? ""}/review`,
    };
  }

  private payoutReceiptTemplate(vars: Record<string, string>): EmailTemplate {
    const amount = vars.amount ?? "0";
    const reference = vars.reference ?? "---";
    const date = vars.date ?? new Date().toLocaleDateString();
    const recipientName = vars.recipientName ?? "---";
    const bankName = vars.bankName ?? "---";
    const accountMasked = vars.accountMasked ?? "---";
    const receiptNo = vars.receiptNumber ?? `RCP-PO-${reference.slice(0, 8)}`;
    return {
      subject: `Payout Receipt — ${amount} NGN Sent — ${this.appName}`,
      html: this.layout(`
        <div style="text-align:center;margin-bottom:16px;">
          <p style="font-size:12px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin:0;">Payout Receipt</p>
          <p style="font-size:13px;color:#6b7280;margin:4px 0 0;">${receiptNo}</p>
        </div>
        ${this.amountBox(`${amount} NGN`, "Amount Transferred")}
        <p>Your payout has been processed successfully. The funds have been sent to your registered bank account.</p>
        ${this.summaryCard([
          { label: "Receipt Number", value: receiptNo },
          { label: "Recipient", value: recipientName },
          { label: "Amount Transferred", value: `${amount} NGN` },
          { label: "Bank", value: bankName },
          { label: "Account Number", value: accountMasked },
          { label: "Transfer Reference", value: reference },
          { label: "Date", value: date },
          { label: "Status", value: this.badge("success", "Completed") },
        ])}
        <p style="font-size:13px;color:#6b7280;margin:8px 0 0;">
          Funds may take 1-2 business days to reflect in your account depending on your bank.
          This receipt is your official payment confirmation. Please retain it for your records.
        </p>
        ${this.button(`${this.frontendUrl}/payouts/${vars.payoutId ?? ""}`, "View Payout Details")}
        <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">
          Need a PDF copy? Visit your payout history to download a printable receipt.
        </p>
      `),
      text: `PAYOUT RECEIPT\n${receiptNo}\n\nRecipient: ${recipientName}\nAmount: ${amount} NGN\nBank: ${bankName}\nAccount: ${accountMasked}\nReference: ${reference}\nDate: ${date}\nStatus: Completed\n\nView payout: ${this.frontendUrl}/payouts/${vars.payoutId ?? ""}`,
    };
  }

  private payoutFailedTemplate(vars: Record<string, string>): EmailTemplate {
    const amount = vars.amount ?? "0";
    const reason = vars.reason ?? "Transfer failed";
    return {
      subject: `Payout Failed — ${amount} NGN — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:#dc2626;">Payout Failed</h2>
        ${this.greeting(vars)}
        <p>Unfortunately, your payout of <strong>${amount} NGN</strong> could not be completed.</p>
        ${this.summaryCard([
          { label: "Amount", value: `${amount} NGN` },
          { label: "Reason", value: reason },
          { label: "Status", value: this.badge("error", "Failed") },
        ])}
        <p><strong>What happens next:</strong></p>
        <ul style="color:#374151;line-height:1.8;padding-left:20px;">
          <li>The funds remain in your group wallet</li>
          <li>Your group admin can review the failure reason and retry the payout</li>
          <li>If the issue is with your bank account details, please update them before retry</li>
        </ul>
        <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">Need help? Contact <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
      `),
      text: `Payout Failed — ${amount} NGN\n\nYour payout of ${amount} NGN could not be completed.\n\nReason: ${reason}\n\nThe funds remain in your group wallet. Contact your admin or support for assistance.\n\nContact support: ${this.supportEmail}`,
    };
  }

  // --- SECURITY TEMPLATES ---

  private securityAlertTemplate(vars: Record<string, string>): EmailTemplate {
    const issue = vars.issue ?? "Suspicious activity detected";
    const recommendation = vars.recommendation ?? "Review your account security settings";
    return {
      subject: `Security Alert — Immediate Action Required — ${this.appName}`,
      html: this.layout(`
        <h2 style="color:#dc2626;">Security Alert</h2>
        ${this.greeting(vars)}
        <p>We detected unusual activity on your ${this.appName} account. Your account security is our top priority.</p>
        ${this.summaryCard([
          { label: "Issue", value: issue },
          { label: "Time", value: vars.time ?? new Date().toLocaleString() },
          ...(vars.location ? [{ label: "Location", value: vars.location }] : []),
          ...(vars.device ? [{ label: "Device", value: vars.device }] : []),
        ])}
        <p><strong>Recommended action:</strong> ${recommendation}</p>
        ${this.securityNotice("If you did not perform this action, your account may be compromised. Please secure it immediately.")}
        ${this.button(`${this.frontendUrl}/security`, "Secure Your Account Now")}
        <p style="font-size:13px;color:#6b7280;margin:16px 0 0;">For immediate assistance, contact our support team at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
      `),
      text: `Security Alert — Immediate Action Required\n\nWe detected unusual activity on your ${this.appName} account.\n\nIssue: ${issue}\nTime: ${vars.time ?? new Date().toLocaleString()}\n\nRecommended action: ${recommendation}\n\nSecure your account: ${this.frontendUrl}/security\n\nContact support: ${this.supportEmail}`,
    };
  }

  // --- FALLBACK ---

  private fallbackTemplate(vars: Record<string, string>): EmailTemplate {
    const title = vars.title ?? "Notification";
    const message = vars.message ?? "";
    return {
      subject: `${title} — ${this.appName}`,
      html: this.layout(`<h2 style="color:${this.secondaryColor};">${title}</h2><p>${message}</p>`),
      text: `${title}\n\n${message}`,
    };
  }
}
