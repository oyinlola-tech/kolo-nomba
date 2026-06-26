import nodemailer from "nodemailer";
import type { EmailProvider, SendEmailOptions, EmailProviderResult } from "./email-provider.interface";
import { EnvConfig } from "../../config/env.config";
import { Logger } from "../../logger/core/logger";

export class SmtpProvider implements EmailProvider {
  private readonly transporter: nodemailer.Transporter | null;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("smtp-provider");
    const env = EnvConfig.getInstance();

    this.fromEmail = env.SMTP_FROM_EMAIL;
    this.fromName = env.SMTP_FROM_NAME;

    if (!env.SMTP_USER || !env.SMTP_PASSWORD || env.SMTP_HOST === "localhost") {
      this.logger.warn("SMTP not fully configured, emails will be logged only");
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    }
  }

  async send(options: SendEmailOptions): Promise<EmailProviderResult> {
    try {
      this.logger.info("Sending email", { to: options.to, subject: options.subject });

      if (!this.transporter) {
        this.logger.warn("Email transport not configured, simulating send", { to: options.to });
        return { success: true, providerReference: `sim-${Date.now()}` };
      }

      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.info("Email sent", { to: options.to, messageId: info.messageId });
      return { success: true, providerReference: info.messageId };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error("SMTP send failed", { error: msg });
      return { success: false, error: msg };
    }
  }
}
