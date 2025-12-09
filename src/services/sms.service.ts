import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "./api.service";

/**
 * SMS Service - Send SMS via Backend API
 *
 * BUG FIX: This is a FRONTEND service - should not access process.env directly
 * All SMS sending goes through the backend API endpoint
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

export interface SMSResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * BUG FIX: Removed direct SMS provider integration from frontend
 * Frontend should only call backend API endpoints
 */
class SMSService {
  /**
   * BUG FIX: Send SMS via backend API endpoint
   * All provider logic handled on server-side
   */
  async send(request: SendSMSRequest): Promise<SMSResponse> {
    try {
      // Validate message content
      if (!request.message || request.message.trim().length === 0) {
        return {
          success: false,
          message: "Message content is required",
        };
      }

      // Validate phone number format (basic validation)
      if (!request.to.match(/^\+[1-9]\d{1,14}$/)) {
        return {
          success: false,
          message:
            "Invalid phone number format. Must include country code (e.g., +919876543210)",
        };
      }

      // Call backend API endpoint
      const response = await apiService.post<SMSResponse>("/sms/send", {
        to: request.to,
        message: request.message,
        template: request.template,
        variables: request.variables,
      });

      return response;
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
    // Note: Unsubscribe logic handled by backend
    return await this.send({
      to: phoneNumber,
      message,
    });
  }
}

export const smsService = new SMSService();
