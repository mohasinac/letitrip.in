import "@/providers.config";
/**
 * POST /api/auth/event/init
 *
 * Creates a pre-session auth event node in Firebase Realtime DB and issues a
 * one-time, per-event custom token so the browser (with NO existing session)
 * can subscribe read-only to that single RTDB path.
 *
 * Security model:
 *  - Rate-limited (same preset as auth endpoints).
 *  - No session cookie is required — this endpoint intentionally runs before login.
 *  - The custom token claim { authEventId: eventId } restricts the token to read
 *    ONLY /auth_events/{eventId}.  See database.rules.json.
 *  - The event node TTL is 3 min server-side (enforced by the cleanupAuthEvents
 *    Firebase Function) and 2 min client-side (hook hard-timeout).
 *  - A UUID eventId with 122 bits of entropy makes guessing infeasible.
 *
 * Used as Step 1 of every OAuth popup flow (Google, Apple) and as a base for
 * the payment event bridge.
 *
 * Returns:
 *   { eventId: string, customToken: string, expiresAt: number }
 */

import { randomUUID } from "crypto";
import { getAdminAuth, getAdminRealtimeDb } from "@/lib/firebase/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { RTDB_PATHS } from "@/lib/firebase/rtdb-paths";
import { createRouteHandler } from "@mohasinac/next";

/** RTDB node TTL communicated to the client (2 min hard timeout on the useAuthEvent hook). */
const EVENT_TTL_MS = 2 * 60 * 1000;

export const POST = createRouteHandler({
  handler: async ({ request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const eventId = randomUUID();
    const db = getAdminRealtimeDb();
    await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).set({
      status: "pending",
      createdAt: Date.now(),
    });
    const syntheticUid = `auth_event_${eventId}`;
    const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
      authEventId: eventId,
    });
    const expiresAt = Date.now() + EVENT_TTL_MS;
    serverLogger.info("Auth event initialised", { eventId });
    return successResponse({ eventId, customToken, expiresAt });
  },
});
