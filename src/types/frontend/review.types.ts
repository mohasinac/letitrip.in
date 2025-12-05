/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/review.types
 * @description This file contains TypeScript type definitions for review
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * FRONTEND REVIEW TYPES
 */

/**
 * Review F E interface
 * @interface ReviewFE
 */
export interface ReviewFE {
  /** Id */
  id: string;
  /** Product Id */
  productId: string | null;
  /** Product Slug */
  productSlug: string | null;
  /** Shop Id */
  shopId: string | null;
  /** Shop Slug */
  shopSlug: string | null;
  /** User Id */
  userId: string;
  /** User Name */
  userName: string;
  /** User Email */
  userEmail: string;
  /** Rating */
  rating: number;
  /** Title */
  title: string | null;
  /** Comment */
  comment: string;
  /** Images */
  images: string[];
  /** Is Verified Purchase */
  isVerifiedPurchase: boolean;
  /** Helpful */
  helpful: number;
  /** Not Helpful */
  notHelpful: number;
  /** Reply Text */
  replyText: string | null;
  /** Reply At */
  replyAt: Date | null;
  /** Status */
  status: "pending" | "approved" | "rejected";
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // Computed
  /** Rating Stars */
  ratingStars: number;
  /** Time Ago */
  timeAgo: string;
  /** Has Reply */
  hasReply: boolean;
  /** Has Images */
  hasImages: boolean;
  /** Helpfulness Score */
  helpfulnessScore: number;
  /** Is Your Review */
  isYourReview: boolean;

  // Backwards compatibility aliases
  /** HelpfulCount */
  helpfulCount?: number; // Alias for helpful
  /** VerifiedPurchase */
  verifiedPurchase?: boolean; // Alias for isVerifiedPurchase
  /** Media */
  media?: string[]; // Alias for images
}

/**
 * ReviewCardFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewCardFE
 */
export interface ReviewCardFE {
  /** Id */
  id: string;
  /** User Name */
  userName: string;
  /** Rating */
  rating: number;
  /** Rating Stars */
  ratingStars: number;
  /** Comment */
  comment: string;
  /** Is Verified Purchase */
  isVerifiedPurchase: boolean;
  /** Time Ago */
  timeAgo: string;
  /** Helpful */
  helpful: number;
}

/**
 * ReviewFormFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewFormFE
 */
export interface ReviewFormFE {
  /** Product Id */
  productId?: string;
  /** Shop Id */
  shopId?: string;
  /** Rating */
  rating: number;
  /** Title */
  title: string;
  /** Comment */
  comment: string;
  /** Images */
  images: string[];
}

/**
 * ReviewStatsFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewStatsFE
 */
export interface ReviewStatsFE {
  /** Total Reviews */
  totalReviews: number;
  /** Average Rating */
  averageRating: number;
  /** Rating Stars */
  ratingStars: number;
  /** Rating Display */
  ratingDisplay: string;
  /** Rating Distribution */
  ratingDistribution: {
    /** 5 */
    5: { count: number; percentage: number };
    /** 4 */
    4: { count: number; percentage: number };
    /** 3 */
    3: { count: number; percentage: number };
    /** 2 */
    2: { count: number; percentage: number };
    /** 1 */
    1: { count: number; percentage: number };
  };
}

/**
 * ReviewFiltersFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewFiltersFE
 */
export interface ReviewFiltersFE {
  /** Product Id */
  productId?: string;
  /** Shop Id */
  shopId?: string;
  /** User Id */
  userId?: string;
  /** Rating */
  rating?: number;
  /** Is Verified Purchase */
  isVerifiedPurchase?: boolean;
  /** Status */
  status?: "pending" | "approved" | "rejected";
  /** Sort By */
  sortBy?: "recent" | "helpful" | "rating-high" | "rating-low";
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
}
