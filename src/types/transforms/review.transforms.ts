/**
 * REVIEW TYPE TRANSFORMATIONS
 */

import { Timestamp } from "firebase/firestore";
import {
  CreateReviewRequestBE,
  ReviewBE,
  ReviewStatsResponseBE,
} from "../backend/review.types";
import {
  ReviewFE,
  ReviewFormFE,
  ReviewStatsFE,
} from "../frontend/review.types";

function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function toFEReview(
  reviewBE: ReviewBE,
  currentUserId?: string
): ReviewFE {
  const createdAt = parseDate(reviewBE.createdAt) || new Date();
  const updatedAt = parseDate(reviewBE.updatedAt) || new Date();
  const replyAt = parseDate(reviewBE.replyAt);

  return {
    ...reviewBE,
    replyAt,
    createdAt,
    updatedAt,
    ratingStars: Math.round(reviewBE.rating),
    timeAgo: formatTimeAgo(createdAt),
    hasReply: !!reviewBE.replyText,
    hasImages: (reviewBE.images || []).length > 0,
    helpfulnessScore: reviewBE.helpful - reviewBE.notHelpful,
    isYourReview: reviewBE.userId === currentUserId,
    // Backwards compatibility
    helpfulCount: reviewBE.helpful,
    verifiedPurchase: reviewBE.isVerifiedPurchase,
    media: reviewBE.images,
  };
}

export function toBECreateReviewRequest(
  formData: ReviewFormFE
): CreateReviewRequestBE {
  return {
    productId: formData.productId,
    shopId: formData.shopId,
    rating: formData.rating,
    title: formData.title || undefined,
    comment: formData.comment,
    images:
      formData.images && formData.images.length > 0
        ? formData.images
        : undefined,
  };
}

export function toFEReviewStats(statsBE: ReviewStatsResponseBE): ReviewStatsFE {
  const total = statsBE.totalReviews;

  return {
    totalReviews: statsBE.totalReviews,
    averageRating: statsBE.averageRating,
    ratingStars: Math.round(statsBE.averageRating),
    ratingDisplay: `${statsBE.averageRating.toFixed(1)} out of 5`,
    ratingDistribution: {
      5: {
        count: statsBE.ratingDistribution[5],
        percentage:
          total > 0 ? (statsBE.ratingDistribution[5] / total) * 100 : 0,
      },
      4: {
        count: statsBE.ratingDistribution[4],
        percentage:
          total > 0 ? (statsBE.ratingDistribution[4] / total) * 100 : 0,
      },
      3: {
        count: statsBE.ratingDistribution[3],
        percentage:
          total > 0 ? (statsBE.ratingDistribution[3] / total) * 100 : 0,
      },
      2: {
        count: statsBE.ratingDistribution[2],
        percentage:
          total > 0 ? (statsBE.ratingDistribution[2] / total) * 100 : 0,
      },
      1: {
        count: statsBE.ratingDistribution[1],
        percentage:
          total > 0 ? (statsBE.ratingDistribution[1] / total) * 100 : 0,
      },
    },
  };
}

export function toFEReviews(
  reviewsBE: ReviewBE[] | undefined,
  currentUserId?: string
): ReviewFE[] {
  if (!reviewsBE) return [];
  return reviewsBE.map((r) => toFEReview(r, currentUserId));
}
