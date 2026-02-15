/**
 * GET /api/user/profile
 * Fetch the currently authenticated user's profile
 *
 * This endpoint uses Firebase Admin SDK (server-side) to fetch user data,
 * maintaining the API-only architecture and avoiding client-side Firestore access.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { userRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify session cookie
    const sessionCookie = request.cookies.get("__session")?.value;

    if (!sessionCookie) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const decodedToken = await verifySessionCookie(sessionCookie);

    if (!decodedToken) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    // 2. Fetch user profile from Firestore using Admin SDK
    const user = await userRepository.findById(decodedToken.uid);

    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.DATABASE.NOT_FOUND);
    }

    // 3. Return user profile (excluding sensitive data like passwordHash)
    return NextResponse.json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        role: user.role,
        disabled: user.disabled,
        avatarMetadata: user.avatarMetadata,
        publicProfile: user.publicProfile,
        stats: user.stats,
        metadata: user.metadata
          ? {
              lastSignInTime:
                user.metadata.lastSignInTime instanceof Date
                  ? user.metadata.lastSignInTime.toISOString()
                  : ((user.metadata.lastSignInTime as any)
                      ?.toDate?.()
                      ?.toISOString() ?? user.metadata.lastSignInTime),
              creationTime: user.metadata.creationTime,
              loginCount: user.metadata.loginCount,
            }
          : undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
