/**
 * @fileoverview Service Module
 * @module src/app/api/lib/email/email.service
 * @description This file contains service functions for email operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * EmailOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for EmailOptions
 */
export interface EmailOptions {
  /** To */
  to: string | string[];
  /** Subject */
  subject: string;
  /** Html */
  html: string;
  /** Text */
  text?: string;
  /** From */
  from?: string;
  /** Reply To */
  replyTo?: string;
}

/**
 * EmailResult interface
 * 
 * @interface
 * @description Defines the structure and contract for EmailResult
 */
export interface EmailResult {
  /** Success */
  success: boolean;
  /** Message Id */
  messageId?: string;
  /** Error */
  error?: string;
}

/**
 * EmailService class
 * 
 * @class
 * @description Description of EmailService class functionality
 */
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
      console.warn(
        "⚠️ Email service not configured. Set RESEND_API_KEY in environment variables."
      );
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
        /** Success */
        success: true,
        /** Message Id */
        messageId: `dev-${Date.now()}`,
      };
    }

    // Production mode: Send via Resend
    if (!this.isConfigured) {
      return {
        /** Success */
        success: false,
        /** Error */
        error:
          "Email service not configured. Please add RESEND_API_KEY to environment variables.",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        /** Method */
        method: "POST",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
          /** Authorization */
          Authorization: `Bearer ${this.apiKey}`,
        },
        /** Body */
        body: JSON.stringify({
          from,
          /** To */
          to: Array.isArray(options.to) ? options.to : [options.to],
          /** Subject */
          subject: options.subject,
          /** Html */
          html: options.html,
          /** Text */
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Email sending failed:", error);
        return {
          /** Success */
          success: false,
          /** Error */
          error: error.message || "Failed to send email",
        };
      }

      const data = await response.json();
      console.log("✅ Email sent successfully:", data.id);

      return {
        /** Success */
        success: true,
        /** Message Id */
        messageId: data.id,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Email service error";
      console.error("❌ Email service error:", error);
      return {
        /** Success */
        success: false,
        /** Error */
        error: errorMessage,
      };
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(
    /** Email */
    email: string,
    /** Name */
    name: string,
    /** Verification Link */
    verificationLink: string
  ): Promise<EmailResult> {
    const html = getVerificationEmailTemplate(name, verificationLink);
    const text = getVerificationEmailText(name, verificationLink);

    return this.send({
      /** To */
      to: email,
      /** Subject */
      subject: "Verify your email address - Letitrip",
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    /** Email */
    email: string,
    /** Name */
    name: string,
    /** Reset Link */
    resetLink: string
  ): Promise<EmailResult> {
    const html = getPasswordResetEmailTemplate(name, resetLink);
    const text = getPasswordResetEmailText(name, resetLink);

    return this.send({
      /** To */
      to: email,
      /** Subject */
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
      /** To */
      to: email,
      /** Subject */
      subject: "Welcome to Letitrip! 🎉",
      html,
      text,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
