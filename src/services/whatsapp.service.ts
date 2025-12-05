/**
 * @fileoverview Service Module
 * @module src/services/whatsapp.service
 * @description This file contains service functions for whatsapp operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * WhatsApp Service
 *
 * @status IMPLEMENTED
 * @task 1.4.2
 *
 * Client-side service for WhatsApp Business API operations:
 * - Send template messages
 * - Send media messages
 * - Track message status
 * - Manage opt-ins/opt-outs
 */

import type {
  MessageCategory,
  TemplateId,
  WhatsAppProviderId,
} from "@/config/whatsapp.config";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";

// ============================================================================
// TYPES
// ============================================================================

/**
 * SendMessageParams interface
 * 
 * @interface
 * @description Defines the structure and contract for SendMessageParams
 */
export interface SendMessageParams {
  to: string; // Phone number with country code
  /** Template Id */
  templateId: TemplateId;
  /** Variables */
  variables: Record<string, string>;
  /** Category */
  category?: MessageCategory;
  /** Provider Id */
  providerId?: WhatsAppProviderId;
}

/**
 * SendMessageResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for SendMessageResponse
 */
export interface SendMessageResponse {
  /** Message Id */
  messageId: string;
  /** Status */
  status: "sent" | "failed" | "queued";
  /** Provider */
  provider: WhatsAppProviderId;
  /** Timestamp */
  timestamp: Date;
}

/**
 * MessageStatus interface
 * 
 * @interface
 * @description Defines the structure and contract for MessageStatus
 */
export interface MessageStatus {
  /** Message Id */
  messageId: string;
  /** Status */
  status: "sent" | "delivered" | "read" | "failed";
  /** Timestamp */
  timestamp: Date;
  /** Error Code */
  errorCode?: string;
  /** Error Message */
  errorMessage?: string;
}

/**
 * SendMediaParams interface
 * 
 * @interface
 * @description Defines the structure and contract for SendMediaParams
 */
export interface SendMediaParams {
  /** To */
  to: string;
  /** Type */
  type: "image" | "video" | "document" | "audio";
  /** Media Url */
  mediaUrl: string;
  /** Caption */
  caption?: string;
  /** Filename */
  filename?: string;
}

/**
 * OptInStatus interface
 * 
 * @interface
 * @description Defines the structure and contract for OptInStatus
 */
export interface OptInStatus {
  /** Phone */
  phone: string;
  /** Opted In */
  optedIn: boolean;
  /** Opted In At */
  optedInAt?: Date;
  /** Opted Out At */
  optedOutAt?: Date;
  /** Categories */
  categories: MessageCategory[];
}

// ============================================================================
// WHATSAPP SERVICE CLASS
// ============================================================================

/**
 * WhatsAppService class
 * 
 * @class
 * @description Description of WhatsAppService class functionality
 */
class WhatsAppService {
  /**
   * Send template message
   */
  async sendTemplate(params: SendMessageParams): Promise<SendMessageResponse> {
    try {
      const response = await apiService.post<SendMessageResponse>(
        "/whatsapp/send-template",
        params
      );

      if (!response) {
        throw new Error("Failed to send WhatsApp message");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.sendTemplate",
        params,
      });
      throw error;
    }
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(params: {
    /** To */
    to: string;
    /** Order Id */
    orderId: string;
    /** Customer Name */
    customerName: string;
    /** Items */
    items: string;
    /** Total */
    total: string;
    /** Delivery Date */
    deliveryDate: string;
    /** Tracking Url */
    trackingUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "ORDER_CONFIRMATION",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Order Id */
        orderId: params.orderId,
        /** Items */
        items: params.items,
        /** Total */
        total: params.total,
        /** Delivery Date */
        deliveryDate: params.deliveryDate,
        /** Tracking Url */
        trackingUrl: params.trackingUrl,
      },
      /** Category */
      category: "UTILITY",
    });
  }

  /**
   * Send shipping update
   */
  async sendShippingUpdate(params: {
    /** To */
    to: string;
    /** Order Id */
    orderId: string;
    /** Customer Name */
    customerName: string;
    /** Status */
    status: string;
    /** Courier */
    courier: string;
    /** Tracking Id */
    trackingId: string;
    /** Location */
    location: string;
    /** Estimated Date */
    estimatedDate: string;
    /** Tracking Url */
    trackingUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "SHIPPING_UPDATE",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Order Id */
        orderId: params.orderId,
        /** Status */
        status: params.status,
        /** Courier */
        courier: params.courier,
        /** Tracking Id */
        trackingId: params.trackingId,
        /** Location */
        location: params.location,
        /** Estimated Date */
        estimatedDate: params.estimatedDate,
        /** Tracking Url */
        trackingUrl: params.trackingUrl,
      },
      /** Category */
      category: "UTILITY",
    });
  }

  /**
   * Send out for delivery notification
   */
  async sendOutForDelivery(params: {
    /** To */
    to: string;
    /** Order Id */
    orderId: string;
    /** Customer Name */
    customerName: string;
    /** Time */
    time: string;
    /** Partner */
    partner: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "OUT_FOR_DELIVERY",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Order Id */
        orderId: params.orderId,
        /** Time */
        time: params.time,
        /** Partner */
        partner: params.partner,
      },
      /** Category */
      category: "UTILITY",
    });
  }

  /**
   * Send delivery confirmation
   */
  async sendDeliveryConfirmation(params: {
    /** To */
    to: string;
    /** Order Id */
    orderId: string;
    /** Customer Name */
    customerName: string;
    /** Time */
    time: string;
    /** Receiver */
    receiver: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "DELIVERY_CONFIRMATION",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Order Id */
        orderId: params.orderId,
        /** Time */
        time: params.time,
        /** Receiver */
        receiver: params.receiver,
      },
      /** Category */
      category: "UTILITY",
    });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(params: {
    /** To */
    to: string;
    /** Order Id */
    orderId: string;
    /** Customer Name */
    customerName: string;
    /** Amount */
    amount: string;
    /** Items */
    items: string;
    /** Time */
    time: string;
    /** Payment Url */
    paymentUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "PAYMENT_REMINDER",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Order Id */
        orderId: params.orderId,
        /** Amount */
        amount: params.amount,
        /** Items */
        items: params.items,
        /** Time */
        time: params.time,
        /** Payment Url */
        paymentUrl: params.paymentUrl,
      },
      /** Category */
      category: "UTILITY",
    });
  }

  /**
   * Send abandoned cart reminder
   */
  async sendAbandonedCart(params: {
    /** To */
    to: string;
    /** Customer Name */
    customerName: string;
    /** Item Count */
    itemCount: string;
    /** Value */
    value: string;
    /** Discount */
    discount: string;
    /** Validity */
    validity: string;
    /** Cart Url */
    cartUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "ABANDONED_CART",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Item Count */
        itemCount: params.itemCount,
        /** Value */
        value: params.value,
        /** Discount */
        discount: params.discount,
        /** Validity */
        validity: params.validity,
        /** Cart Url */
        cartUrl: params.cartUrl,
      },
      /** Category */
      category: "MARKETING",
    });
  }

  /**
   * Send return request confirmation
   */
  async sendReturnRequest(params: {
    /** To */
    to: string;
    /** Order Id */
    orderId: string;
    /** Customer Name */
    customerName: string;
    /** Return Id */
    returnId: string;
    /** Reason */
    reason: string;
    /** Pickup Date */
    pickupDate: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "RETURN_REQUEST",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Order Id */
        orderId: params.orderId,
        /** Return Id */
        returnId: params.returnId,
        /** Reason */
        reason: params.reason,
        /** Pickup Date */
        pickupDate: params.pickupDate,
      },
      /** Category */
      category: "SERVICE",
    });
  }

  /**
   * Send refund processed notification
   */
  async sendRefundProcessed(params: {
    /** To */
    to: string;
    /** Order Id */
    orderId: string;
    /** Customer Name */
    customerName: string;
    /** Amount */
    amount: string;
    /** Method */
    method: string;
    /** Account */
    account: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "REFUND_PROCESSED",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Order Id */
        orderId: params.orderId,
        /** Amount */
        amount: params.amount,
        /** Method */
        method: params.method,
        /** Account */
        account: params.account,
      },
      /** Category */
      category: "UTILITY",
    });
  }

  /**
   * Send OTP
   */
  async sendOTP(params: {
    /** To */
    to: string;
    /** Otp */
    otp: string;
    /** Validity */
    validity: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "OTP",
      /** Variables */
      variables: {
        /** Otp */
        otp: params.otp,
        /** Validity */
        validity: params.validity,
      },
      /** Category */
      category: "AUTHENTICATION",
    });
  }

  /**
   * Send price drop alert
   */
  async sendPriceDrop(params: {
    /** To */
    to: string;
    /** Customer Name */
    customerName: string;
    /** Product Name */
    productName: string;
    /** Old Price */
    oldPrice: string;
    /** New Price */
    newPrice: string;
    /** Savings */
    savings: string;
    /** Percentage */
    percentage: string;
    /** Product Url */
    productUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      /** To */
      to: params.to,
      /** Template Id */
      templateId: "PRICE_DROP",
      /** Variables */
      variables: {
        /** Name */
        name: params.customerName,
        /** Product Name */
        productName: params.productName,
        /** Old Price */
        oldPrice: params.oldPrice,
        /** New Price */
        newPrice: params.newPrice,
        /** Savings */
        savings: params.savings,
        /** Percentage */
        percentage: params.percentage,
        /** Product Url */
        productUrl: params.productUrl,
      },
      /** Category */
      category: "MARKETING",
    });
  }

  /**
   * Send media message
   */
  async sendMedia(params: SendMediaParams): Promise<SendMessageResponse> {
    try {
      const response = await apiService.post<SendMessageResponse>(
        "/whatsapp/send-media",
        params
      );

      if (!response) {
        throw new Error("Failed to send media message");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.sendMedia",
        params,
      });
      throw error;
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus | null> {
    try {
      const response = await apiService.get<MessageStatus>(
        `/whatsapp/messages/${messageId}/status`
      );
      return response || null;
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.getMessageStatus",
        messageId,
      });
      return null;
    }
  }

  /**
   * Get opt-in status
   */
  async getOptInStatus(phone: string): Promise<OptInStatus | null> {
    try {
      const response = await apiService.get<OptInStatus>(
        `/whatsapp/opt-in/${encodeURIComponent(phone)}`
      );
      return response || null;
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.getOptInStatus",
        phone,
      });
      return null;
    }
  }

  /**
   * Opt-in user for WhatsApp notifications
   */
  async optIn(
    /** Phone */
    phone: string,
    /** Categories */
    categories: MessageCategory[] = ["UTILITY", "SERVICE"]
  ): Promise<boolean> {
    try {
      await apiService.post("/whatsapp/opt-in", {
        phone,
        categories,
      });
      return true;
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.optIn",
        phone,
        categories,
      });
      return false;
    }
  }

  /**
   * Opt-out user from WhatsApp notifications
   */
  async optOut(phone: string): Promise<boolean> {
    try {
      await apiService.post("/whatsapp/opt-out", { phone });
      return true;
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.optOut",
        phone,
      });
      return false;
    }
  }

  /**
   * Get message history for phone number
   */
  async getMessageHistory(
    /** Phone */
    phone: string,
    limit = 50
  ): Promise<
    Array<{
      /** Message Id */
      messageId: string;
      /** Template Id */
      templateId: string;
      /** Status */
      status: string;
      /** Sent At */
      sentAt: Date;
    }>
  > {
    try {
      const response = await apiService.get<
        Array<{
          /** Message Id */
          messageId: string;
          /** Template Id */
          templateId: string;
          /** Status */
          status: string;
          /** Sent At */
          sentAt: Date;
        }>
      >(
        `/whatsapp/messages/history/${encodeURIComponent(phone)}?limit=${limit}`
      );
      return response || [];
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.getMessageHistory",
        phone,
        limit,
      });
      return [];
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(params?: {
    /** Start Date */
    startDate?: Date;
    /** End Date */
    endDate?: Date;
    /** Template Id */
    templateId?: TemplateId;
  }): Promise<{
    /** Sent */
    sent: number;
    /** Delivered */
    delivered: number;
    /** Read */
    read: number;
    /** Failed */
    failed: number;
    /** Delivery Rate */
    deliveryRate: number;
    /** Read Rate */
    readRate: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.startDate) {
        queryParams.append("startDate", params.startDate.toISOString());
      }
      if (params?.endDate) {
        queryParams.append("endDate", params.endDate.toISOString());
      }
      if (params?.templateId) {
        queryParams.append("templateId", params.templateId);
      }

      const response = await apiService.get<{
        /** Sent */
        sent: number;
        /** Delivered */
        delivered: number;
        /** Read */
        read: number;
        /** Failed */
        failed: number;
        /** Delivery Rate */
        deliveryRate: number;
        /** Read Rate */
        readRate: number;
      }>(`/whatsapp/stats?${queryParams.toString()}`);

      return (
        response || {
          /** Sent */
          sent: 0,
          /** Delivered */
          delivered: 0,
          /** Read */
          read: 0,
          /** Failed */
          failed: 0,
          /** Delivery Rate */
          deliveryRate: 0,
          /** Read Rate */
          readRate: 0,
        }
      );
    } catch (error) {
      logError(error as Error, {
        /** Service */
        service: "WhatsAppService.getDeliveryStats",
        params,
      });
      return {
        /** Sent */
        sent: 0,
        /** Delivered */
        delivered: 0,
        /** Read */
        read: 0,
        /** Failed */
        failed: 0,
        /** Delivery Rate */
        deliveryRate: 0,
        /** Read Rate */
        readRate: 0,
      };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const whatsappService = new WhatsAppService();
