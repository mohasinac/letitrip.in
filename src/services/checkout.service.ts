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

  /**
   * Request server permission to send an OTP.
   * Atomically checks + increments the Firestore daily SMS counter.
   * Throws ApiClientError(429) when the free-tier cap (1 000/day IST) is reached.
   */
  requestOtpGrant: () => apiClient.post(API_ENDPOINTS.PAYMENT.OTP_REQUEST, {}),
};
