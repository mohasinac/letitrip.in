/**
 * Checkout Service
 *
 * BUG FIX #24: Refactored to use apiService instead of raw fetch
 * Benefits:
 * - Automatic retry with exponential backoff
 * - Request deduplication (prevents duplicate orders)
 * - Stale-while-revalidate caching for order details
 * - Centralized error handling and logging
 * - Analytics tracking for checkout performance
 * - Request cancellation support
 */

import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "./api.service";

interface CreateOrderData {
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: "razorpay" | "paypal" | "cod";
  currency?: "INR" | "USD" | "EUR" | "GBP";
  couponCode?: string;
  notes?: string;
}

interface VerifyPaymentData {
  order_id?: string;
  order_ids?: string[];
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

class CheckoutService {
  /**
   * Create checkout order
   * Uses apiService for retry, deduplication, and error tracking
   */
  async createOrder(data: CreateOrderData) {
    try {
      return await apiService.post("/checkout/create-order", data);
    } catch (error) {
      logError(error as Error, {
        service: "CheckoutService.createOrder",
        paymentMethod: data.paymentMethod,
      });
      throw error;
    }
  }

  /**
   * Verify payment
   * Critical operation with automatic retry
   */
  async verifyPayment(data: VerifyPaymentData) {
    try {
      return await apiService.post("/checkout/verify-payment", data);
    } catch (error) {
      logError(error as Error, {
        service: "CheckoutService.verifyPayment",
        orderId: data.order_id,
      });
      throw error;
    }
  }

  /**
   * Capture PayPal payment
   * Deduplication prevents double-capture
   */
  async capturePayPalPayment(data: { orderId: string; payerId: string }) {
    try {
      return await apiService.post("/payments/paypal/capture", data);
    } catch (error) {
      logError(error as Error, {
        service: "CheckoutService.capturePayPalPayment",
        orderId: data.orderId,
      });
      throw error;
    }
  }

  /**
   * Get order details
   * Cached with stale-while-revalidate (reduces server load)
   */
  async getOrderDetails(orderId: string) {
    try {
      return await apiService.get(`/orders/${orderId}`);
    } catch (error) {
      logError(error as Error, {
        service: "CheckoutService.getOrderDetails",
        orderId,
      });
      throw error;
    }
  }
}

export const checkoutService = new CheckoutService();
