/**
 * FRONTEND REVIEW TYPES
 */

export interface ReviewFE {
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
  replyAt: Date | null;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;

  // Computed
  ratingStars: number;
  timeAgo: string;
  hasReply: boolean;
  hasImages: boolean;
  helpfulnessScore: number;
  isYourReview: boolean;

  // Backwards compatibility aliases
  helpfulCount?: number; // Alias for helpful
  verifiedPurchase?: boolean; // Alias for isVerifiedPurchase
  media?: string[]; // Alias for images
}

export interface ReviewCardFE {
  id: string;
  userName: string;
  rating: number;
  ratingStars: number;
  comment: string;
  isVerifiedPurchase: boolean;
  timeAgo: string;
  helpful: number;
}

export interface ReviewFormFE {
  productId?: string;
  shopId?: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
}

export interface ReviewStatsFE {
  totalReviews: number;
  averageRating: number;
  ratingStars: number;
  ratingDisplay: string;
  ratingDistribution: {
    5: { count: number; percentage: number };
    4: { count: number; percentage: number };
    3: { count: number; percentage: number };
    2: { count: number; percentage: number };
    1: { count: number; percentage: number };
  };
}

export interface ReviewFiltersFE {
  productId?: string;
  shopId?: string;
  userId?: string;
  rating?: number;
  isVerifiedPurchase?: boolean;
  status?: "pending" | "approved" | "rejected";
  sortBy?: "recent" | "helpful" | "rating-high" | "rating-low";
  page?: number;
  limit?: number;
}
