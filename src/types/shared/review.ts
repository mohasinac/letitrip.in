/**
 * Review Types
 * Shared between UI and Backend
 */

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpful: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface ReviewFilters {
  productId?: string;
  rating?: number;
  status?: Review['status'];
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewListResponse {
  reviews: Review[];
  stats?: ReviewStats;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
