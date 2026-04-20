"use server";

/**
 * Profile Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import {
  updateUserProfile,
  getUserProfile,
  getUserSessions,
  getPublicUserProfile,
  getSellerReviews,
  getSellerProducts,
} from "@mohasinac/appkit";
import type { UserDocument } from "@mohasinac/appkit";

// --- Validation schema --------------------------------------------------------

const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phoneNumber: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal("")),
  avatarMetadata: z
    .object({
      url: z.string(),
      position: z.object({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
      }),
      zoom: z.number().min(0.1).max(3),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// --- Server Action ------------------------------------------------------------

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<UserDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `profile:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(
      "Too many requests. Please wait before trying again.",
    );

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Validation failed",
    );

  return updateUserProfile(user.uid, parsed.data) as Promise<UserDocument>;
}

// --- Read Actions -------------------------------------------------------------

export async function getMyProfileAction(): Promise<UserDocument | null> {
  const user = await requireAuthUser();
  return getUserProfile(user.uid) as Promise<UserDocument | null>;
}

export async function listMySessionsAction() {
  const user = await requireAuthUser();
  return getUserSessions(user.uid);
}

export async function getPublicProfileAction(
  userId: string,
): Promise<Pick<
  UserDocument,
  "id" | "displayName" | "photoURL" | "role" | "createdAt"
> | null> {
  return getPublicUserProfile(userId) as Promise<Pick<
    UserDocument,
    "id" | "displayName" | "photoURL" | "role" | "createdAt"
  > | null>;
}

export async function getSellerReviewsAction(sellerId: string) {
  return getSellerReviews(sellerId);
}

export async function getSellerProductsAction(sellerId: string) {
  return getSellerProducts(sellerId);
}

