import { withPhonePeEnabled } from "@/lib/payment-gate";
import { withProviders } from "@/providers.config";
/**
 * POST /api/payment/event/init
 *
 * Creates a payment event node in Firebase Realtime DB and issues a
 * one-time, per-event custom token so the browser can subscribe read-only
 * to that single RTDB path.
 *
 * Security model:
 *  - Requires a valid session cookie — users must be authenticated.
 *  - The custom token claim { paymentEventId: merchantOrderId } restricts
 *    the token to read ONLY /payment_events/{merchantOrderId}.
 *    See database.rules.json.
 *  - The event node TTL is 15 min server-side (enforced by the
 *    cleanupPaymentEvents Firebase Function) and 5 min client-side
 *    (usePaymentEvent hard-timeout).
 *  - The PhonePe merchantOrderId is the node key — the webhook knows it
 *    directly (echoed back in the callback payload), so no secondary
 *    lookup is needed when signalling the outcome.
 *
 * Returns:
 *   { eventId: string, customToken: string, expiresAt: number }
 *
 * Typical call sequence:
 *  1. Client calls POST /api/payment/create-order → receives merchantOrderId
 *  2. Client calls this endpoint with { merchantOrderId }
 *  3. Client subscribes via usePaymentEvent.subscribe(eventId, customToken)
 *  4. Client opens the PhonePe checkout (IFRAME)
 *  5a. IFRAME callback fires → client calls POST /api/payment/verify
 *      → verify route signals RTDB { status:'success', orderIds:[…] }
 *  5b. PhonePe webhook fires → signals RTDB (authoritative if the buyer's
 *      tab is gone by the time the callback would have fired)
 *  6. usePaymentEvent.status → 'success' → UI navigates to order confirmation
 */

import { getAdminAuth, getAdminRealtimeDb, normalizeError } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { RTDB_PATHS } from "@mohasinac/appkit";
import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit";

/** Client-side hard timeout communicated via expiresAt. */
const EVENT_TTL_MS = 5 * 60 * 1000;

const bodySchema = z.object({
  merchantOrderId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
});

const __POST__g = withProviders(createRouteHandler<(typeof bodySchema)["_output"]>({
  auth: true,
  schema: bodySchema,
  handler: async ({ request, user, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { merchantOrderId } = body!;
    const db = getAdminRealtimeDb();
    let rtdbEnabled = true;
    try {
      await db
        .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${merchantOrderId}`)
        .set({ status: "pending", uid: user!.uid, createdAt: Date.now() });
    } catch (rtdbErr) {
      void normalizeError(rtdbErr);
      serverLogger.warn("Payment event RTDB write failed — live status updates unavailable", {
        merchantOrderId,
        rtdbErr,
      });
      rtdbEnabled = false;
    }
    const syntheticUid = `payment_event_${merchantOrderId}`;
    const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
      paymentEventId: merchantOrderId,
    });
    const expiresAt = Date.now() + EVENT_TTL_MS;
    serverLogger.info("Payment event initialised", {
      merchantOrderId,
      uid: user!.uid,
      rtdbEnabled,
    });
    return successResponse({
      eventId: merchantOrderId,
      customToken,
      expiresAt,
      rtdbEnabled,
    });
  },
}));

export const POST = withPhonePeEnabled(__POST__g);
