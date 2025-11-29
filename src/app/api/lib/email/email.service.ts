/**
 * Email Service
 *
 * Handles sending emails using Resend API (or fallback to console logging in development)
 *
 * Setup:
 * 1. Sign up at https://resend.com (free tier: 3,000 emails/month)
 * 2. Get your API key
 * 3. Add to .env.local: RESEND_API_KEY=re_your_api_key
 * 4. Verify your domain (or use onboarding@resend.dev for testing)
 *
 * Alternative providers:
 * - SendGrid: https://sendgrid.com (free tier: 100 emails/day)
 * - AWS SES: https://aws.amazon.com/ses/ (62,000 emails/month free with EC2)
 * - Postmark: https://postmarkapp.com (free tier: 100 emails/month)
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
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
    this.fromEmail = process.env.EMAIL_FROM || "noreply@justforview.in";
    this.fromName = process.env.EMAIL_FROM_NAME || "JustForView";
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      console.warn(
        "⚠️ Email service not configured. Set RESEND_API_KEY in environment variables.",
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
    } catch (error: any) {
      console.error("❌ Email service error:", error);
      return {
        success: false,
        error: error.message || "Email service error",
      };
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    verificationLink: string,
  ): Promise<EmailResult> {
    const html = this.getVerificationEmailTemplate(name, verificationLink);
    const text = `Hi ${name},\n\nThank you for registering with JustForView!\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.\n\nBest regards,\nThe JustForView Team`;

    return this.send({
      to: email,
      subject: "Verify your email address - JustForView",
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
    resetLink: string,
  ): Promise<EmailResult> {
    const html = this.getPasswordResetEmailTemplate(name, resetLink);
    const text = `Hi ${name},\n\nWe received a request to reset your password for your JustForView account.\n\nClick the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, you can safely ignore this email.\n\nBest regards,\nThe JustForView Team`;

    return this.send({
      to: email,
      subject: "Reset your password - JustForView",
      html,
      text,
    });
  }

  /**
   * Send welcome email (after verification)
   */
  async sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    const html = this.getWelcomeEmailTemplate(name);
    const text = `Hi ${name},\n\nWelcome to JustForView! 🎉\n\nYour email has been verified and your account is now active.\n\nExplore our marketplace:\n- Browse thousands of products\n- List your own products for sale\n- Participate in exciting auctions\n- Create your own shop\n\nGet started: https://justforview.in\n\nBest regards,\nThe JustForView Team`;

    return this.send({
      to: email,
      subject: "Welcome to JustForView! 🎉",
      html,
      text,
    });
  }

  /**
   * Email verification template
   */
  private getVerificationEmailTemplate(
    name: string,
    verificationLink: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">JustForView</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
    
    <p style="font-size: 16px;">Thank you for registering with <strong>JustForView</strong>!</p>
    
    <p style="font-size: 16px;">Please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Verify Email Address
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
      ${verificationLink}
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Note:</strong> This link will expire in 24 hours.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      If you didn't create an account with JustForView, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} JustForView. All rights reserved.<br>
      India's Premium Auction & Marketplace Platform
    </p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Password reset template
   */
  private getPasswordResetEmailTemplate(
    name: string,
    resetLink: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">JustForView</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name}! 🔐</h2>
    
    <p style="font-size: 16px;">We received a request to reset your password.</p>
    
    <p style="font-size: 16px;">Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
      ${resetLink}
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Note:</strong> This link will expire in 1 hour for security reasons.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} JustForView. All rights reserved.<br>
      India's Premium Auction & Marketplace Platform
    </p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Welcome email template
   */
  private getWelcomeEmailTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JustForView!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to JustForView! 🎉</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
    
    <p style="font-size: 16px;">Your email has been verified and your account is now <strong>active</strong>!</p>
    
    <p style="font-size: 16px;">Here's what you can do on JustForView:</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <ul style="font-size: 14px; line-height: 2;">
        <li>🛍️ Browse thousands of products across multiple categories</li>
        <li>📦 List your own products for sale</li>
        <li>⚡ Participate in exciting auctions</li>
        <li>🏪 Create your own shop and start selling</li>
        <li>⭐ Rate and review products</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://justforview.in" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Start Exploring
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Need help? Check out our <a href="https://justforview.in/guide" style="color: #667eea;">User Guide</a> or <a href="https://justforview.in/contact" style="color: #667eea;">contact our support team</a>.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} JustForView. All rights reserved.<br>
      India's Premium Auction & Marketplace Platform
    </p>
  </div>
</body>
</html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
