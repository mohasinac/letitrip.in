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

import { z } from "zod";
import { userRepository } from "@mohasinac/appkit/repositories";
import { successResponse } from "@mohasinac/appkit/next";
import { createApiHandler } from "@mohasinac/appkit/http";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";

export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    return successResponse({
      uid: user!.uid,
      email: user!.email,
      emailVerified: user!.emailVerified,
      displayName: user!.displayName,
      photoURL: user!.photoURL,
      phoneNumber: user!.phoneNumber,
      phoneVerified: user!.phoneVerified,
      role: user!.role,
      disabled: user!.disabled,
      avatarMetadata: user!.avatarMetadata,
      publicProfile: user!.publicProfile,
      stats: user!.stats,
      metadata: user!.metadata
        ? {
            lastSignInTime:
              user!.metadata.lastSignInTime instanceof Date
                ? user!.metadata.lastSignInTime.toISOString()
                : ((user!.metadata.lastSignInTime as any)
                    ?.toDate?.()
                    ?.toISOString() ?? user!.metadata.lastSignInTime),
            creationTime: user!.metadata.creationTime,
            loginCount: user!.metadata.loginCount,
          }
        : undefined,
      createdAt: user!.createdAt,
      updatedAt: user!.updatedAt,
    });
  },
});

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

export const PATCH = createApiHandler<(typeof updateProfileSchema)["_output"]>({
  auth: true,
  schema: updateProfileSchema,
  handler: async ({ user, body }) => {
    // Update profile (auto-resets verification flags when email/phone changes)
    const updatedUser = await userRepository.updateProfileWithVerificationReset(
      user!.uid,
      body!,
    );

    return successResponse(
      {
        user: updatedUser,
        verificationReset: {
          emailVerified: body!.email
            ? body!.email !== user!.email
              ? false
              : updatedUser.emailVerified
            : updatedUser.emailVerified,
          phoneVerified: body!.phoneNumber
            ? body!.phoneNumber !== user!.phoneNumber
              ? false
              : updatedUser.phoneVerified
            : updatedUser.phoneVerified,
        },
      },
      SUCCESS_MESSAGES.USER.PROFILE_UPDATED,
    );
  },
});

