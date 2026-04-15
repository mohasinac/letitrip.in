/**
 * GET /api/auth/google/start
 *
 * Step 2 of the Google OAuth popup flow.
 * Opens in a popup via window.open().
 *
 * Query params:
 *   eventId  — UUID from POST /api/auth/event/init
 *
 * This route:
 *   1. Validates the eventId format and verifies the node exists + is 'pending'
 *   2. Builds the Google OAuth consent URL with state = eventId
 *   3. Redirects the popup to Google
 *
 * Security:
 *   - eventId is UUID-validated before RTDB lookup (injection prevention)
 *   - RTDB node is verified 'pending' (prevents replay of stale/completed events)
 *   - state = eventId ties the callback back to the original event
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminRealtimeDb } from "@mohasinac/appkit/providers/db-firebase";
import { RTDB_PATHS } from "@mohasinac/appkit/providers/db-firebase";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { AppError } from "@mohasinac/appkit/errors";
import { handleApiError } from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES } from "@/constants";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId") ?? "";

    // Strict UUID format validation — prevents any kind of path injection
    if (!UUID_REGEX.test(eventId)) {
      return NextResponse.redirect(
        new URL(`/auth/close?error=invalid_event`, request.nextUrl.origin),
      );
    }

    // Verify the event node exists and is still pending
    const db = getAdminRealtimeDb();
    const snap = await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).get();
    if (!snap.exists() || snap.val()?.status !== "pending") {
      serverLogger.warn("Google OAuth start: event not found or expired", {
        eventId,
      });
      return NextResponse.redirect(
        new URL(`/auth/close?error=event_expired`, request.nextUrl.origin),
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      serverLogger.error("GOOGLE_CLIENT_ID env var not set");
      throw new AppError(
        500,
        ERROR_MESSAGES.GENERIC.SERVER_CONFIG_ERROR,
        "SERVER_CONFIG_ERROR",
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", eventId); // eventId IS the CSRF state token
    googleAuthUrl.searchParams.set("access_type", "online");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    serverLogger.error("GET /api/auth/google/start error", { error });
    return handleApiError(error);
  }
}

