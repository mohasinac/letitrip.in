/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/review.transforms
 * @description This file contains functionality related to review.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * REVIEW TYPE TRANSFORMATIONS
 */

import { Timestamp } from "firebase/firestore";
import {
  ReviewBE,
  CreateReviewRequestBE,
  ReviewStatsResponseBE,
} from "../backend/review.types";
import {
  ReviewFE,
  ReviewFormFE,
  ReviewStatsFE,
} from "../frontend/review.types";

/**
 * Function: Parse Date
 */
/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

/**
 * Function: Format Time Ago
 */
/**
 * Formats time ago
 *
 * @param {Date | null} date - The date
 *
 * @returns {string} The formattimeago result
 */

/**
 * Formats time ago
 *
 * @param {Date | null} date - The date
 *
 * @returns {string} The formattimeago result
 */

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

/**
 * Function: To F E Review
 */
/**
 * Performs to f e review operation
 *
 * @param {ReviewBE} reviewBE - The review b e
 * @param {string} [currentUserId] - currentUser identifier
 *
 * @returns {string} The tofereview result
 *
 * @example
 * toFEReview(reviewBE, "example");
 */

/**
 * Performs to f e review operation
 *
 * @returns {string} The tofereview result
 *
 * @example
 * toFEReview();
 */

export function toFEReview(
  /** Review B E */
  reviewBE: ReviewBE,
  /** Current User Id */
  currentUserId?: string,
): ReviewFE {
  const createdAt = parseDate(reviewBE.createdAt) || new Date();
  const updatedAt = parseDate(reviewBE.updatedAt) || new Date();
  const replyAt = parseDate(reviewBE.replyAt);

  return {
    ...reviewBE,
    replyAt,
    createdAt,
    updatedAt,
    /** Rating Stars */
    ratingStars: Math.round(reviewBE.rating),
    /** Time Ago */
    timeAgo: formatTimeAgo(createdAt),
    /** Has Reply */
    hasReply: !!reviewBE.replyText,
    /** Has Images */
    hasImages: reviewBE.images.length > 0,
    /** Helpfulness Score */
    helpfulnessScore: reviewBE.helpful - reviewBE.notHelpful,
    /** Is Your Review */
    isYourReview: reviewBE.userId === currentUserId,
    // Backwards compatibility
    /** Helpful Count */
    helpfulCount: reviewBE.helpful,
    /** Verified Purchase */
    verifiedPurchase: reviewBE.isVerifiedPurchase,
    /** Media */
    media: reviewBE.images,
  };
}

/**
 * Function: To B E Create Review Request
 */
/**
 * Performs to b e create review request operation
 *
 * @param {ReviewFormFE} formData - The form data
 *
 * @returns {any} The tobecreatereviewrequest result
 *
 * @example
 * toBECreateReviewRequest(formData);
 */

/**
 * Performs to b e create review request operation
 *
 * @param {ReviewFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreatereviewrequest result
 *
 * @example
 * toBECreateReviewRequest(/** Form Data */
  formData);
 */

export function toBECreateReviewRequest(
  /** Form Data */
  formData: ReviewFormFE,
): CreateReviewRequestBE {
  return {
    /** Product Id */
    productId: formData.productId,
    /** Shop Id */
    shopId: formData.shopId,
    /** Rating */
    rating: formData.rating,
    /** Title */
    title: formData.title || undefined,
    /** Comment */
    comment: formData.comment,
    /** Images */
    images: formData.images.length > 0 ? formData.images : undefined,
  };
}

/**
 * Function: To F E Review Stats
 */
/**
 * Performs to f e review stats operation
 *
 * @param {ReviewStatsResponseBE} statsBE - The stats b e
 *
 * @returns {any} The tofereviewstats result
 *
 * @example
 * toFEReviewStats(statsBE);
 */

/**
 * Performs to f e review stats operation
 *
 * @param {ReviewStatsResponseBE} statsBE - The stats b e
 *
 * @returns {any} The tofereviewstats result
 *
 * @example
 * toFEReviewStats(statsBE);
 */

export function toFEReviewStats(statsBE: ReviewStatsResponseBE): ReviewStatsFE {
  const total = statsBE.totalReviews;

  return {
    /** Total Reviews */
    totalReviews: statsBE.totalReviews,
    /** Average Rating */
    averageRating: statsBE.averageRating,
    /** Rating Stars */
    ratingStars: Math.round(statsBE.averageRating),
    /** Rating Display */
    ratingDisplay: `${statsBE.averageRating.toFixed(1)} out of 5`,
    /** Rating Distribution */
    ratingDistribution: {
      5: {
        /** Count */
        count: statsBE.ratingDistribution[5],
        /** Percentage */
        percentage:
          total > 0 ? (statsBE.ratingDistribution[5] / total) * 100 : 0,
      },
      4: {
        /** Count */
        count: statsBE.ratingDistribution[4],
        /** Percentage */
        percentage:
          total > 0 ? (statsBE.ratingDistribution[4] / total) * 100 : 0,
      },
      3: {
        /** Count */
        count: statsBE.ratingDistribution[3],
        /** Percentage */
        percentage:
          total > 0 ? (statsBE.ratingDistribution[3] / total) * 100 : 0,
      },
      2: {
        /** Count */
        count: statsBE.ratingDistribution[2],
        /** Percentage */
        percentage:
          total > 0 ? (statsBE.ratingDistribution[2] / total) * 100 : 0,
      },
      1: {
        /** Count */
        count: statsBE.ratingDistribution[1],
        /** Percentage */
        percentage:
          total > 0 ? (statsBE.ratingDistribution[1] / total) * 100 : 0,
      },
    },
  };
}

/**
 * Function: To F E Reviews
 */
/**
 * Performs to f e reviews operation
 *
 * @param {ReviewBE[] | undefined} reviewsBE - The reviews b e
 * @param {string} [currentUserId] - currentUser identifier
 *
 * @returns {string} The tofereviews result
 *
 * @example
 * toFEReviews(reviewsBE, "example");
 */

/**
 * Performs to f e reviews operation
 *
 * @returns {string} The tofereviews result
 *
 * @example
 * toFEReviews();
 */

export function toFEReviews(
  /** Reviews B E */
  reviewsBE: ReviewBE[] | undefined,
  /** Current User Id */
  currentUserId?: string,
): ReviewFE[] {
  if (!reviewsBE) return [];
  return reviewsBE.map((r) => toFEReview(r, currentUserId));
}
