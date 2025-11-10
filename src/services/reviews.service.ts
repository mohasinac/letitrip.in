import { apiService } from "./api.service";
import type { Review, PaginatedResponse } from "@/types";

interface ReviewFilters {
  productId?: string;
  shopId?: string;
  auctionId?: string;
  categoryId?: string;
  userId?: string;
  rating?: number;
  minRating?: number;
  verifiedPurchase?: boolean;
  isApproved?: boolean;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "rating" | "helpfulCount";
  sortOrder?: "asc" | "desc";
}

interface CreateReviewData {
  productId?: string;
  shopId?: string;
  auctionId?: string;
  orderItemId?: string;
  rating: number;
  title?: string;
  comment: string;
  media?: string[];
}

interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  media?: string[];
}

interface ModerateReviewData {
  isApproved: boolean;
  moderationNotes?: string;
}

class ReviewsService {
  // List reviews
  async list(filters?: ReviewFilters): Promise<PaginatedResponse<Review>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/reviews?${queryString}` : "/reviews";

    return apiService.get<PaginatedResponse<Review>>(endpoint);
  }

  // Get review by ID
  async getById(id: string): Promise<Review> {
    return apiService.get<Review>(`/reviews/${id}`);
  }

  // Create review (authenticated users after purchase)
  async create(data: CreateReviewData): Promise<Review> {
    return apiService.post<Review>("/reviews", data);
  }

  // Update review (author only)
  async update(id: string, data: UpdateReviewData): Promise<Review> {
    return apiService.patch<Review>(`/reviews/${id}`, data);
  }

  // Delete review (author/admin)
  async delete(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/reviews/${id}`);
  }

  // Moderate review (shop owner/admin)
  async moderate(id: string, data: ModerateReviewData): Promise<Review> {
    return apiService.patch<Review>(`/reviews/${id}/moderate`, data);
  }

  // Mark review as helpful
  async markHelpful(id: string): Promise<{ helpfulCount: number }> {
    return apiService.post<{ helpfulCount: number }>(
      `/reviews/${id}/helpful`,
      {},
    );
  }

  // Upload media for review
  async uploadMedia(files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/reviews/media", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload media");
    }

    return response.json();
  }

  // Get review summary for a product/shop
  async getSummary(filters: {
    productId?: string;
    shopId?: string;
    auctionId?: string;
  }): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
    verifiedPurchasePercentage: number;
  }> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/reviews/summary?${queryString}`
      : "/reviews/summary";

    return apiService.get<any>(endpoint);
  }

  // Check if user can review
  async canReview(
    productId?: string,
    auctionId?: string,
  ): Promise<{ canReview: boolean; reason?: string }> {
    const params = new URLSearchParams();
    if (productId) params.append("productId", productId);
    if (auctionId) params.append("auctionId", auctionId);

    const queryString = params.toString();
    const endpoint = `/reviews/can-review?${queryString}`;

    return apiService.get<{ canReview: boolean; reason?: string }>(endpoint);
  }

  // Get featured reviews
  async getFeatured(): Promise<Review[]> {
    const res = await apiService.get<any>(
      "/reviews?isFeatured=true&isApproved=true&limit=100",
    );
    return res.data || res.reviews || res;
  }

  // Get homepage reviews
  async getHomepage(): Promise<Review[]> {
    const res = await apiService.get<any>(
      "/reviews?isFeatured=true&isApproved=true&verifiedPurchase=true&limit=20",
    );
    return res.data || res.reviews || res;
  }
}

export const reviewsService = new ReviewsService();
export type {
  ReviewFilters,
  CreateReviewData,
  UpdateReviewData,
  ModerateReviewData,
};
