import { RateLimitMiddleware } from "@/app/api/_middleware/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSession,
  getSessionToken,
  verifySession,
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

// Export with rate limiting (100 requests per minute)
export const POST = RateLimitMiddleware.api(logoutHandler);
