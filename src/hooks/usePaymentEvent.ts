"use client";

/**
 * usePaymentEvent
 *
 * Client-side handler for the Razorpay payment outcome bridge.
 * Thin domain wrapper over `useRealtimeEvent` scoped to `payment_events`.
 *
 * Flow recap (full detail in docs/PAYMENT.md §8):
 *  1. Server returns { eventId, customToken } from POST /api/payment/event/init.
 *  2. This hook subscribes to /payment_events/{eventId} using the custom token.
 *  3. On status "success" → `orderIds` is populated; navigate to confirmation.
 *
 * @example
 * ```tsx
 * const paymentEvent = usePaymentEvent();
 * useEffect(() => {
 *   if (paymentEvent.status === RealtimeEventStatus.SUCCESS) router.push(ROUTES.USER.ORDERS);
 *   if (paymentEvent.status === RealtimeEventStatus.FAILED) showMessage(paymentEvent.error);
 * }, [paymentEvent.status]);
 * ```
 */

import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import {
  RealtimeEventType,
  RealtimeEventStatus,
  useRealtimeEvent,
  type RTDBEventPayload,
} from "./useRealtimeEvent";
import { ERROR_MESSAGES } from "@/constants";

// Re-export so existing callers typed against PaymentEventStatus continue to compile.
export type { RealtimeEventStatus as PaymentEventStatus };

export interface UsePaymentEventReturn {
  status: RealtimeEventStatus;
  /** Error or failure message; present when status is 'failed' or 'timeout'. */
  error: string | null;
  /** Order IDs created after a successful payment; present when status === 'success'. */
  orderIds: string[] | null;
  subscribe: (eventId: string, customToken: string) => void;
  reset: () => void;
}

const PAYMENT_EVENT_TIMEOUT_MS = 5 * 60 * 1000;

function extractOrderIds(raw: RTDBEventPayload): string[] | null {
  return (raw.orderIds as string[] | undefined) ?? null;
}

export function usePaymentEvent(): UsePaymentEventReturn {
  const {
    status,
    error,
    data: orderIds,
    subscribe,
    reset,
  } = useRealtimeEvent<string[]>({
    type: RealtimeEventType.PAYMENT,
    rtdbPath: RTDB_PATHS.PAYMENT_EVENTS,
    timeoutMs: PAYMENT_EVENT_TIMEOUT_MS,
    extractData: extractOrderIds,
    messages: {
      tokenFailure: ERROR_MESSAGES.CHECKOUT.PAYMENT_TRACKING_INIT_FAILED,
      connectionLost: ERROR_MESSAGES.CHECKOUT.PAYMENT_TRACKING_CONNECTION_LOST,
      timedOut: ERROR_MESSAGES.CHECKOUT.PAYMENT_TRACKING_TIMED_OUT,
      failure: ERROR_MESSAGES.CHECKOUT.PAYMENT_NOT_COMPLETED,
    },
  });

  return { status, error, orderIds, subscribe, reset };
}
