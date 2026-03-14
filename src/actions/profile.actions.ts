"use server";

/**
 * Profile Server Actions
 *
 * Update the authenticated user's own profile, bypassing the
 * service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import {
  userRepository,
  sessionRepository,
  productRepository,
  reviewRepository,
} from "@/repositories";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import type { UserDocument } from "@/db/schema";

// ─── Validation schema ────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL).optional(),
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

// ─── Server Action ────────────────────────────────────────────────────────────

/**
 * Update the authenticated user's profile.
 * Automatically resets emailVerified / phoneVerified flags when those fields change.
 * Rate-limited by uid (API: 60 req / 60 s).
 */
export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<UserDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `profile:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(
      "Too many requests. Please wait before trying again.",
    );

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? ERROR_MESSAGES.VALIDATION.FAILED,
    );
  }

  return userRepository.updateProfileWithVerificationReset(
    user.uid,
    parsed.data,
  );
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function getMyProfileAction(): Promise<UserDocument | null> {
  const user = await requireAuth();
  return userRepository.findById(user.uid);
}

export async function listMySessionsAction() {
  const user = await requireAuth();
  return sessionRepository.findAllByUser(user.uid);
}

export async function getPublicProfileAction(
  userId: string,
): Promise<Pick<
  UserDocument,
  "id" | "displayName" | "photoURL" | "role" | "createdAt"
> | null> {
  const user = await userRepository.findById(userId);
  if (!user) return null;
  return {
    id: user.id,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function getSellerReviewsAction(sellerId: string) {
  const products = await productRepository.findBySeller(sellerId);
  const published = products.filter((p) => p.status === "published");
  if (published.length === 0) return [];
  const batches = await Promise.all(
    published
      .slice(0, 20)
      .map((p) => reviewRepository.findApprovedByProduct(p.id).catch(() => [])),
  );
  return batches.flat();
}

export async function getSellerProductsAction(sellerId: string) {
  const products = await productRepository.findBySeller(sellerId);
  return products.filter((p) => p.status === "published");
}
