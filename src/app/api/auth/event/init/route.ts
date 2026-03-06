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

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminAuth, getAdminRealtimeDb } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import { AppError } from "@/lib/errors";

/** Custom token lifetime: 5 min (covers the full OAuth round-trip and leaves buffer). */
const TOKEN_LIFETIME_MS = 5 * 60 * 1000;

/** RTDB node TTL communicated to the client (2 min hard timeout on the useAuthEvent hook). */
const EVENT_TTL_MS = 2 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Rate-limit — same budget as other auth endpoints to prevent token farming
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

    const eventId = randomUUID(); // 122 bits of randomness — unguessable

    // Write the pending node via Admin SDK (bypasses RTDB rules — write: false for clients)
    const db = getAdminRealtimeDb();
    await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).set({
      status: "pending",
      createdAt: Date.now(), // epoch ms — used by cleanup function
    });

    // Issue a per-event custom token.  The synthetic UID keeps it isolated
    // from real user accounts.  The authEventId claim is the RTDB read gate.
    const syntheticUid = `auth_event_${eventId}`;
    const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
      authEventId: eventId,
    });

    const expiresAt = Date.now() + EVENT_TTL_MS;

    serverLogger.info("Auth event initialised", { eventId });

    return successResponse({ eventId, customToken, expiresAt });
  } catch (error) {
    serverLogger.error("POST /api/auth/event/init error", { error });
    return handleApiError(error);
  }
}
