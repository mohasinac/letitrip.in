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

export interface SendMessageParams {
  to: string; // Phone number with country code
  templateId: TemplateId;
  variables: Record<string, string>;
  category?: MessageCategory;
  providerId?: WhatsAppProviderId;
}

export interface SendMessageResponse {
  messageId: string;
  status: "sent" | "failed" | "queued";
  provider: WhatsAppProviderId;
  timestamp: Date;
}

export interface MessageStatus {
  messageId: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: Date;
  errorCode?: string;
  errorMessage?: string;
}

export interface SendMediaParams {
  to: string;
  type: "image" | "video" | "document" | "audio";
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

export interface OptInStatus {
  phone: string;
  optedIn: boolean;
  optedInAt?: Date;
  optedOutAt?: Date;
  categories: MessageCategory[];
}

// ============================================================================
// WHATSAPP SERVICE CLASS
// ============================================================================

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
    to: string;
    orderId: string;
    customerName: string;
    items: string;
    total: string;
    deliveryDate: string;
    trackingUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "ORDER_CONFIRMATION",
      variables: {
        name: params.customerName,
        orderId: params.orderId,
        items: params.items,
        total: params.total,
        deliveryDate: params.deliveryDate,
        trackingUrl: params.trackingUrl,
      },
      category: "UTILITY",
    });
  }

  /**
   * Send shipping update
   */
  async sendShippingUpdate(params: {
    to: string;
    orderId: string;
    customerName: string;
    status: string;
    courier: string;
    trackingId: string;
    location: string;
    estimatedDate: string;
    trackingUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "SHIPPING_UPDATE",
      variables: {
        name: params.customerName,
        orderId: params.orderId,
        status: params.status,
        courier: params.courier,
        trackingId: params.trackingId,
        location: params.location,
        estimatedDate: params.estimatedDate,
        trackingUrl: params.trackingUrl,
      },
      category: "UTILITY",
    });
  }

  /**
   * Send out for delivery notification
   */
  async sendOutForDelivery(params: {
    to: string;
    orderId: string;
    customerName: string;
    time: string;
    partner: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "OUT_FOR_DELIVERY",
      variables: {
        name: params.customerName,
        orderId: params.orderId,
        time: params.time,
        partner: params.partner,
      },
      category: "UTILITY",
    });
  }

  /**
   * Send delivery confirmation
   */
  async sendDeliveryConfirmation(params: {
    to: string;
    orderId: string;
    customerName: string;
    time: string;
    receiver: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "DELIVERY_CONFIRMATION",
      variables: {
        name: params.customerName,
        orderId: params.orderId,
        time: params.time,
        receiver: params.receiver,
      },
      category: "UTILITY",
    });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(params: {
    to: string;
    orderId: string;
    customerName: string;
    amount: string;
    items: string;
    time: string;
    paymentUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "PAYMENT_REMINDER",
      variables: {
        name: params.customerName,
        orderId: params.orderId,
        amount: params.amount,
        items: params.items,
        time: params.time,
        paymentUrl: params.paymentUrl,
      },
      category: "UTILITY",
    });
  }

  /**
   * Send abandoned cart reminder
   */
  async sendAbandonedCart(params: {
    to: string;
    customerName: string;
    itemCount: string;
    value: string;
    discount: string;
    validity: string;
    cartUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "ABANDONED_CART",
      variables: {
        name: params.customerName,
        itemCount: params.itemCount,
        value: params.value,
        discount: params.discount,
        validity: params.validity,
        cartUrl: params.cartUrl,
      },
      category: "MARKETING",
    });
  }

  /**
   * Send return request confirmation
   */
  async sendReturnRequest(params: {
    to: string;
    orderId: string;
    customerName: string;
    returnId: string;
    reason: string;
    pickupDate: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "RETURN_REQUEST",
      variables: {
        name: params.customerName,
        orderId: params.orderId,
        returnId: params.returnId,
        reason: params.reason,
        pickupDate: params.pickupDate,
      },
      category: "SERVICE",
    });
  }

  /**
   * Send refund processed notification
   */
  async sendRefundProcessed(params: {
    to: string;
    orderId: string;
    customerName: string;
    amount: string;
    method: string;
    account: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "REFUND_PROCESSED",
      variables: {
        name: params.customerName,
        orderId: params.orderId,
        amount: params.amount,
        method: params.method,
        account: params.account,
      },
      category: "UTILITY",
    });
  }

  /**
   * Send OTP
   */
  async sendOTP(params: {
    to: string;
    otp: string;
    validity: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "OTP",
      variables: {
        otp: params.otp,
        validity: params.validity,
      },
      category: "AUTHENTICATION",
    });
  }

  /**
   * Send price drop alert
   */
  async sendPriceDrop(params: {
    to: string;
    customerName: string;
    productName: string;
    oldPrice: string;
    newPrice: string;
    savings: string;
    percentage: string;
    productUrl: string;
  }): Promise<SendMessageResponse> {
    return this.sendTemplate({
      to: params.to,
      templateId: "PRICE_DROP",
      variables: {
        name: params.customerName,
        productName: params.productName,
        oldPrice: params.oldPrice,
        newPrice: params.newPrice,
        savings: params.savings,
        percentage: params.percentage,
        productUrl: params.productUrl,
      },
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
    phone: string,
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
    phone: string,
    limit = 50
  ): Promise<
    Array<{
      messageId: string;
      templateId: string;
      status: string;
      sentAt: Date;
    }>
  > {
    try {
      const response = await apiService.get<
        Array<{
          messageId: string;
          templateId: string;
          status: string;
          sentAt: Date;
        }>
      >(
        `/whatsapp/messages/history/${encodeURIComponent(phone)}?limit=${limit}`
      );
      return response || [];
    } catch (error) {
      logError(error as Error, {
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
    startDate?: Date;
    endDate?: Date;
    templateId?: TemplateId;
  }): Promise<{
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    deliveryRate: number;
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
        sent: number;
        delivered: number;
        read: number;
        failed: number;
        deliveryRate: number;
        readRate: number;
      }>(`/whatsapp/stats?${queryParams.toString()}`);

      return (
        response || {
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
          deliveryRate: 0,
          readRate: 0,
        }
      );
    } catch (error) {
      logError(error as Error, {
        service: "WhatsAppService.getDeliveryStats",
        params,
      });
      return {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
      };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const whatsappService = new WhatsAppService();
