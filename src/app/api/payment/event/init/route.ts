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

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminRealtimeDb } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { z } from "zod";

/** Client-side hard timeout communicated via expiresAt. */
const EVENT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const bodySchema = z.object({
  razorpayOrderId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
});

export async function POST(request: NextRequest) {
  try {
    // Rate-limit — same budget as auth endpoints to prevent event farming
    const rateLimitResult = await applyRateLimit(
      request,
      RateLimitPresets.AUTH,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.GENERIC.RATE_LIMIT_EXCEEDED },
        { status: 429 },
      );
    }

    // Requires an active session
    const user = await requireAuthFromRequest(request);
    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    // Validate body
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }
    const { razorpayOrderId } = parsed.data;

    // Write the pending node via Admin SDK (clients have write:false)
    const db = getAdminRealtimeDb();
    await db
      .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${razorpayOrderId}`)
      .set({ status: "pending", uid: user.uid, createdAt: Date.now() });

    // Issue a per-event custom token scoped to this single RTDB path
    const syntheticUid = `payment_event_${razorpayOrderId}`;
    const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
      paymentEventId: razorpayOrderId,
    });

    const expiresAt = Date.now() + EVENT_TTL_MS;

    serverLogger.info("Payment event initialised", {
      razorpayOrderId,
      uid: user.uid,
    });

    return successResponse({
      eventId: razorpayOrderId,
      customToken,
      expiresAt,
    });
  } catch (error) {
    serverLogger.error("POST /api/payment/event/init error", { error });
    return handleApiError(error);
  }
}
