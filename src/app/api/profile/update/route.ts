/**
 * API Route: Update User Profile
 * PATCH /api/profile/update
 *
 * Updates user profile information including displayName, email, phoneNumber, photoURL.
 * Automatically resets verification flags when email or phone number changes.
 */

import { NextRequest } from "next/server";
import {
  createApiHandler,
  successResponse,
  errorResponse,
} from "@/lib/api/api-handler";
import { userRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { z } from "zod";

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

export const PATCH = createApiHandler({
  auth: true,
  schema: updateProfileSchema,
  handler: async ({ body, user }) => {
    if (!user) {
      return errorResponse(ERROR_MESSAGES.USER.NOT_AUTHENTICATED, 401);
    }

    try {
      // Update profile with automatic verification reset
      const updatedUser =
        await userRepository.updateProfileWithVerificationReset(
          user.uid,
          body!,
        );

      return successResponse(
        {
          user: updatedUser,
          verificationReset: {
            emailVerified: body!.email
              ? body!.email !== user.email
                ? false
                : updatedUser.emailVerified
              : updatedUser.emailVerified,
            phoneVerified: body!.phoneNumber
              ? body!.phoneNumber !== user.phoneNumber
                ? false
                : updatedUser.phoneVerified
              : updatedUser.phoneVerified,
          },
        },
        SUCCESS_MESSAGES.USER.PROFILE_UPDATED,
      );
    } catch (error) {
      console.error(ERROR_MESSAGES.API.PROFILE_UPDATE_ERROR, error);
      return errorResponse(
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
        500,
      );
    }
  },
});
