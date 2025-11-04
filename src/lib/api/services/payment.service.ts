/**
 * Payment Service
 * Handles all payment-related API operations (Razorpay, PayPal, etc.)
 */

import { apiClient } from "../client";

export interface RazorpayOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayVerifyData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export interface PayPalOrderData {
  amount: number;
  currency?: string;
  orderId: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureData {
  paypalOrderId: string;
  orderId: string;
}

export class PaymentService {
  // ============================================
  // Razorpay Methods
  // ============================================

  /**
   * Create Razorpay order
   */
  static async createRazorpayOrder(data: RazorpayOrderData): Promise<RazorpayOrderResponse> {
    try {
      const response = await apiClient.post<RazorpayOrderResponse>(
        '/api/payment/razorpay/create-order',
        data
      );
      return response;
    } catch (error) {
      console.error("PaymentService.createRazorpayOrder error:", error);
      throw error;
    }
  }

  /**
   * Verify Razorpay payment
   */
  static async verifyRazorpayPayment(data: RazorpayVerifyData): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        '/api/payment/razorpay/verify',
        data
      );
      return response;
    } catch (error) {
      console.error("PaymentService.verifyRazorpayPayment error:", error);
      throw error;
    }
  }

  // ============================================
  // PayPal Methods
  // ============================================

  /**
   * Create PayPal order
   */
  static async createPayPalOrder(data: PayPalOrderData): Promise<PayPalOrderResponse> {
    try {
      const response = await apiClient.post<PayPalOrderResponse>(
        '/api/payment/paypal/create-order',
        data
      );
      return response;
    } catch (error) {
      console.error("PaymentService.createPayPalOrder error:", error);
      throw error;
    }
  }

  /**
   * Capture PayPal payment
   */
  static async capturePayPalPayment(data: PayPalCaptureData): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        '/api/payment/paypal/capture',
        data
      );
      return response;
    } catch (error) {
      console.error("PaymentService.capturePayPalPayment error:", error);
      throw error;
    }
  }
}

export default PaymentService;
