/**
 * Payment Service
 * Handles all payment-related API operations (Razorpay, PayPal, etc.)
 */

import { apiClient } from "../client";
import type {
  RazorpayOrderData,
  RazorpayOrderResponse,
  RazorpayVerifyData,
  PayPalOrderData,
  PayPalOrderResponse,
  PayPalCaptureData
} from "@/types/shared";

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
