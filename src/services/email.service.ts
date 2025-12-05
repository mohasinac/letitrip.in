/**
 * @fileoverview Service Module
 * @module src/services/email.service
 * @description This file contains service functions for email operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * EmailTemplateType type
 * 
 * @typedef {Object} EmailTemplateType
 * @description Type definition for EmailTemplateType
 */
export type EmailTemplateType =
  | "verification"
  | "password_reset"
  | "welcome"
  | "order_confirmation"
  | "shipping_update"
  | "auction_won"
  | "bid_outbid";

// Data required for each template type
/**
 * VerificationEmailData interface
 * 
 * @interface
 * @description Defines the structure and contract for VerificationEmailData
 */
export interface VerificationEmailData {
  /** Name */
  name: string;
  /** Verification Link */
  verificationLink: string;
}

/**
 * PasswordResetEmailData interface
 * 
 * @interface
 * @description Defines the structure and contract for PasswordResetEmailData
 */
export interface PasswordResetEmailData {
  /** Name */
  name: string;
  /** Reset Link */
  resetLink: string;
}

/**
 * WelcomeEmailData interface
 * 
 * @interface
 * @description Defines the structure and contract for WelcomeEmailData
 */
export interface WelcomeEmailData {
  /** Name */
  name: string;
}

/**
 * OrderConfirmationEmailData interface
 * 
 * @interface
 * @description Defines the structure and contract for OrderConfirmationEmailData
 */
export interface OrderConfirmationEmailData {
  /** Customer Name */
  customerName: string;
  /** Order Number */
  orderNumber: string;
  /** Order Date */
  orderDate: string;
  /** Items */
  items: Array<{ name: string; quantity: number; price: number }>;
  /** Subtotal */
  subtotal: number;
  /** Shipping */
  shipping: number;
  /** Total */
  total: number;
  /** Shipping Address */
  shippingAddress: string;
}

/**
 * ShippingUpdateEmailData interface
 * 
 * @interface
 * @description Defines the structure and contract for ShippingUpdateEmailData
 */
export interface ShippingUpdateEmailData {
  /** Customer Name */
  customerName: string;
  /** Order Number */
  orderNumber: string;
  /** Tracking Number */
  trackingNumber: string;
  /** Carrier */
  carrier: string;
  /** Estimated Delivery */
  estimatedDelivery: string;
  /** Tracking Url */
  trackingUrl: string;
}

/**
 * AuctionWonEmailData interface
 * 
 * @interface
 * @description Defines the structure and contract for AuctionWonEmailData
 */
export interface AuctionWonEmailData {
  /** Customer Name */
  customerName: string;
  /** Item Name */
  itemName: string;
  /** Winning Bid */
  winningBid: number;
  /** Auction End Time */
  auctionEndTime: string;
  /** Item Url */
  itemUrl: string;
}

/**
 * BidOutbidEmailData interface
 * 
 * @interface
 * @description Defines the structure and contract for BidOutbidEmailData
 */
export interface BidOutbidEmailData {
  /** Customer Name */
  customerName: string;
  /** Item Name */
  itemName: string;
  /** Current Bid */
  currentBid: number;
  /** Your Bid */
  yourBid: number;
  /** Item Url */
  itemUrl: string;
}

/**
 * EmailTemplateData type
 * 
 * @typedef {Object} EmailTemplateData
 * @description Type definition for EmailTemplateData
 */
export type EmailTemplateData =
  | VerificationEmailData
  | PasswordResetEmailData
  | WelcomeEmailData
  | OrderConfirmationEmailData
  | ShippingUpdateEmailData
  | AuctionWonEmailData
  | BidOutbidEmailData;

/**
 * SendTemplateEmailRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for SendTemplateEmailRequest
 */
interface SendTemplateEmailRequest {
  /** To */
  to: string | string[];
  /** Template */
  template: EmailTemplateType;
  /** Data */
  data: EmailTemplateData;
  /** Reply To */
  replyTo?: string;
}

/**
 * SendEmailResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for SendEmailResponse
 */
interface SendEmailResponse {
  /** Success */
  success: boolean;
  /** Message Id */
  messageId?: string;
  /** Message */
  message?: string;
  /** Error */
  error?: string;
}

/**
 * EmailServiceFrontend class
 * 
 * @class
 * @description Description of EmailServiceFrontend class functionality
 */
class EmailServiceFrontend {
  /**
   * Send an email using a template
   * The backend will generate the HTML/text from the template + data
   */
  async sendTemplate(
    /** To */
    to: string | string[],
    /** Template */
    template: EmailTemplateType,
    /** Data */
    data: EmailTemplateData,
    /** Reply To */
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
        /** Success */
        success: false,
        /** Error */
        error: errorMessage,
      };
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    /** To */
    to: string,
    /** Data */
    data: VerificationEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "verification", data);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    /** To */
    to: string,
    /** Data */
    data: PasswordResetEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "password_reset", data);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    /** To */
    to: string,
    /** Data */
    data: WelcomeEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "welcome", data);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    /** To */
    to: string,
    /** Data */
    data: OrderConfirmationEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "order_confirmation", data);
  }

  /**
   * Send shipping update email
   */
  async sendShippingUpdateEmail(
    /** To */
    to: string,
    /** Data */
    data: ShippingUpdateEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "shipping_update", data);
  }

  /**
   * Send auction won email
   */
  async sendAuctionWonEmail(
    /** To */
    to: string,
    /** Data */
    data: AuctionWonEmailData,
  ): Promise<SendEmailResponse> {
    return this.sendTemplate(to, "auction_won", data);
  }

  /**
   * Send bid outbid email
   */
  async sendBidOutbidEmail(
    /** To */
    to: string,
    /** Data */
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
        /** Success */
        success: false,
        /** Error */
        error: errorMessage,
      };
    }
  }
}

// Export singleton instance
export const emailServiceFrontend = new EmailServiceFrontend();
