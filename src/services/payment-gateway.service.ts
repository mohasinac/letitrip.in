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

export interface CreateOrderRequest {
  amount: number;
  currency: CurrencyCode;
  country: CountryCode;
  orderId?: string;
  customerId?: string;
  email?: string;
  phone?: string;
  notes?: Record<string, string>;
  gatewayId?: string; // Optional: specify gateway, otherwise auto-select
}

export interface CreateOrderResult {
  gateway: {
    id: string;
    name: string;
  };
  order: {
    id: string;
    amount: number;
    currency: CurrencyCode;
    status: string;
    createdAt: string;
  };
  fee: number;
  totalAmount: number;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
  additionalData?: Record<string, any>;
}

export interface VerifyPaymentResult {
  success: boolean;
  gateway: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
  verifiedAt: string;
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount?: number; // Optional for partial refunds
  reason?: string;
  notes?: Record<string, string>;
}

export interface RefundPaymentResult {
  gateway: string;
  refundId: string;
  paymentId: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
  createdAt: string;
}

export interface GatewayStatus {
  id: string;
  name: string;
  enabled: boolean;
  configured: boolean;
  healthy: boolean;
  lastCheck?: string;
  error?: string;
}

// ============================================================================
// PAYMENT GATEWAY SERVICE
// ============================================================================

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
        currency: request.currency,
        country: request.country,
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
    gatewayId: string,
    request: CreateOrderRequest
  ): Promise<CreateOrderResult> {
    try {
      const response = await apiService.post<CreateOrderResult>(
        `${this.baseUrl}/${gatewayId}/orders`,
        {
          amount: request.amount,
          currency: request.currency,
          orderId: request.orderId,
          customerId: request.customerId,
          email: request.email,
          phone: request.phone,
          notes: request.notes,
        }
      );

      return response;
    } catch (error) {
      logError(error as Error, {
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
    gatewayId: string,
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
        component: "PaymentGatewayService.verifyPayment",
        gatewayId,
        request: {
          orderId: request.orderId,
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
    gatewayId: string,
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
    gatewayId: string,
    params: {
      paymentId: string;
      amount: number;
      currency: CurrencyCode;
    }
  ): Promise<{
    gateway: string;
    paymentId: string;
    amount: number;
    currency: CurrencyCode;
    status: string;
    capturedAt: string;
  }> {
    try {
      const response = await apiService.post<{
        gateway: string;
        paymentId: string;
        amount: number;
        currency: CurrencyCode;
        status: string;
        capturedAt: string;
      }>(`${this.baseUrl}/${gatewayId}/capture`, params);

      return response;
    } catch (error) {
      logError(error as Error, {
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
    gatewayId: string,
    paymentId: string
  ): Promise<{
    gateway: string;
    id: string;
    orderId?: string;
    amount: number;
    currency: CurrencyCode;
    status: string;
    method?: string;
    email?: string;
    contact?: string;
    createdAt: string;
    capturedAt?: string;
    refunded?: boolean;
    refundStatus?: string;
  }> {
    try {
      const response = await apiService.get<{
        gateway: string;
        id: string;
        orderId?: string;
        amount: number;
        currency: CurrencyCode;
        status: string;
        method?: string;
        email?: string;
        contact?: string;
        createdAt: string;
        capturedAt?: string;
        refunded?: boolean;
        refundStatus?: string;
      }>(`${this.baseUrl}/${gatewayId}/payments/${paymentId}`);

      return response;
    } catch (error) {
      logError(error as Error, {
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
    amount: number;
    currency: CurrencyCode;
    country: CountryCode;
  }): Promise<
    Array<{
      id: string;
      name: string;
      type: string;
      fee: number;
      totalAmount: number;
      priority: number;
      capabilities: string[];
    }>
  > {
    try {
      const response = await apiService.post<
        Array<{
          id: string;
          name: string;
          type: string;
          fee: number;
          totalAmount: number;
          priority: number;
          capabilities: string[];
        }>
      >(`${this.baseUrl}/available-gateways`, params);

      return response;
    } catch (error) {
      logError(error as Error, {
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
    success: boolean;
    gateway: string;
    message: string;
    testedAt: string;
  }> {
    try {
      const response = await apiService.post<{
        success: boolean;
        gateway: string;
        message: string;
        testedAt: string;
      }>(`${this.baseUrl}/${gatewayId}/test`, {});

      return response;
    } catch (error) {
      logError(error as Error, {
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
    gatewayId: string,
    amount: number,
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
    amount: number;
    currency: CurrencyCode;
    country: CountryCode;
    requiredCapabilities?: string[];
  }): PaymentGatewayConfig | undefined {
    return getBestGateway({
      currency: params.currency,
      country: params.country,
      amount: params.amount,
      requiredCapabilities: params.requiredCapabilities as Array<
        keyof PaymentGatewayConfig["capabilities"]
      >,
    });
  }

  /**
   * Validate gateway is configured and enabled
   */
  async validateGateway(gatewayId: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const gateway = getGatewayById(gatewayId);

      if (!gateway) {
        return {
          isValid: false,
          error: `Gateway ${gatewayId} not found`,
        };
      }

      if (!gateway.enabled) {
        return {
          isValid: false,
          error: `Gateway ${gatewayId} is not enabled`,
        };
      }

      // Check configuration status via API
      const status = await this.getGatewayStatus(gatewayId);

      if (!status.configured) {
        return {
          isValid: false,
          error: `Gateway ${gatewayId} is not configured`,
        };
      }

      if (!status.healthy) {
        return {
          isValid: false,
          error: status.error || `Gateway ${gatewayId} is not healthy`,
        };
      }

      return { isValid: true };
    } catch (error) {
      logError(error as Error, {
        component: "PaymentGatewayService.validateGateway",
        gatewayId,
      });
      return {
        isValid: false,
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
