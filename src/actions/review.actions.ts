"use server";

/**
 * Review Server Actions
 *
 * Create, update, delete, and vote on reviews — directly calls the
 * repository, bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import {
  reviewRepository,
  productRepository,
  userRepository,
} from "@/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import type { ReviewDocument } from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@mohasinac/appkit/providers/db-firebase";
import { maskPublicReview } from "@mohasinac/appkit/security";
import { mediaUrlSchema } from "@/lib/validation/schemas";
import { finalizeStagedMediaArray, finalizeStagedMediaUrl } from "@mohasinac/appkit/features/media";

// ─── Validation schemas ────────────────────────────────────────────────────

/**
 * Minimal form input — server action resolves productTitle, sellerId, and
 * user identity internally via repository lookups.
 */
const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(10).max(2000),
  images: z.array(mediaUrlSchema).max(5).optional().default([]),
  videoUrl: mediaUrlSchema.optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(200).optional(),
  comment: z.string().min(10).max(2000).optional(),
  images: z.array(mediaUrlSchema).max(5).optional(),
  videoUrl: mediaUrlSchema.optional().nullable(),
});

// ─── Server Actions ────────────────────────────────────────────────────────

/**
 * Submit a new review for a product.
 *
 * Accepts only the form fields (productId, rating, title, comment, images).
 * Product title/sellerId are resolved from the product repository; user
 * identity comes from the authenticated session.
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

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  const product = await productRepository.findById(parsed.data.productId);
  if (!product) throw new NotFoundError("Product not found");

  const profile = await userRepository.findById(user.uid);

  // Finalize any staged tmp media URLs before persisting
  const images = await finalizeStagedMediaArray(parsed.data.images);
  const finalVideoUrl = parsed.data.videoUrl
    ? await finalizeStagedMediaUrl(parsed.data.videoUrl)
    : undefined;

  serverLogger.debug("createReviewAction", {
    uid: user.uid,
    productId: parsed.data.productId,
  });

  return reviewRepository.create({
    productId: parsed.data.productId,
    productTitle: product.title,
    sellerId: product.sellerId,
    userId: user.uid,
    userName: profile?.displayName ?? "Anonymous",
    userAvatar: profile?.photoURL ?? "",
    rating: parsed.data.rating,
    title: parsed.data.title,
    comment: parsed.data.comment,
    images,
    video: finalVideoUrl
      ? {
          url: finalVideoUrl,
          thumbnailUrl: finalVideoUrl,
          duration: 0,
        }
      : undefined,
    verified: false,
    status: "pending",
  });
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
  if (!existing) throw new NotFoundError("Review not found");
  if (existing.userId !== user.uid) {
    throw new AuthorizationError("Not authorized to update this review");
  }

  // Finalize any staged tmp media URLs before persisting
  const { videoUrl, images: rawImages, ...rest } = parsed.data;
  let updatePayload: Record<string, unknown> = { ...rest };

  if (rawImages !== undefined) {
    updatePayload.images = await finalizeStagedMediaArray(rawImages);
  }
  if (videoUrl !== undefined) {
    updatePayload.video = videoUrl
      ? { url: await finalizeStagedMediaUrl(videoUrl) }
      : null;
  }

  return reviewRepository.update(reviewId, updatePayload as Partial<ReviewDocument>);
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

// ─── Admin Actions ─────────────────────────────────────────────────────────

const adminUpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(200).optional(),
  comment: z.string().min(10).max(2000).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  images: z.array(mediaUrlSchema).max(5).optional(),
  videoUrl: mediaUrlSchema.optional().nullable(),
});

/**
 * Update any review (admin/moderator only). No ownership check.
 */
export async function adminUpdateReviewAction(
  reviewId: string,
  input: z.infer<typeof adminUpdateReviewSchema>,
): Promise<ReviewDocument | null> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `admin:reviews:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  const parsed = adminUpdateReviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  const existing = await reviewRepository.findById(reviewId);
  if (!existing) throw new NotFoundError("Review not found");

  serverLogger.info("adminUpdateReviewAction", {
    adminId: admin.uid,
    reviewId,
  });
  const { videoUrl, images: rawImages, ...rest } = parsed.data;
  const updatePayload: Record<string, unknown> = { ...rest };

  if (rawImages !== undefined) {
    updatePayload.images = await finalizeStagedMediaArray(rawImages);
  }

  if (videoUrl !== undefined) {
    updatePayload.video = videoUrl
      ? { url: await finalizeStagedMediaUrl(videoUrl) }
      : null;
  }

  return reviewRepository.update(reviewId, updatePayload as Partial<ReviewDocument>);
}

/**
 * Delete any review (admin/moderator only). No ownership check.
 */
export async function adminDeleteReviewAction(reviewId: string): Promise<void> {
  const admin = await requireRole(["admin", "moderator"]);

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  const existing = await reviewRepository.findById(reviewId);
  if (!existing) return; // Idempotent

  serverLogger.info("adminDeleteReviewAction", {
    adminId: admin.uid,
    reviewId,
  });
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

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listReviewsByProductAction(
  productId: string,
  page = 1,
  pageSize = 10,
): Promise<FirebaseSieveResult<ReviewDocument>> {
  const result = await reviewRepository.listForProduct(productId, {
    sorts: "-createdAt",
    page,
    pageSize,
  });
  return { ...result, items: result.items.map(maskPublicReview) };
}

export async function listAdminReviewsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<ReviewDocument>> {
  const sieve: SieveModel = {
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  };
  return reviewRepository.listAll(sieve);
}

export async function listReviewsBySellerAction(
  sellerId: string,
): Promise<ReviewDocument[]> {
  // Get all published products for this seller, then fetch approved reviews
  const products = await productRepository.findBySeller(sellerId);
  const productIds = products
    .filter((p) => p.status === "published")
    .map((p) => p.id);
  if (productIds.length === 0) return [];
  const reviewBatches = await Promise.all(
    productIds
      .slice(0, 20)
      .map((id) => reviewRepository.findApprovedByProduct(id).catch(() => [])),
  );
  return reviewBatches.flat().map(maskPublicReview);
}

export async function getHomepageReviewsAction(): Promise<ReviewDocument[]> {
  const reviews = await reviewRepository.findFeatured(18);
  return reviews.map(maskPublicReview);
}

export async function getReviewByIdAction(
  id: string,
): Promise<ReviewDocument | null> {
  return reviewRepository.findById(id);
}

