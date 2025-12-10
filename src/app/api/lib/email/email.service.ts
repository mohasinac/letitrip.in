/**
 * Email Service (Backend)
 *
 * Handles sending emails using Resend API (or fallback to console logging in development)
 *
 * Setup:
 * 1. Sign up at https://resend.com (free tier: 3,000 emails/month)
 * 2. Get your API key
 * 3. Add to .env.local: RESEND_API_KEY=re_your_api_key
 * 4. Verify your domain (or use onboarding@resend.dev for testing)
 */

import {
  getPasswordResetEmailTemplate,
  getPasswordResetEmailText,
} from "./templates/password-reset.template";
import {
  getVerificationEmailTemplate,
  getVerificationEmailText,
} from "./templates/verification.template";
import {
  getWelcomeEmailTemplate,
  getWelcomeEmailText,
} from "./templates/welcome.template";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
    this.fromEmail = process.env.EMAIL_FROM || "noreply@letitrip.in";
    this.fromName = process.env.EMAIL_FROM_NAME || "Letitrip";
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      const message =
        "⚠️ Email service not configured. Set RESEND_API_KEY in environment variables.";

      // In production, throw error to prevent deployment without email config
      if (process.env.NODE_ENV === "production") {
        throw new Error(message);
      }

      console.warn(message);
    }
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    const from = options.from || `${this.fromName} <${this.fromEmail}>`;

    // Development mode: Log email instead of sending
    if (process.env.NODE_ENV === "development" && !this.isConfigured) {
      console.log("📧 [EMAIL SERVICE - DEV MODE]");
      console.log("From:", from);
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("HTML Preview:", options.html.substring(0, 200) + "...");
      if (options.text) {
        console.log("Text:", options.text.substring(0, 200) + "...");
      }
      console.log("---");

      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      };
    }

    // Production mode: Send via Resend
    if (!this.isConfigured) {
      return {
        success: false,
        error:
          "Email service not configured. Please add RESEND_API_KEY to environment variables.",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Email sending failed:", error);
        return {
          success: false,
          error: error.message || "Failed to send email",
        };
      }

      const data = await response.json();
      console.log("✅ Email sent successfully:", data.id);

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Email service error";
      console.error("❌ Email service error:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    verificationLink: string
  ): Promise<EmailResult> {
    const html = getVerificationEmailTemplate(name, verificationLink);
    const text = getVerificationEmailText(name, verificationLink);

    return this.send({
      to: email,
      subject: "Verify your email address - Letitrip",
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetLink: string
  ): Promise<EmailResult> {
    const html = getPasswordResetEmailTemplate(name, resetLink);
    const text = getPasswordResetEmailText(name, resetLink);

    return this.send({
      to: email,
      subject: "Reset your password - Letitrip",
      html,
      text,
    });
  }

  /**
   * Send welcome email (after verification)
   */
  async sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    const html = getWelcomeEmailTemplate(name);
    const text = getWelcomeEmailText(name);

    return this.send({
      to: email,
      subject: "Welcome to Letitrip! 🎉",
      html,
      text,
    });
  }
}

// Export class for testing and extensions
export { EmailService };

// Export singleton instance for application use
export const emailService = new EmailService();
