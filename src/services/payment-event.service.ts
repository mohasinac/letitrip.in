/**
 * Payment Event Service
 *
 * Initialises an RTDB payment event node and receives a per-event custom token.
 * Used as the first step of the Razorpay payment bridge, called after
 * POST /api/payment/create-order returns a razorpayOrderId.
 *
 * @example
 * ```ts
 * const { razorpayOrderId } = await checkoutService.createPaymentOrder({ ... });
 * const { eventId, customToken } = await paymentEventService.initPaymentEvent(razorpayOrderId);
 * paymentEvent.subscribe(eventId, customToken);
 * openRazorpay({ ... });
 * ```
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export interface PaymentEventResponse {
  /** The Razorpay order ID — used as the RTDB node key. */
  eventId: string;
  /** Per-event Firebase custom token with paymentEventId claim. Expires in 5 min. */
  customToken: string;
  /** Epoch ms when the event node expires client-side. */
  expiresAt: number;
}

export const paymentEventService = {
  /**
   * POST /api/payment/event/init
   * Creates the RTDB payment event node and returns the per-event custom token.
   * Requires a valid session cookie.
   */
  initPaymentEvent: (razorpayOrderId: string): Promise<PaymentEventResponse> =>
    apiClient.post(API_ENDPOINTS.PAYMENT.EVENT_INIT, { razorpayOrderId }),
};
