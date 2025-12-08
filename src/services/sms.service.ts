import { logError } from "@/lib/firebase-error-logger";

/**
 * SMS Service - Send SMS via MSG91 or Twilio
 *
 * Features:
 * - OTP messages
 * - Order notifications
 * - Promotional messages
 * - Template-based messaging
 */

export interface SendSMSRequest {
  to: string; // Phone number with country code (e.g., +919876543210)
  message: string;
  template?: string;
  variables?: Record<string, string>;
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

class SMSService {
  private readonly provider: "msg91" | "twilio" | "mock";
  private readonly authKey: string;
  private readonly senderId: string;
  private readonly baseUrl: string;

  constructor() {
    // Initialize based on environment variables
    this.provider = (process.env.SMS_PROVIDER as "msg91" | "twilio") || "mock";
    this.authKey = process.env.SMS_AUTH_KEY || "";
    this.senderId = process.env.SMS_SENDER_ID || "JUSTVIEW";
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    switch (this.provider) {
      case "msg91":
        return "https://api.msg91.com/api/v5";
      case "twilio":
        return "https://api.twilio.com/2010-04-01";
      default:
        return "";
    }
  }

  /**
   * Send SMS via MSG91
   */
  private async sendViaMSG91(request: SendSMSRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/flow/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: this.authKey,
        },
        body: JSON.stringify({
          sender: this.senderId,
          short_url: "0",
          mobiles: request.to,
          message: request.message,
          route: "4", // Transactional route
          country: "91", // India
        }),
      });

      if (!response.ok) {
        throw new Error(`MSG91 API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.type !== "success") {
        throw new Error(`MSG91 failed: ${result.message}`);
      }

      console.log(`[SMS] Sent via MSG91 to ${request.to}`);
    } catch (error) {
      logError(error as Error, {
        component: "SMSService.sendViaMSG91",
        metadata: { to: request.to },
      });
      throw error;
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(request: SendSMSRequest): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Twilio credentials not configured");
      }

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const response = await fetch(
        `${this.baseUrl}/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: request.to,
            From: fromNumber,
            Body: request.message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Twilio API error: ${response.statusText}`);
      }

      console.log(`[SMS] Sent via Twilio to ${request.to}`);
    } catch (error) {
      logError(error as Error, {
        component: "SMSService.sendViaTwilio",
        metadata: { to: request.to },
      });
      throw error;
    }
  }

  /**
   * Mock SMS for development
   */
  private async sendViaMock(request: SendSMSRequest): Promise<void> {
    console.log(`[SMS Mock] To: ${request.to}`);
    console.log(`[SMS Mock] Message: ${request.message}`);
  }

  /**
   * Send SMS with automatic provider selection
   */
  async send(
    request: SendSMSRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate message content
      if (!request.message || request.message.trim().length === 0) {
        throw new Error("Message content is required");
      }

      // Validate phone number format (basic validation)
      if (!request.to.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error(
          "Invalid phone number format. Must include country code (e.g., +919876543210)"
        );
      }

      // Send via configured provider
      switch (this.provider) {
        case "msg91":
          await this.sendViaMSG91(request);
          break;
        case "twilio":
          await this.sendViaTwilio(request);
          break;
        default:
          await this.sendViaMock(request);
      }

      return {
        success: true,
        message: "SMS sent successfully",
      };
    } catch (error) {
      logError(error as Error, {
        component: "SMSService.send",
        metadata: request,
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    const message = `Your JustForView verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;

    return await this.send({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmation(
    phoneNumber: string,
    orderId: string,
    amount: number
  ): Promise<{ success: boolean; message: string }> {
    const message = `Your order #${orderId} has been confirmed! Total: ₹${amount}. Track at justforview.in/orders/${orderId}`;

    return await this.send({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send order shipped SMS
   */
  async sendOrderShipped(
    phoneNumber: string,
    orderId: string,
    trackingId?: string
  ): Promise<{ success: boolean; message: string }> {
    const trackingInfo = trackingId ? ` Tracking: ${trackingId}` : "";
    const message = `Your order #${orderId} has been shipped!${trackingInfo} Track at justforview.in/orders/${orderId}`;

    return await this.send({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send order delivered SMS
   */
  async sendOrderDelivered(
    phoneNumber: string,
    orderId: string
  ): Promise<{ success: boolean; message: string }> {
    const message = `Your order #${orderId} has been delivered! Thank you for shopping with JustForView.`;

    return await this.send({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send promotional SMS (requires DND approval)
   */
  async sendPromotion(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; message: string }> {
    // Add unsubscribe option as per TRAI regulations
    const fullMessage = `${message}\n\nTo opt-out, reply STOP to ${this.senderId}`;

    return await this.send({
      to: phoneNumber,
      message: fullMessage,
    });
  }
}

export const smsService = new SMSService();
