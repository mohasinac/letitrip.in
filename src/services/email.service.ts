/**
 * Email Service (Frontend)
 *
 * Service for sending emails from the UI
 * Calls the /api/email/send endpoint with template type + data
 *
 * NOTE: Templates are stored on the backend - this service only sends
 * the template type and data, NOT the HTML content.
 */

import { apiService } from "./api.service";
import { EMAIL_ROUTES } from "@/constants/api-routes";

// Template types supported by the backend
export type EmailTemplateType =
  | "verification"
  | "password_reset"
  | "welcome"
  | "order_confirmation"
  | "shipping_update"
  | "auction_won"
  | "bid_outbid";

// Data required for each template type
export interface VerificationEmailData {
  name: string;
  verificationLink: string;
}

export interface PasswordResetEmailData {
  name: string;
  resetLink: string;
}

export interface WelcomeEmailData {
  name: string;
}

export interface OrderConfirmationEmailData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
}

export interface ShippingUpdateEmailData {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  trackingUrl: string;
}

export interface AuctionWonEmailData {
  customerName: string;
  itemName: string;
  winningBid: number;
  auctionEndTime: string;
  itemUrl: string;
}

export interface BidOutbidEmailData {
  customerName: string;
  itemName: string;
  currentBid: number;
  yourBid: number;
  itemUrl: string;
}

export type EmailTemplateData =
  | VerificationEmailData
  | PasswordResetEmailData
  | WelcomeEmailData
  | OrderConfirmationEmailData
  | ShippingUpdateEmailData
  | AuctionWonEmailData
  | BidOutbidEmailData;

interface SendTemplateEmailRequest {
  to: string | string[];
  template: EmailTemplateType;
  data: EmailTemplateData;
  replyTo?: string;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

class EmailServiceFrontend {
  /**
   * Send an email using a template
   * The backend will generate the HTML/text from the template + data
   */
  async sendTemplate(
    to: string | string[],
    template: EmailTemplateType,
    data: EmailTemplateData,
    replyTo?: string,
  ): Promise<SendEmailResponse> {
    try {
      const response = await apiService.post<SendEmailResponse>(
        EMAIL_ROUTES.SEND,
        { to, template, data, replyTo } as SendTemplateEmailRequest,
      );
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send email";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    to: string,
    data: VerificationEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "verification", data);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    data: PasswordResetEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "password_reset", data);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    data: WelcomeEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "welcome", data);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    to: string,
    data: OrderConfirmationEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "order_confirmation", data);
  }

  /**
   * Send shipping update email
   */
  async sendShippingUpdateEmail(
    to: string,
    data: ShippingUpdateEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "shipping_update", data);
  }

  /**
   * Send auction won email
   */
  async sendAuctionWonEmail(
    to: string,
    data: AuctionWonEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "auction_won", data);
  }

  /**
   * Send bid outbid email
   */
  async sendBidOutbidEmail(
    to: string,
    data: BidOutbidEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "bid_outbid", data);
  }

  /**
   * Send test email (admin only)
   */
  async sendTest(to: string): Promise<SendEmailResponse> {
    try {
      const response = await apiService.post<SendEmailResponse>(
        EMAIL_ROUTES.TEST,
        { to },
      );
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send test email";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

// Export singleton instance
export const emailServiceFrontend = new EmailServiceFrontend();
