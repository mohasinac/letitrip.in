/**
 * POST /api/payment/event/init
 *
 * Creates a payment event node in Firebase Realtime DB and issues a
 * one-time, per-event custom token so the browser can subscribe read-only
 * to that single RTDB path.
 *
 * Security model:
 *  - Requires a valid session cookie — users must be authenticated.
 *  - The custom token claim { paymentEventId: razorpayOrderId } restricts
 *    the token to read ONLY /payment_events/{razorpayOrderId}.
 *    See database.rules.json.
 *  - The event node TTL is 15 min server-side (enforced by the
 *    cleanupPaymentEvents Firebase Function) and 5 min client-side
 *    (usePaymentEvent hard-timeout).
 *  - The Razorpay order ID is the node key — the webhook knows it directly,
 *    so no secondary lookup is needed when signalling the outcome.
 *
 * Returns:
 *   { eventId: string, customToken: string, expiresAt: number }
 *
 * Typical call sequence:
 *  1. Client calls POST /api/payment/create-order → receives razorpayOrderId
 *  2. Client calls this endpoint with { razorpayOrderId }
 *  3. Client subscribes via usePaymentEvent.subscribe(eventId, customToken)
 *  4. Client opens Razorpay modal
 *  5a. Razorpay client handler fires → client calls POST /api/payment/verify
 *      → verify route signals RTDB { status:'success', orderIds:[…] }
 *  5b. Razorpay webhook fires → signals RTDB (fallback for dropped connections)
 *  6. usePaymentEvent.status → 'success' → UI navigates to order confirmation
 */

import { getAdminAuth, getAdminRealtimeDb } from "@/lib/firebase/admin";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";

/** Client-side hard timeout communicated via expiresAt. */
const EVENT_TTL_MS = 5 * 60 * 1000;

const bodySchema = z.object({
  razorpayOrderId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
});

export const POST = createApiHandler<(typeof bodySchema)["_output"]>({
  auth: true,
  rateLimit: RateLimitPresets.AUTH,
  schema: bodySchema,
  handler: async ({ user, body }) => {
    const { razorpayOrderId } = body!;
    const db = getAdminRealtimeDb();
    await db
      .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${razorpayOrderId}`)
      .set({ status: "pending", uid: user!.uid, createdAt: Date.now() });
    const syntheticUid = `payment_event_${razorpayOrderId}`;
    const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
      paymentEventId: razorpayOrderId,
    });
    const expiresAt = Date.now() + EVENT_TTL_MS;
    serverLogger.info("Payment event initialised", {
      razorpayOrderId,
      uid: user!.uid,
    });
    return successResponse({
      eventId: razorpayOrderId,
      customToken,
      expiresAt,
    });
  },
});
