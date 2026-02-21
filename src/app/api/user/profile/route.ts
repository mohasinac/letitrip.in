/**
 * GET /api/user/profile
 * Fetch the currently authenticated user's profile
 *
 * PATCH /api/user/profile
 * Update the currently authenticated user's profile
 *
 * This endpoint uses Firebase Admin SDK (server-side) to fetch/update user data,
 * maintaining the API-only architecture and avoiding client-side Firestore access.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { userRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getRequiredSessionCookie } from "@/lib/api/request-helpers";
import { serverLogger } from "@/lib/server-logger";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify session cookie
    const sessionCookie = getRequiredSessionCookie(request);

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
    return successResponse({
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
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal("")),
  avatarMetadata: z
    .object({
      url: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      zoom: z.number(),
    })
    .optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    // 1. Verify session
    const sessionCookie = getRequiredSessionCookie(request);
    const decodedToken = await verifySessionCookie(sessionCookie);

    if (!decodedToken) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    // 2. Validate body
    const rawBody = await request.json();
    const validation = updateProfileSchema.safeParse(rawBody);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const body = validation.data;

    // 3. Update profile (auto-resets verification flags when email/phone changes)
    const updatedUser = await userRepository.updateProfileWithVerificationReset(
      decodedToken.uid,
      body,
    );

    return successResponse(
      {
        user: updatedUser,
        verificationReset: {
          emailVerified: body.email
            ? body.email !== decodedToken.email
              ? false
              : updatedUser.emailVerified
            : updatedUser.emailVerified,
          phoneVerified: body.phoneNumber
            ? body.phoneNumber !== decodedToken.phone_number
              ? false
              : updatedUser.phoneVerified
            : updatedUser.phoneVerified,
        },
      },
      SUCCESS_MESSAGES.USER.PROFILE_UPDATED,
    );
  } catch (error: unknown) {
    serverLogger.error(ERROR_MESSAGES.API.PROFILE_UPDATE_ERROR, { error });
    return handleApiError(error);
  }
}
