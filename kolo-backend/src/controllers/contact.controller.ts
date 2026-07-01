import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ResponseUtil } from "../utils/response.util";
import { ValidationError } from "../errors/validation.error";
import { EnvConfig } from "../config/env.config";
import { SmtpProvider } from "../integrations/email/smtp.provider";
import { Logger } from "../logger/core/logger";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export class ContactController {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("contact-controller");
  }

  async submit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = contactSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const env = EnvConfig.getInstance();

    if (!env.APP_SUPPORT_EMAIL) {
      ResponseUtil.success(reply, { message: "Message received. We will get back to you within 24 hours." });
      return;
    }

    this.logger.info("Contact form submission", {
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      email: parsed.data.email,
      subject: parsed.data.subject,
    });

    try {
      const provider = new SmtpProvider();
      await provider.send({
        to: env.APP_SUPPORT_EMAIL,
        subject: `[Kolo Contact] ${parsed.data.subject}`,
        html: `<p><strong>From:</strong> ${parsed.data.firstName} ${parsed.data.lastName} (${parsed.data.email})</p><p><strong>Message:</strong></p><p>${parsed.data.message.replace(/\n/g, "<br>")}</p>`,
        text: `From: ${parsed.data.firstName} ${parsed.data.lastName} (${parsed.data.email})\n\nMessage:\n${parsed.data.message}`,
      });
    } catch (err) {
      this.logger.warn("Failed to email contact form notification", { error: String(err) });
    }

    ResponseUtil.success(reply, { message: "Message received. We will get back to you within 24 hours." });
  }
}
