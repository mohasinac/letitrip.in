/**
 * GET /api/auth/apple/start
 *
 * Step 2 of the Apple Sign In popup flow.
 * Opens in a popup via window.open().
 *
 * Query params:
 *   eventId  — UUID from POST /api/auth/event/init
 *
 * This route:
 *   1. Validates the eventId format and verifies the node exists + is 'pending'
 *   2. Builds the Apple OAuth consent URL with state = eventId
 *   3. Redirects the popup to Apple
 *
 * Apple Sign In requirements:
 *   APPLE_CLIENT_ID   — Service ID registered in Apple Developer Console
 *                       (e.g. in.letitrip.app.web)
 *   NEXT_PUBLIC_APP_URL — Must match the registered Return URL in Apple console
 *
 * Note: Apple uses response_type=code id_token with response_mode=form_post,
 * so the callback is a POST request from Apple (handled by apple/callback/route.ts).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import { serverLogger } from "@/lib/server-logger";
import { AppError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { ERROR_MESSAGES } from "@/constants";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId") ?? "";

    if (!UUID_REGEX.test(eventId)) {
      return NextResponse.redirect(
        new URL(`/auth/close?error=invalid_event`, request.nextUrl.origin),
      );
    }

    const db = getAdminRealtimeDb();
    const snap = await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).get();
    if (!snap.exists() || snap.val()?.status !== "pending") {
      serverLogger.warn("Apple OAuth start: event not found or expired", {
        eventId,
      });
      return NextResponse.redirect(
        new URL(`/auth/close?error=event_expired`, request.nextUrl.origin),
      );
    }

    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) {
      serverLogger.error("APPLE_CLIENT_ID env var not set");
      throw new AppError(
        500,
        ERROR_MESSAGES.GENERIC.SERVER_CONFIG_ERROR,
        "SERVER_CONFIG_ERROR",
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const redirectUri = `${appUrl}/api/auth/apple/callback`;

    const appleAuthUrl = new URL("https://appleid.apple.com/auth/authorize");
    appleAuthUrl.searchParams.set("client_id", clientId);
    appleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    // request both code AND id_token so we can verify identity without extra API call
    appleAuthUrl.searchParams.set("response_type", "code id_token");
    // form_post is required by Apple for web — Apple POSTs back to our callback
    appleAuthUrl.searchParams.set("response_mode", "form_post");
    appleAuthUrl.searchParams.set("scope", "name email");
    appleAuthUrl.searchParams.set("state", eventId);

    return NextResponse.redirect(appleAuthUrl.toString());
  } catch (error) {
    serverLogger.error("GET /api/auth/apple/start error", { error });
    return handleApiError(error);
  }
}
