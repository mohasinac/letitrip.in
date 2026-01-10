import { RateLimitMiddleware } from "@/app/api/_middleware/rate-limit";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase/config";
import { getSessionToken, verifySession } from "../../lib/session";

async function meHandler(req: NextRequest) {
  try {
    // Get session token from cookie
    const token = getSessionToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session found" },
        { status: 401 },
      );
    }

    // Verify session
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    // Get user data from Firestore
    const userDoc = await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(session.userId)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    return NextResponse.json(
      {
        user: {
          uid: userData?.uid,
          email: userData?.email,
          name: userData?.name,
          role: userData?.role,
          isEmailVerified: userData?.isEmailVerified,
          profile: userData?.profile,
          createdAt: userData?.createdAt,
          lastLogin: userData?.lastLogin,
        },
        session: {
          sessionId: session.sessionId,
          expiresAt: session.exp
            ? new Date(session.exp * 1000).toISOString()
            : null,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        error: "Failed to get user data",
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error.message,
      },
      { status: 500 },
    );
  }
}

// Export with rate limiting (100 requests per minute)
export const GET = RateLimitMiddleware.api(meHandler);
