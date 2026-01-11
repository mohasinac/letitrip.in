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

export interface CreateOrderParams {
  amount: number;
  currency: CurrencyCode;
  orderId?: string;
  notes?: Record<string, string>;
  receipt?: string;
}

export interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: CurrencyCode;
  receipt?: string;
  status: string;
  createdAt: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
}

export interface CapturePaymentParams {
  paymentId: string;
  amount: number;
  currency: CurrencyCode;
}

export interface CapturePaymentResponse {
  id: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
  capturedAt: string;
}

export interface RefundPaymentParams {
  paymentId: string;
  amount?: number; // Optional for partial refunds
  notes?: Record<string, string>;
  receipt?: string;
}

export interface RefundPaymentResponse {
  id: string;
  paymentId: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
  createdAt: string;
  notes?: Record<string, string>;
}

export interface PaymentDetails {
  id: string;
  orderId: string;
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
  notes?: Record<string, string>;
}

// PayPal specific types
export interface CreatePayPalOrderParams {
  amount: number;
  currency: CurrencyCode;
  orderId: string;
  description?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePayPalOrderResponse {
  id: string;
  status: string;
  approvalUrl: string;
  createdAt: string;
}

export interface CapturePayPalOrderParams {
  orderId: string;
}

export interface CapturePayPalOrderResponse {
  id: string;
  status: string;
  captureId: string;
  amount: number;
  currency: CurrencyCode;
  capturedAt: string;
}

// PhonePe specific types
export interface CreatePhonePeOrderParams {
  amount: number;
  orderId: string;
  merchantUserId: string;
  mobileNumber: string;
  callbackUrl: string;
  redirectUrl?: string;
  redirectMode?: "POST" | "REDIRECT";
}

export interface CreatePhonePeOrderResponse {
  merchantId: string;
  merchantTransactionId: string;
  instrumentResponse: {
    type: string;
    intentUrl?: string;
    redirectUrl?: string;
  };
  success: boolean;
  code: string;
  message: string;
}

export interface VerifyPhonePePaymentParams {
  merchantTransactionId: string;
}

export interface VerifyPhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument: {
      type: string;
      utr?: string;
    };
  };
}

export interface PhonePeRefundParams {
  merchantTransactionId: string;
  originalTransactionId: string;
  amount: number;
}

export interface PhonePeRefundResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
  };
}

// UPI specific types
export interface CreateUpiPaymentParams {
  amount: number;
  orderId: string;
  vpa: string; // Virtual Payment Address (UPI ID)
  name: string;
  description?: string;
  callbackUrl?: string;
}

export interface CreateUpiPaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  vpa: string;
  status: string;
  qrCodeUrl?: string;
  intentUrl?: string;
  createdAt: string;
}

export interface VerifyUpiPaymentParams {
  id: string;
  orderId: string;
}

export interface VerifyUpiPaymentResponse {
  success: boolean;
  id: string;
  orderId: string;
  amount: number;
  vpa: string;
  utr: string; // Unique Transaction Reference
  status: string;
  paidAt?: string;
}

// Currency conversion types
export interface CurrencyConversionParams {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
}

export interface CurrencyConversionResponse {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

// Payment validation types
export interface ValidatePaymentAmountParams {
  amount: number;
  currency: CurrencyCode;
  gatewayId: string;
}

export interface ValidatePaymentAmountResponse {
  isValid: boolean;
  error?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================================================
// RAZORPAY SERVICE
// ============================================================================

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
        component: "RazorpayService.verifyPayment",
        params: { orderId: params.orderId, paymentId: params.paymentId },
      });
      throw error;
    }
  }

  /**
   * Capture a payment (for authorized payments)
   */
  async capturePayment(
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
        component: "RazorpayService.refundPayment",
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

class PayPalService {
  private readonly baseUrl = "/api/payments/paypal";

  /**
   * Create a new PayPal order
   */
  async createOrder(
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
        component: "PayPalService.refundPayment",
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
        component: "PayPalService.getOrderDetails",
        orderId,
      });
      throw error;
    }
  }
}

// ============================================================================
// PHONEPE SERVICE
// ============================================================================

class PhonePeService {
  private readonly baseUrl = "/api/payments/phonepe";

  /**
   * Create a new PhonePe payment order
   * PhonePe uses UPI-based payments popular in India
   */
  async createOrder(
    params: CreatePhonePeOrderParams
  ): Promise<CreatePhonePeOrderResponse> {
    try {
      const response = await apiService.post<CreatePhonePeOrderResponse>(
        `${this.baseUrl}/orders`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "PhonePeService.createOrder",
        params: {
          amount: params.amount,
          orderId: params.orderId,
          merchantUserId: params.merchantUserId,
        },
      });
      throw error;
    }
  }

  /**
   * Verify PhonePe payment status
   */
  async verifyPayment(
    params: VerifyPhonePePaymentParams
  ): Promise<VerifyPhonePePaymentResponse> {
    try {
      const response = await apiService.post<VerifyPhonePePaymentResponse>(
        `${this.baseUrl}/verify`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "PhonePeService.verifyPayment",
        params,
      });
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkStatus(
    merchantTransactionId: string
  ): Promise<VerifyPhonePePaymentResponse> {
    try {
      const response = await apiService.get<VerifyPhonePePaymentResponse>(
        `${this.baseUrl}/status/${merchantTransactionId}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "PhonePeService.checkStatus",
        merchantTransactionId,
      });
      throw error;
    }
  }

  /**
   * Refund a PhonePe payment
   */
  async refundPayment(
    params: PhonePeRefundParams
  ): Promise<PhonePeRefundResponse> {
    try {
      const response = await apiService.post<PhonePeRefundResponse>(
        `${this.baseUrl}/refund`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "PhonePeService.refundPayment",
        params: {
          merchantTransactionId: params.merchantTransactionId,
          amount: params.amount,
        },
      });
      throw error;
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(
    merchantTransactionId: string
  ): Promise<PhonePeRefundResponse> {
    try {
      const response = await apiService.get<PhonePeRefundResponse>(
        `${this.baseUrl}/refund/${merchantTransactionId}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "PhonePeService.getRefundStatus",
        merchantTransactionId,
      });
      throw error;
    }
  }
}

// ============================================================================
// UPI SERVICE
// ============================================================================

class UpiService {
  private readonly baseUrl = "/api/payments/upi";

  /**
   * Create a UPI payment request
   * Supports multiple UPI payment methods including:
   * - Direct VPA (UPI ID) collection
   * - QR code generation
   * - Intent-based payments
   */
  async createPayment(
    params: CreateUpiPaymentParams
  ): Promise<CreateUpiPaymentResponse> {
    try {
      const response = await apiService.post<CreateUpiPaymentResponse>(
        `${this.baseUrl}/create`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "UpiService.createPayment",
        params: {
          amount: params.amount,
          orderId: params.orderId,
          vpa: params.vpa,
        },
      });
      throw error;
    }
  }

  /**
   * Generate UPI QR code for payment
   */
  async generateQrCode(params: {
    amount: number;
    orderId: string;
    name: string;
    description?: string;
  }): Promise<{ qrCodeUrl: string; qrCodeData: string }> {
    try {
      const response = await apiService.post<{
        qrCodeUrl: string;
        qrCodeData: string;
      }>(`${this.baseUrl}/generate-qr`, params);
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "UpiService.generateQrCode",
        params,
      });
      throw error;
    }
  }

  /**
   * Verify UPI payment
   */
  async verifyPayment(
    params: VerifyUpiPaymentParams
  ): Promise<VerifyUpiPaymentResponse> {
    try {
      const response = await apiService.post<VerifyUpiPaymentResponse>(
        `${this.baseUrl}/verify`,
        params
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "UpiService.verifyPayment",
        params,
      });
      throw error;
    }
  }

  /**
   * Check UPI payment status
   */
  async checkStatus(id: string): Promise<VerifyUpiPaymentResponse> {
    try {
      const response = await apiService.get<VerifyUpiPaymentResponse>(
        `${this.baseUrl}/status/${id}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "UpiService.checkStatus",
        id,
      });
      throw error;
    }
  }

  /**
   * Validate UPI VPA (Virtual Payment Address)
   */
  async validateVpa(vpa: string): Promise<{ isValid: boolean; name?: string }> {
    try {
      const response = await apiService.post<{
        isValid: boolean;
        name?: string;
      }>(`${this.baseUrl}/validate-vpa`, { vpa });
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "UpiService.validateVpa",
        vpa,
      });
      throw error;
    }
  }

  /**
   * Get UPI payment details
   */
  async getPaymentDetails(id: string): Promise<PaymentDetails> {
    try {
      const response = await apiService.get<PaymentDetails>(
        `${this.baseUrl}/payments/${id}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "UpiService.getPaymentDetails",
        id,
      });
      throw error;
    }
  }
}

// ============================================================================
// GENERIC PAYMENT SERVICE
// ============================================================================

class GenericPaymentService {
  /**
   * Convert currency using exchange rates
   */
  async convertCurrency(
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
    gatewayId: string;
    amount: number;
    currency: CurrencyCode;
    isInternational?: boolean;
  }): Promise<{ fee: number; totalAmount: number }> {
    try {
      const response = await apiService.post<{
        fee: number;
        totalAmount: number;
      }>("/api/payments/calculate-fee", params);
      return response;
    } catch (error) {
      logError(error as Error, {
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
    amount: number;
    currency: CurrencyCode;
    country: string;
  }): Promise<
    Array<{
      id: string;
      name: string;
      fee: number;
      priority: number;
    }>
  > {
    try {
      const response = await apiService.post<
        Array<{
          id: string;
          name: string;
          fee: number;
          priority: number;
        }>
      >("/api/payments/available-gateways", params);
      return response;
    } catch (error) {
      logError(error as Error, {
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

class PaymentService {
  public razorpay: RazorpayService;
  public paypal: PayPalService;
  public phonepe: PhonePeService;
  public upi: UpiService;
  public generic: GenericPaymentService;

  constructor() {
    this.razorpay = new RazorpayService();
    this.paypal = new PayPalService();
    this.phonepe = new PhonePeService();
    this.upi = new UpiService();
    this.generic = new GenericPaymentService();
  }

  /**
   * Generic method to create order for any gateway
   */
  async createOrder(
    gatewayId: string,
    params:
      | CreateOrderParams
      | CreatePayPalOrderParams
      | CreatePhonePeOrderParams
      | CreateUpiPaymentParams
  ): Promise<
    | CreateOrderResponse
    | CreatePayPalOrderResponse
    | CreatePhonePeOrderResponse
    | CreateUpiPaymentResponse
  > {
    switch (gatewayId) {
      case "razorpay":
        return this.razorpay.createOrder(params as CreateOrderParams);
      case "paypal":
        return this.paypal.createOrder(params as CreatePayPalOrderParams);
      case "phonepe":
        return this.phonepe.createOrder(params as CreatePhonePeOrderParams);
      case "upi":
        return this.upi.createPayment(params as CreateUpiPaymentParams);
      default:
        throw new Error(`Unsupported gateway: ${gatewayId}`);
    }
  }

  /**
   * Generic method to verify payment for any gateway
   */
  async verifyPayment(
    gatewayId: string,
    params:
      | VerifyPaymentParams
      | VerifyPhonePePaymentParams
      | VerifyUpiPaymentParams
  ): Promise<
    | VerifyPaymentResponse
    | VerifyPhonePePaymentResponse
    | VerifyUpiPaymentResponse
  > {
    switch (gatewayId) {
      case "razorpay":
        return this.razorpay.verifyPayment(params as VerifyPaymentParams);
      case "phonepe":
        return this.phonepe.verifyPayment(params as VerifyPhonePePaymentParams);
      case "upi":
        return this.upi.verifyPayment(params as VerifyUpiPaymentParams);
      default:
        throw new Error(`Unsupported gateway: ${gatewayId}`);
    }
  }

  /**
   * Generic method to refund payment for any gateway
   */
  async refundPayment(
    gatewayId: string,
    params: RefundPaymentParams | PhonePeRefundParams
  ): Promise<RefundPaymentResponse | PhonePeRefundResponse> {
    switch (gatewayId) {
      case "razorpay":
        return this.razorpay.refundPayment(params as RefundPaymentParams);
      case "paypal":
        return this.paypal.refundPayment(params as RefundPaymentParams);
      case "phonepe":
        return this.phonepe.refundPayment(params as PhonePeRefundParams);
      default:
        throw new Error(`Unsupported gateway: ${gatewayId}`);
    }
  }

  /**
   * Helper: Convert INR to foreign currency
   */
  async convertFromINR(
    amount: number,
    toCurrency: CurrencyCode
  ): Promise<number> {
    if (toCurrency === "INR") return amount;

    const result = await this.generic.convertCurrency({
      amount,
      fromCurrency: "INR",
      toCurrency,
    });

    return result.convertedAmount;
  }

  /**
   * Helper: Convert foreign currency to INR
   */
  async convertToINR(
    amount: number,
    fromCurrency: CurrencyCode
  ): Promise<number> {
    if (fromCurrency === "INR") return amount;

    const result = await this.generic.convertCurrency({
      amount,
      fromCurrency,
      toCurrency: "INR",
    });

    return result.convertedAmount;
  }

  /**
   * Helper: Validate payment amount
   */
  async validatePaymentAmount(
    amount: number,
    currency: CurrencyCode,
    gatewayId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    const result = await this.generic.validateAmount({
      amount,
      currency,
      gatewayId,
    });

    return {
      isValid: result.isValid,
      error: result.error,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const paymentService = new PaymentService();
