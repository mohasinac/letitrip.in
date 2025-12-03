import { NextRequest, NextResponse } from "next/server";
import { apiRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { getSessionToken, verifySession } from "../../lib/session";
import { adminDb } from "../../lib/firebase/config";
import { COLLECTIONS } from "@/constants/database";

async function meHandler(req: NextRequest) {
  try {
    // Get session token from cookie
    const token = getSessionToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session found" },
        { status: 401 }
      );
    }

    // Verify session
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session" },
        { status: 401 }
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
      { status: 200 }
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
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!apiRateLimiter.check(identifier)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return meHandler(req);
}
