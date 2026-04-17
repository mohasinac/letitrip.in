"use server";

/**
 * Review Server Actions
 *
 * Create, update, delete, and vote on reviews — directly calls the
 * repository, bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuthUser, requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  createReview as createReviewDomain,
  updateReview as updateReviewDomain,
  deleteReview as deleteReviewDomain,
  adminUpdateReview as adminUpdateReviewDomain,
  adminDeleteReview as adminDeleteReviewDomain,
  voteReviewHelpful as voteReviewHelpfulDomain,
  listReviewsByProduct as listReviewsByProductDomain,
  listAdminReviews as listAdminReviewsDomain,
  listReviewsBySeller as listReviewsBySellerDomain,
  getHomepageReviews as getHomepageReviewsDomain,
  getReviewById as getReviewByIdDomain,
} from "@mohasinac/appkit/features/reviews/server";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import type { ReviewDocument } from "@/db/schema/reviews";
import type { FirebaseSieveResult, SieveModel } from "@mohasinac/appkit/providers/db-firebase";
import { mediaUrlSchema } from "@/lib/validation/schemas";

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
  const user = await requireAuthUser();

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

  return createReviewDomain(user.uid, parsed.data) as Promise<ReviewDocument>;
}

/**
 * Update an existing review. Only the review owner can update.
 */
export async function updateReviewAction(
  reviewId: string,
  input: z.infer<typeof updateReviewSchema>,
): Promise<ReviewDocument | null> {
  const user = await requireAuthUser();

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

  return updateReviewDomain(user.uid, reviewId, parsed.data) as Promise<ReviewDocument | null>;
}

/**
 * Delete a review. Only the review owner can delete.
 */
export async function deleteReviewAction(reviewId: string): Promise<void> {
  const user = await requireAuthUser();

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  await deleteReviewDomain(user.uid, reviewId);
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
  const admin = await requireRoleUser(["admin", "moderator"]);

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

  return adminUpdateReviewDomain(admin.uid, reviewId, parsed.data) as Promise<ReviewDocument | null>;
}

/**
 * Delete any review (admin/moderator only). No ownership check.
 */
export async function adminDeleteReviewAction(reviewId: string): Promise<void> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  await adminDeleteReviewDomain(admin.uid, reviewId);
}

/**
 * Vote a review as helpful or not helpful.
 */
export async function voteReviewHelpfulAction(
  reviewId: string,
  helpful: boolean,
): Promise<void> {
  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `reviews:vote:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!reviewId || typeof reviewId !== "string") {
    throw new ValidationError("reviewId is required");
  }

  await voteReviewHelpfulDomain(reviewId, helpful);
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listReviewsByProductAction(
  productId: string,
  page = 1,
  pageSize = 10,
): Promise<FirebaseSieveResult<ReviewDocument>> {
  return listReviewsByProductDomain(productId, page, pageSize) as Promise<FirebaseSieveResult<ReviewDocument>>;
}

export async function listAdminReviewsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<ReviewDocument>> {
  await requireRoleUser(["admin", "moderator"]);
  const sieve: SieveModel = {
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  };
  return listAdminReviewsDomain(sieve) as Promise<FirebaseSieveResult<ReviewDocument>>;
}

export async function listReviewsBySellerAction(
  sellerId: string,
): Promise<ReviewDocument[]> {
  return listReviewsBySellerDomain(sellerId) as Promise<ReviewDocument[]>;
}

export async function getHomepageReviewsAction(): Promise<ReviewDocument[]> {
  return getHomepageReviewsDomain() as Promise<ReviewDocument[]>;
}

export async function getReviewByIdAction(
  id: string,
): Promise<ReviewDocument | null> {
  return getReviewByIdDomain(id) as Promise<ReviewDocument | null>;
}

