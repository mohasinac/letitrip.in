import { NextRequest, NextResponse } from "next/server";
import { withRedisRateLimit, RATE_LIMITS } from "../../lib/rate-limiter-redis";
import {
  getSessionToken,
  verifySession,
  deleteSession,
  clearSessionCookie,
} from "../../lib/session";

async function logoutHandler(req: NextRequest) {
  try {
    // Get session token from cookie
    const token = getSessionToken(req);

    if (token) {
      // Verify and get session data
      const session = await verifySession(token);

      if (session) {
        // Delete session from Firestore
        await deleteSession(session.sessionId);
      }
    }

    // Create response
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 },
    );

    // Clear session cookie
    clearSessionCookie(response);

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);

    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      {
        message: "Logout completed",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      },
      { status: 200 },
    );

    clearSessionCookie(response);

    return response;
  }
}

export async function POST(req: NextRequest) {
  return withRedisRateLimit(req, logoutHandler, RATE_LIMITS.API);
}
