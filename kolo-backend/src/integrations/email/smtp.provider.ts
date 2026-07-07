import dns from "dns/promises";
import { isIPv4 } from "net";
import nodemailer from "nodemailer";
import type { EmailProvider, SendEmailOptions, EmailProviderResult } from "./email-provider.interface";
import { EnvConfig } from "../../config/env.config";
import { Logger } from "../../logger/core/logger";

export class SmtpProvider implements EmailProvider {
  private transporter: nodemailer.Transporter | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly env: EnvConfig;
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("smtp-provider");
    this.env = EnvConfig.getInstance();
    this.fromEmail = this.env.SMTP_FROM_EMAIL;
    this.fromName = this.env.SMTP_FROM_NAME;
  }

  private async initTransport(): Promise<nodemailer.Transporter | null> {
    if (this.transporter !== null) return this.transporter;
    if (this.initPromise) return this.initPromise.then(() => this.transporter);

    this.initPromise = this.init();
    await this.initPromise;
    return this.transporter;
  }

  private async init(): Promise<void> {
    if (!this.env.SMTP_USER || !this.env.SMTP_PASSWORD || this.env.SMTP_HOST === "localhost") {
      this.logger.warn("SMTP not fully configured, emails will be logged only");
      this.transporter = null;
      return;
    }

    let host = this.env.SMTP_HOST;
    if (!isIPv4(host)) {
      try {
        const addresses = await dns.resolve4(host);
        if (addresses.length > 0) {
          this.logger.info(`Resolved SMTP host ${host} to IPv4 ${addresses[0]}`);
          host = addresses[0];
        }
      } catch (err) {
        this.logger.warn(`Failed to resolve SMTP host ${host} to IPv4, using hostname as-is`, { error: String(err) });
      }
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: this.env.SMTP_PORT,
      secure: this.env.SMTP_PORT === 465,
      auth: {
        user: this.env.SMTP_USER,
        pass: this.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  async send(options: SendEmailOptions): Promise<EmailProviderResult> {
    try {
      this.logger.info("Sending email", { to: options.to, subject: options.subject });

      const transporter = await this.initTransport();

      if (!transporter) {
        this.logger.warn("Email transport not configured, simulating send", { to: options.to });
        return { success: true, providerReference: `sim-${Date.now()}` };
      }

      const info = await transporter.sendMail({
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
      this.logger.error(`SMTP send failed: ${msg}`);
      return { success: false, error: msg };
    }
  }
}
