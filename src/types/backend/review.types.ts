/**
 * @fileoverview Type Definitions
 * @module src/types/backend/review.types
 * @description This file contains TypeScript type definitions for review
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * BACKEND REVIEW TYPES
 */

import { Timestamp } from "firebase/firestore";

/**
 * ReviewBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewBE
 */
export interface ReviewBE {
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
  replyAt: Timestamp | null;
  /** Status */
  status: "pending" | "approved" | "rejected";
  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
}

/**
 * ReviewListItemBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewListItemBE
 */
export interface ReviewListItemBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** User Name */
  userName: string;
  /** Rating */
  rating: number;
  /** Comment */
  comment: string;
  /** Is Verified Purchase */
  isVerifiedPurchase: boolean;
  /** Helpful */
  helpful: number;
  /** Created At */
  createdAt: Timestamp;
}

/**
 * CreateReviewRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateReviewRequestBE
 */
export interface CreateReviewRequestBE {
  /** Product Id */
  productId?: string;
  /** Shop Id */
  shopId?: string;
  /** Rating */
  rating: number;
  /** Title */
  title?: string;
  /** Comment */
  comment: string;
  /** Images */
  images?: string[];
}

/**
 * UpdateReviewRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for UpdateReviewRequestBE
 */
export interface UpdateReviewRequestBE {
  /** Rating */
  rating?: number;
  /** Title */
  title?: string;
  /** Comment */
  comment?: string;
  /** Images */
  images?: string[];
}

/**
 * ReviewReplyRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewReplyRequestBE
 */
export interface ReviewReplyRequestBE {
  /** Reply Text */
  replyText: string;
}

/**
 * ReviewStatsResponseBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ReviewStatsResponseBE
 */
export interface ReviewStatsResponseBE {
  /** Total Reviews */
  totalReviews: number;
  /** Average Rating */
  averageRating: number;
  /** Rating Distribution */
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
