import "@/providers.config";
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

import { getAdminAuth, getAdminRealtimeDb } from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { RTDB_PATHS } from "@mohasinac/appkit/server";
import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/server";

/** Client-side hard timeout communicated via expiresAt. */
const EVENT_TTL_MS = 5 * 60 * 1000;

const bodySchema = z.object({
  razorpayOrderId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
});

export const POST = createRouteHandler<(typeof bodySchema)["_output"]>({
  auth: true,
  schema: bodySchema,
  handler: async ({ request, user, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
    if (!rl.success) return errorResponse("Too many requests", 429);
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

