/**
 * BACKEND REVIEW TYPES
 */

import { Timestamp } from "firebase/firestore";

export interface ReviewBE {
  id: string;
  productId: string | null;
  productSlug: string | null;
  shopId: string | null;
  shopSlug: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  replyText: string | null;
  replyAt: Timestamp | null;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReviewListItemBE {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: Timestamp;
}

export interface CreateReviewRequestBE {
  productId?: string;
  shopId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewRequestBE {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewReplyRequestBE {
  replyText: string;
}

export interface ReviewStatsResponseBE {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
