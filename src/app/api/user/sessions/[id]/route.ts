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
import { userRepository } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { createApiHandler } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";

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
              (user!.metadata as any).lastSignInTime instanceof Date
                ? (user!.metadata as any).lastSignInTime.toISOString()
                : ((user!.metadata as any).lastSignInTime as any)
                    ?.toDate?.()
                    ?.toISOString() ?? (user!.metadata as any).lastSignInTime,
            creationTime: (user!.metadata as any).creationTime,
            loginCount: (user!.metadata as any).loginCount,
          }
        : undefined,
      createdAt: user!.createdAt,
      updatedAt: user!.updatedAt,
    });
  },
});

// â”€â”€â”€ Update Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
