/**
 * @fileoverview Service Module
 * @module src/services/payment-gateway.service
 * @description This file contains service functions for payment-gateway operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Payment Gateway Service
 *
 * Gateway abstraction layer that provides a unified interface for all payment gateways.
 * This service handles gateway selection, configuration, and routing of payment operations.
 *
 * Usage:
 * ```ts
 * import { paymentGatewayService } from '@/services/payment-gateway.service';
 *
 * // Create order (auto-selects best gateway)
 * const order = await paymentGatewayService.createOrder({
 *   amount: 1000,
 *   currency: 'INR',
 *   country: 'IN'
 * });
 *
 * // Verify payment
 * const verified = await paymentGatewayService.verifyPayment('razorpay', { ... });
 * ```
 */

import {
  calculateGatewayFee,
  getBestGateway,
  getGatewayById,
  type CountryCode,
  type CurrencyCode,
  type PaymentGatewayConfig,
} from "@/config/payment-gateways.config";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";

// ============================================================================
// TYPES
// ============================================================================

/**
 * CreateOrderRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateOrderRequest
 */
export interface CreateOrderRequest {
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Country */
  country: CountryCode;
  /** Order Id */
  orderId?: string;
  /** Customer Id */
  customerId?: string;
  /** Email */
  email?: string;
  /** Phone */
  phone?: string;
  /** Notes */
  notes?: Record<string, string>;
  /** GatewayId */
  gatewayId?: string; // Optional: specify gateway, otherwise auto-select
}

/**
 * CreateOrderResult interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateOrderResult
 */
export interface CreateOrderResult {
  /** Gateway */
  gateway: {
    /** Id */
    id: string;
    /** Name */
    name: string;
  };
  /** Order */
  order: {
    /** Id */
    id: string;
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Status */
    status: string;
    /** Created At */
    createdAt: string;
  };
  /** Fee */
  fee: number;
  /** Total Amount */
  totalAmount: number;
}

/**
 * VerifyPaymentRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for VerifyPaymentRequest
 */
export interface VerifyPaymentRequest {
  /** Order Id */
  orderId: string;
  /** Payment Id */
  paymentId: string;
  /** Signature */
  signature: string;
  /** Additional Data */
  additionalData?: Record<string, any>;
}

/**
 * VerifyPaymentResult interface
 * 
 * @interface
 * @description Defines the structure and contract for VerifyPaymentResult
 */
export interface VerifyPaymentResult {
  /** Success */
  success: boolean;
  /** Gateway */
  gateway: string;
  /** Order Id */
  orderId: string;
  /** Payment Id */
  paymentId: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Status */
  status: string;
  /** Verified At */
  verifiedAt: string;
}

/**
 * RefundPaymentRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for RefundPaymentRequest
 */
export interface RefundPaymentRequest {
  /** Payment Id */
  paymentId: string;
  /** Amount */
  amount?: number; // Optional for partial refunds
  /** Reason */
  reason?: string;
  /** Notes */
  notes?: Record<string, string>;
}

/**
 * RefundPaymentResult interface
 * 
 * @interface
 * @description Defines the structure and contract for RefundPaymentResult
 */
export interface RefundPaymentResult {
  /** Gateway */
  gateway: string;
  /** Refund Id */
  refundId: string;
  /** Payment Id */
  paymentId: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Status */
  status: string;
  /** Created At */
  createdAt: string;
}

/**
 * GatewayStatus interface
 * 
 * @interface
 * @description Defines the structure and contract for GatewayStatus
 */
export interface GatewayStatus {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Enabled */
  enabled: boolean;
  /** Configured */
  configured: boolean;
  /** Healthy */
  healthy: boolean;
  /** Last Check */
  lastCheck?: string;
  /** Error */
  error?: string;
}

// ============================================================================
// PAYMENT GATEWAY SERVICE
// ============================================================================

/**
 * PaymentGatewayService class
 * 
 * @class
 * @description Description of PaymentGatewayService class functionality
 */
class PaymentGatewayService {
  private readonly baseUrl = "/api/payments";

  /**
   * Create order with auto-gateway selection or specific gateway
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
    try {
      // If gateway specified, use it
      if (request.gatewayId) {
        const gateway = getGatewayById(request.gatewayId);
        if (!gateway) {
          throw new Error(`Gateway ${request.gatewayId} not found`);
        }
        if (!gateway.enabled) {
          throw new Error(`Gateway ${request.gatewayId} is not enabled`);
        }

        return await this.createOrderWithGateway(request.gatewayId, request);
      }

      // Auto-select best gateway
      const gateway = getBestGateway({
        /** Currency */
        currency: request.currency,
        /** Country */
        country: request.country,
        /** Amount */
        amount: request.amount,
      });

      if (!gateway) {
        throw new Error(
          `No suitable gateway found for ${request.currency} in ${request.country}`
        );
      }

      return await this.createOrderWithGateway(gateway.id, request);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.createOrder",
        request,
      });
      throw error;
    }
  }

  /**
   * Create order with specific gateway
   */
  private async createOrderWithGateway(
    /** Gateway Id */
    gatewayId: string,
    /** Request */
    request: CreateOrderRequest
  ): Promise<CreateOrderResult> {
    try {
      const response = await apiService.post<CreateOrderResult>(
        `${this.baseUrl}/${gatewayId}/orders`,
        {
          /** Amount */
          amount: request.amount,
          /** Currency */
          currency: request.currency,
          /** Order Id */
          orderId: request.orderId,
          /** Customer Id */
          customerId: request.customerId,
          /** Email */
          email: request.email,
          /** Phone */
          phone: request.phone,
          /** Notes */
          notes: request.notes,
        }
      );

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.createOrderWithGateway",
        gatewayId,
        request,
      });
      throw error;
    }
  }

  /**
   * Verify payment from any gateway
   */
  async verifyPayment(
    /** Gateway Id */
    gatewayId: string,
    /** Request */
    request: VerifyPaymentRequest
  ): Promise<VerifyPaymentResult> {
    try {
      const response = await apiService.post<VerifyPaymentResult>(
        `${this.baseUrl}/${gatewayId}/verify`,
        request
      );

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.verifyPayment",
        gatewayId,
        /** Request */
        request: {
          /** Order Id */
          orderId: request.orderId,
          /** Payment Id */
          paymentId: request.paymentId,
        },
      });
      throw error;
    }
  }

  /**
   * Refund payment from any gateway
   */
  async refundPayment(
    /** Gateway Id */
    gatewayId: string,
    /** Request */
    request: RefundPaymentRequest
  ): Promise<RefundPaymentResult> {
    try {
      const response = await apiService.post<RefundPaymentResult>(
        `${this.baseUrl}/${gatewayId}/refund`,
        request
      );

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.refundPayment",
        gatewayId,
        request,
      });
      throw error;
    }
  }

  /**
   * Capture payment (for authorized payments)
   */
  async capturePayment(
    /** Gateway Id */
    gatewayId: string,
    /** Params */
    params: {
      /** Payment Id */
      paymentId: string;
      /** Amount */
      amount: number;
      /** Currency */
      currency: CurrencyCode;
    }
  ): Promise<{
    /** Gateway */
    gateway: string;
    /** Payment Id */
    paymentId: string;
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Status */
    status: string;
    /** Captured At */
    capturedAt: string;
  }> {
    try {
      const response = await apiService.post<{
        /** Gateway */
        gateway: string;
        /** Payment Id */
        paymentId: string;
        /** Amount */
        amount: number;
        /** Currency */
        currency: CurrencyCode;
        /** Status */
        status: string;
        /** Captured At */
        capturedAt: string;
      }>(`${this.baseUrl}/${gatewayId}/capture`, params);

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.capturePayment",
        gatewayId,
        params,
      });
      throw error;
    }
  }

  /**
   * Get payment details from any gateway
   */
  async getPaymentDetails(
    /** Gateway Id */
    gatewayId: string,
    /** Payment Id */
    paymentId: string
  ): Promise<{
    /** Gateway */
    gateway: string;
    /** Id */
    id: string;
    /** Order Id */
    orderId?: string;
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Status */
    status: string;
    /** Method */
    method?: string;
    /** Email */
    email?: string;
    /** Contact */
    contact?: string;
    /** Created At */
    createdAt: string;
    /** Captured At */
    capturedAt?: string;
    /** Refunded */
    refunded?: boolean;
    /** Refund Status */
    refundStatus?: string;
  }> {
    try {
      const response = await apiService.get<{
        /** Gateway */
        gateway: string;
        /** Id */
        id: string;
        /** Order Id */
        orderId?: string;
        /** Amount */
        amount: number;
        /** Currency */
        currency: CurrencyCode;
        /** Status */
        status: string;
        /** Method */
        method?: string;
        /** Email */
        email?: string;
        /** Contact */
        contact?: string;
        /** Created At */
        createdAt: string;
        /** Captured At */
        capturedAt?: string;
        /** Refunded */
        refunded?: boolean;
        /** Refund Status */
        refundStatus?: string;
      }>(`${this.baseUrl}/${gatewayId}/payments/${paymentId}`);

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.getPaymentDetails",
        gatewayId,
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Get available gateways for a transaction
   */
  async getAvailableGateways(params: {
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Country */
    country: CountryCode;
  }): Promise<
    Array<{
      /** Id */
      id: string;
      /** Name */
      name: string;
      /** Type */
      type: string;
      /** Fee */
      fee: number;
      /** Total Amount */
      totalAmount: number;
      /** Priority */
      priority: number;
      /** Capabilities */
      capabilities: string[];
    }>
  > {
    try {
      const response = await apiService.post<
        Array<{
          /** Id */
          id: string;
          /** Name */
          name: string;
          /** Type */
          type: string;
          /** Fee */
          fee: number;
          /** Total Amount */
          totalAmount: number;
          /** Priority */
          priority: number;
          /** Capabilities */
          capabilities: string[];
        }>
      >(`${this.baseUrl}/available-gateways`, params);

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.getAvailableGateways",
        params,
      });
      throw error;
    }
  }

  /**
   * Get gateway status (health check)
   */
  async getGatewayStatus(gatewayId: string): Promise<GatewayStatus> {
    try {
      const response = await apiService.get<GatewayStatus>(
        `${this.baseUrl}/${gatewayId}/status`
      );

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.getGatewayStatus",
        gatewayId,
      });
      throw error;
    }
  }

  /**
   * Test gateway connection
   */
  async testGatewayConnection(gatewayId: string): Promise<{
    /** Success */
    success: boolean;
    /** Gateway */
    gateway: string;
    /** Message */
    message: string;
    /** Tested At */
    testedAt: string;
  }> {
    try {
      const response = await apiService.post<{
        /** Success */
        success: boolean;
        /** Gateway */
        gateway: string;
        /** Message */
        message: string;
        /** Tested At */
        testedAt: string;
      }>(`${this.baseUrl}/${gatewayId}/test`, {});

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.testGatewayConnection",
        gatewayId,
      });
      throw error;
    }
  }

  /**
   * Calculate fee for a transaction
   */
  calculateFee(
    /** Gateway Id */
    gatewayId: string,
    /** Amount */
    amount: number,
    /** Is International */
    isInternational: boolean = false
  ): number {
    return calculateGatewayFee(gatewayId, amount, isInternational);
  }

  /**
   * Get gateway configuration (client-safe)
   */
  getGatewayConfig(gatewayId: string): PaymentGatewayConfig | undefined {
    return getGatewayById(gatewayId);
  }

  /**
   * Get recommended gateway for transaction
   */
  getRecommendedGateway(params: {
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Country */
    country: CountryCode;
    /** Required Capabilities */
    requiredCapabilities?: string[];
  }): PaymentGatewayConfig | undefined {
    return getBestGateway({
      /** Currency */
      currency: params.currency,
      /** Country */
      country: params.country,
      /** Amount */
      amount: params.amount,
      /** Required Capabilities */
      requiredCapabilities: params.requiredCapabilities as Array<
        keyof PaymentGatewayConfig["capabilities"]
      >,
    });
  }

  /**
   * Validate gateway is configured and enabled
   */
  async validateGateway(gatewayId: string): Promise<{
    /** Is Valid */
    isValid: boolean;
    /** Error */
    error?: string;
  }> {
    try {
      const gateway = getGatewayById(gatewayId);

      if (!gateway) {
        return {
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Gateway ${gatewayId} not found`,
        };
      }

      if (!gateway.enabled) {
        return {
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Gateway ${gatewayId} is not enabled`,
        };
      }

      // Check configuration status via API
      const status = await this.getGatewayStatus(gatewayId);

      if (!status.configured) {
        return {
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Gateway ${gatewayId} is not configured`,
        };
      }

      if (!status.healthy) {
        return {
          /** Is Valid */
          isValid: false,
          /** Error */
          error: status.error || `Gateway ${gatewayId} is not healthy`,
        };
      }

      return { isValid: true };
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.validateGateway",
        gatewayId,
      });
      return {
        /** Is Valid */
        isValid: false,
        /** Error */
        error: "Failed to validate gateway",
      };
    }
  }

  /**
   * Get all configured gateways status
   */
  async getAllGatewaysStatus(): Promise<GatewayStatus[]> {
    try {
      const response = await apiService.get<GatewayStatus[]>(
        `${this.baseUrl}/status`
      );

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PaymentGatewayService.getAllGatewaysStatus",
      });
      throw error;
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const paymentGatewayService = new PaymentGatewayService();
