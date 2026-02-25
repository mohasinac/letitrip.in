/**
 * Checkout Service
 * Pure async functions for checkout and payment API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const checkoutService = {
  /** Place a COD order from the current cart */
  placeOrder: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.CHECKOUT.PLACE_ORDER, data),

  /** Create a Razorpay payment order */
  createPaymentOrder: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, data),

  /** Verify a Razorpay payment and complete the order */
  verifyPayment: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.PAYMENT.VERIFY, data),
};

export const couponService = {
  /** Validate a coupon code against a cart total */
  validate: (data: { code: string; total?: number }) =>
    apiClient.post(API_ENDPOINTS.COUPONS.VALIDATE, data),
};
