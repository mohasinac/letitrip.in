/**
 * @fileoverview Service Module
 * @module src/services/payment.service
 * @description This file contains service functions for payment operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Payment Service
 *
 * Client-side service for payment gateway operations including:
 * - Order creation
 * - Payment verification
 * - Refunds
 * - Currency conversion
 * - Payment validation
 *
 * This service calls backend API routes that handle actual payment gateway interactions.
 *
 * Usage:
 * ```ts
 * import { paymentService } from '@/services/payment.service';
 *
 * // Create Razorpay order
 * const order = await paymentService.razorpay.createOrder({ amount: 1000, currency: 'INR' });
 *
 * // Verify payment
 * const verified = await paymentService.razorpay.verifyPayment({ ... });
 * ```
 */

import type { CurrencyCode } from "@/config/payment-gateways.config";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";

// ============================================================================
// TYPES
// ============================================================================

/**
 * CreateOrderParams interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateOrderParams
 */
export interface CreateOrderParams {
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Order Id */
  orderId?: string;
  /** Notes */
  notes?: Record<string, string>;
  /** Receipt */
  receipt?: string;
}

/**
 * CreateOrderResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateOrderResponse
 */
export interface CreateOrderResponse {
  /** Id */
  id: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Receipt */
  receipt?: string;
  /** Status */
  status: string;
  /** Created At */
  createdAt: string;
  /** Notes */
  notes?: Record<string, string>;
}

/**
 * VerifyPaymentParams interface
 * 
 * @interface
 * @description Defines the structure and contract for VerifyPaymentParams
 */
export interface VerifyPaymentParams {
  /** Order Id */
  orderId: string;
  /** Payment Id */
  paymentId: string;
  /** Signature */
  signature: string;
}

/**
 * VerifyPaymentResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for VerifyPaymentResponse
 */
export interface VerifyPaymentResponse {
  /** Success */
  success: boolean;
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
}

/**
 * CapturePaymentParams interface
 * 
 * @interface
 * @description Defines the structure and contract for CapturePaymentParams
 */
export interface CapturePaymentParams {
  /** Payment Id */
  paymentId: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
}

/**
 * CapturePaymentResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for CapturePaymentResponse
 */
export interface CapturePaymentResponse {
  /** Id */
  id: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Status */
  status: string;
  /** Captured At */
  capturedAt: string;
}

/**
 * RefundPaymentParams interface
 * 
 * @interface
 * @description Defines the structure and contract for RefundPaymentParams
 */
export interface RefundPaymentParams {
  /** Payment Id */
  paymentId: string;
  /** Amount */
  amount?: number; // Optional for partial refunds
  /** Notes */
  notes?: Record<string, string>;
  /** Receipt */
  receipt?: string;
}

/**
 * RefundPaymentResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for RefundPaymentResponse
 */
export interface RefundPaymentResponse {
  /** Id */
  id: string;
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
  /** Notes */
  notes?: Record<string, string>;
}

/**
 * PaymentDetails interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentDetails
 */
export interface PaymentDetails {
  /** Id */
  id: string;
  /** Order Id */
  orderId: string;
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
  /** Notes */
  notes?: Record<string, string>;
}

// PayPal specific types
/**
 * CreatePayPalOrderParams interface
 * 
 * @interface
 * @description Defines the structure and contract for CreatePayPalOrderParams
 */
export interface CreatePayPalOrderParams {
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Order Id */
  orderId: string;
  /** Description */
  description?: string;
  /** Return Url */
  returnUrl: string;
  /** Cancel Url */
  cancelUrl: string;
}

/**
 * CreatePayPalOrderResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for CreatePayPalOrderResponse
 */
export interface CreatePayPalOrderResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /** Approval Url */
  approvalUrl: string;
  /** Created At */
  createdAt: string;
}

/**
 * CapturePayPalOrderParams interface
 * 
 * @interface
 * @description Defines the structure and contract for CapturePayPalOrderParams
 */
export interface CapturePayPalOrderParams {
  /** Order Id */
  orderId: string;
}

/**
 * CapturePayPalOrderResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for CapturePayPalOrderResponse
 */
export interface CapturePayPalOrderResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /** Capture Id */
  captureId: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Captured At */
  capturedAt: string;
}

// Currency conversion types
/**
 * CurrencyConversionParams interface
 * 
 * @interface
 * @description Defines the structure and contract for CurrencyConversionParams
 */
export interface CurrencyConversionParams {
  /** Amount */
  amount: number;
  /** From Currency */
  fromCurrency: CurrencyCode;
  /** To Currency */
  toCurrency: CurrencyCode;
}

/**
 * CurrencyConversionResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for CurrencyConversionResponse
 */
export interface CurrencyConversionResponse {
  /** Amount */
  amount: number;
  /** From Currency */
  fromCurrency: CurrencyCode;
  /** To Currency */
  toCurrency: CurrencyCode;
  /** Converted Amount */
  convertedAmount: number;
  /** Rate */
  rate: number;
  /** Timestamp */
  timestamp: string;
}

// Payment validation types
/**
 * ValidatePaymentAmountParams interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidatePaymentAmountParams
 */
export interface ValidatePaymentAmountParams {
  /** Amount */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Gateway Id */
  gatewayId: string;
}

/**
 * ValidatePaymentAmountResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidatePaymentAmountResponse
 */
export interface ValidatePaymentAmountResponse {
  /** Is Valid */
  isValid: boolean;
  /** Error */
  error?: string;
  /** Min Amount */
  minAmount?: number;
  /** Max Amount */
  maxAmount?: number;
}

// ============================================================================
// RAZORPAY SERVICE
// ============================================================================

/**
 * RazorpayService class
 * 
 * @class
 * @description Description of RazorpayService class functionality
 */
class RazorpayService {
  private readonly baseUrl = "/api/payments/razorpay";

  /**
   * Create a new Razorpay order
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
    try {
      const response = await apiService.post<CreateOrderResponse>(
        `${this.baseUrl}/orders`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "RazorpayService.createOrder",
        params,
      });
      throw error;
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(
    /** Params */
    params: VerifyPaymentParams
  ): Promise<VerifyPaymentResponse> {
    try {
      const response = await apiService.post<VerifyPaymentResponse>(
        `${this.baseUrl}/verify`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "RazorpayService.verifyPayment",
        /** Params */
        params: { orderId: params.orderId, paymentId: params.paymentId },
      });
      throw error;
    }
  }

  /**
   * Capture a payment (for authorized payments)
   */
  async capturePayment(
    /** Params */
    params: CapturePaymentParams
  ): Promise<CapturePaymentResponse> {
    try {
      const response = await apiService.post<CapturePaymentResponse>(
        `${this.baseUrl}/capture`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "RazorpayService.capturePayment",
        params,
      });
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    /** Params */
    params: RefundPaymentParams
  ): Promise<RefundPaymentResponse> {
    try {
      const response = await apiService.post<RefundPaymentResponse>(
        `${this.baseUrl}/refund`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "RazorpayService.refundPayment",
        /** Params */
        params: { paymentId: params.paymentId, amount: params.amount },
      });
      throw error;
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    try {
      const response = await apiService.get<PaymentDetails>(
        `${this.baseUrl}/payments/${paymentId}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "RazorpayService.getPaymentDetails",
        paymentId,
      });
      throw error;
    }
  }
}

// ============================================================================
// PAYPAL SERVICE
// ============================================================================

/**
 * PayPalService class
 * 
 * @class
 * @description Description of PayPalService class functionality
 */
class PayPalService {
  private readonly baseUrl = "/api/payments/paypal";

  /**
   * Create a new PayPal order
   */
  async createOrder(
    /** Params */
    params: CreatePayPalOrderParams
  ): Promise<CreatePayPalOrderResponse> {
    try {
      const response = await apiService.post<CreatePayPalOrderResponse>(
        `${this.baseUrl}/orders`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PayPalService.createOrder",
        params,
      });
      throw error;
    }
  }

  /**
   * Capture PayPal order after approval
   */
  async captureOrder(
    /** Params */
    params: CapturePayPalOrderParams
  ): Promise<CapturePayPalOrderResponse> {
    try {
      const response = await apiService.post<CapturePayPalOrderResponse>(
        `${this.baseUrl}/capture`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PayPalService.captureOrder",
        params,
      });
      throw error;
    }
  }

  /**
   * Refund a PayPal payment
   */
  async refundPayment(
    /** Params */
    params: RefundPaymentParams
  ): Promise<RefundPaymentResponse> {
    try {
      const response = await apiService.post<RefundPaymentResponse>(
        `${this.baseUrl}/refund`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PayPalService.refundPayment",
        /** Params */
        params: { paymentId: params.paymentId, amount: params.amount },
      });
      throw error;
    }
  }

  /**
   * Get PayPal order details
   */
  async getOrderDetails(orderId: string): Promise<PaymentDetails> {
    try {
      const response = await apiService.get<PaymentDetails>(
        `${this.baseUrl}/orders/${orderId}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "PayPalService.getOrderDetails",
        orderId,
      });
      throw error;
    }
  }
}

// ============================================================================
// GENERIC PAYMENT SERVICE
// ============================================================================

/**
 * GenericPaymentService class
 * 
 * @class
 * @description Description of GenericPaymentService class functionality
 */
class GenericPaymentService {
  /**
   * Convert currency using exchange rates
   */
  async convertCurrency(
    /** Params */
    params: CurrencyConversionParams
  ): Promise<CurrencyConversionResponse> {
    try {
      const response = await apiService.post<CurrencyConversionResponse>(
        "/api/payments/convert-currency",
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GenericPaymentService.convertCurrency",
        params,
      });
      throw error;
    }
  }

  /**
   * Validate payment amount for gateway
   */
  async validateAmount(
    /** Params */
    params: ValidatePaymentAmountParams
  ): Promise<ValidatePaymentAmountResponse> {
    try {
      const response = await apiService.post<ValidatePaymentAmountResponse>(
        "/api/payments/validate-amount",
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GenericPaymentService.validateAmount",
        params,
      });
      throw error;
    }
  }

  /**
   * Calculate payment gateway fee
   */
  async calculateFee(params: {
    /** Gateway Id */
    gatewayId: string;
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Is International */
    isInternational?: boolean;
  }): Promise<{ fee: number; totalAmount: number }> {
    try {
      const response = await apiService.post<{
        /** Fee */
        fee: number;
        /** Total Amount */
        totalAmount: number;
      }>("/api/payments/calculate-fee", params);
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GenericPaymentService.calculateFee",
        params,
      });
      throw error;
    }
  }

  /**
   * Get available payment gateways for transaction
   */
  async getAvailableGateways(params: {
    /** Amount */
    amount: number;
    /** Currency */
    currency: CurrencyCode;
    /** Country */
    country: string;
  }): Promise<
    Array<{
      /** Id */
      id: string;
      /** Name */
      name: string;
      /** Fee */
      fee: number;
      /** Priority */
      priority: number;
    }>
  > {
    try {
      const response = await apiService.post<
        Array<{
          /** Id */
          id: string;
          /** Name */
          name: string;
          /** Fee */
          fee: number;
          /** Priority */
          priority: number;
        }>
      >("/api/payments/available-gateways", params);
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GenericPaymentService.getAvailableGateways",
        params,
      });
      throw error;
    }
  }
}

// ============================================================================
// PAYMENT SERVICE (Main Export)
// ============================================================================

/**
 * PaymentService class
 * 
 * @class
 * @description Description of PaymentService class functionality
 */
class PaymentService {
  public razorpay: RazorpayService;
  public paypal: PayPalService;
  public generic: GenericPaymentService;

  constructor() {
    this.razorpay = new RazorpayService();
    this.paypal = new PayPalService();
    this.generic = new GenericPaymentService();
  }

  /**
   * Generic method to create order for any gateway
   */
  async createOrder(
    /** Gateway Id */
    gatewayId: string,
    /** Params */
    params: CreateOrderParams | CreatePayPalOrderParams
  ): Promise<CreateOrderResponse | CreatePayPalOrderResponse> {
    switch (gatewayId) {
      case "razorpay":
        return this.razorpay.createOrder(params as CreateOrderParams);
      case "paypal":
        return this.paypal.createOrder(params as CreatePayPalOrderParams);
      /** Default */
      default:
        throw new Error(`Unsupported gateway: ${gatewayId}`);
    }
  }

  /**
   * Generic method to verify payment for any gateway
   */
  async verifyPayment(
    /** Gateway Id */
    gatewayId: string,
    /** Params */
    params: VerifyPaymentParams
  ): Promise<VerifyPaymentResponse> {
    switch (gatewayId) {
      case "razorpay":
        return this.razorpay.verifyPayment(params);
      /** Default */
      default:
        throw new Error(`Unsupported gateway: ${gatewayId}`);
    }
  }

  /**
   * Generic method to refund payment for any gateway
   */
  async refundPayment(
    /** Gateway Id */
    gatewayId: string,
    /** Params */
    params: RefundPaymentParams
  ): Promise<RefundPaymentResponse> {
    switch (gatewayId) {
      case "razorpay":
        return this.razorpay.refundPayment(params);
      case "paypal":
        return this.paypal.refundPayment(params);
      /** Default */
      default:
        throw new Error(`Unsupported gateway: ${gatewayId}`);
    }
  }

  /**
   * Helper: Convert INR to foreign currency
   */
  async convertFromINR(
    /** Amount */
    amount: number,
    /** To Currency */
    toCurrency: CurrencyCode
  ): Promise<number> {
    if (toCurrency === "INR") return amount;

    const result = await this.generic.convertCurrency({
      amount,
      /** From Currency */
      fromCurrency: "INR",
      toCurrency,
    });

    return result.convertedAmount;
  }

  /**
   * Helper: Convert foreign currency to INR
   */
  async convertToINR(
    /** Amount */
    amount: number,
    /** From Currency */
    fromCurrency: CurrencyCode
  ): Promise<number> {
    if (fromCurrency === "INR") return amount;

    const result = await this.generic.convertCurrency({
      amount,
      fromCurrency,
      /** To Currency */
      toCurrency: "INR",
    });

    return result.convertedAmount;
  }

  /**
   * Helper: Validate payment amount
   */
  async validatePaymentAmount(
    /** Amount */
    amount: number,
    /** Currency */
    currency: CurrencyCode,
    /** Gateway Id */
    gatewayId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    const result = await this.generic.validateAmount({
      amount,
      currency,
      gatewayId,
    });

    return {
      /** Is Valid */
      isValid: result.isValid,
      /** Error */
      error: result.error,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const paymentService = new PaymentService();

