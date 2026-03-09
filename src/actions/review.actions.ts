"use server";

/**
 * Review Server Actions
 *
 * Create, update, delete, and vote on reviews — directly calls the
 * repository, bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { reviewRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";
import type { ReviewDocument } from "@/db/schema";

// ─── Validation schemas ────────────────────────────────────────────────────

const createReviewSchema = z.object({
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  sellerId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  userAvatar: z.string().optional().default(""),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(10).max(2000),
  images: z.array(z.string()).optional().default([]),
  verified: z.boolean().optional().default(false),
  status: z
    .enum(["pending", "approved", "rejected"])
    .optional()
    .default("pending"),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(200).optional(),
  comment: z.string().min(10).max(2000).optional(),
  images: z.array(z.string()).optional(),
});

// ─── Server Actions ────────────────────────────────────────────────────────

/**
 * Submit a new review for a product.
 */
export async function createReviewAction(
  input: z.infer<typeof createReviewSchema>,
): Promise<ReviewDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `reviews:create:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  // Enforce the caller's uid matches the review userId
  if (input.userId !== user.uid) {
    throw new AuthorizationError("Cannot submit review as another user");
  }

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  serverLogger.debug("createReviewAction", {
    uid: user.uid,
    productId: parsed.data.productId,
  });
  return reviewRepository.create(parsed.data);
}

/**
 * Update an existing review. Only the review owner can update.
 */
export async function updateReviewAction(
  reviewId: string,
  input: z.infer<typeof updateReviewSchema>,
): Promise<ReviewDocument | null> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `reviews:update:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  const parsed = updateReviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  // Verify ownership
  const existing = await reviewRepository.findById(reviewId);
  if (!existing) throw new ValidationError("Review not found");
  if (existing.userId !== user.uid) {
    throw new AuthorizationError("Not authorized to update this review");
  }

  return reviewRepository.update(reviewId, parsed.data);
}

/**
 * Delete a review. Only the review owner can delete.
 */
export async function deleteReviewAction(reviewId: string): Promise<void> {
  const user = await requireAuth();

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  const existing = await reviewRepository.findById(reviewId);
  if (!existing) return; // Idempotent
  if (existing.userId !== user.uid) {
    throw new AuthorizationError("Not authorized to delete this review");
  }

  await reviewRepository.delete(reviewId);
}

/**
 * Vote a review as helpful or not helpful.
 */
export async function voteReviewHelpfulAction(
  reviewId: string,
  helpful: boolean,
): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `reviews:vote:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  // Only helpful votes increment the helpfulCount — not-helpful votes are no-ops
  // (no separate "not helpful" counter in the schema).
  if (helpful) {
    await reviewRepository.incrementHelpful(reviewId);
  }
}
