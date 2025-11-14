import { apiService } from "./api.service";
import { ReviewBE } from "@/types/backend/review.types";
import {
  ReviewFE,
  ReviewFormFE,
  ReviewStatsFE,
} from "@/types/frontend/review.types";
import {
  toFEReview,
  toFEReviews,
  toBECreateReviewRequest,
} from "@/types/transforms/review.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";

interface ModerateReviewData {
  isApproved: boolean;
  moderationNotes?: string;
}

class ReviewsService {
  // List reviews
  async list(
    filters?: Record<string, any>
  ): Promise<PaginatedResponseFE<ReviewFE>> {
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

    const response = await apiService.get<PaginatedResponseBE<ReviewBE>>(
      endpoint
    );
    return {
      data: toFEReviews(response.data),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get review by ID
  async getById(id: string): Promise<ReviewFE> {
    const reviewBE = await apiService.get<ReviewBE>(`/reviews/${id}`);
    return toFEReview(reviewBE);
  }

  // Create review (authenticated users after purchase)
  async create(formData: ReviewFormFE): Promise<ReviewFE> {
    const request = toBECreateReviewRequest(formData);
    const reviewBE = await apiService.post<ReviewBE>("/reviews", request);
    return toFEReview(reviewBE);
  }

  // Update review (author only)
  async update(id: string, formData: Partial<ReviewFormFE>): Promise<ReviewFE> {
    const request = toBECreateReviewRequest(formData as ReviewFormFE);
    const reviewBE = await apiService.patch<ReviewBE>(
      `/reviews/${id}`,
      request
    );
    return toFEReview(reviewBE);
  }

  // Delete review (author/admin)
  async delete(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/reviews/${id}`);
  }

  // Moderate review (shop owner/admin)
  async moderate(id: string, data: ModerateReviewData): Promise<ReviewFE> {
    const reviewBE = await apiService.patch<ReviewBE>(
      `/reviews/${id}/moderate`,
      data
    );
    return toFEReview(reviewBE);
  }

  // Mark review as helpful
  async markHelpful(id: string): Promise<{ helpfulCount: number }> {
    return apiService.post<{ helpfulCount: number }>(
      `/reviews/${id}/helpful`,
      {}
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
    auctionId?: string
  ): Promise<{ canReview: boolean; reason?: string }> {
    const params = new URLSearchParams();
    if (productId) params.append("productId", productId);
    if (auctionId) params.append("auctionId", auctionId);

    const queryString = params.toString();
    const endpoint = `/reviews/can-review?${queryString}`;

    return apiService.get<{ canReview: boolean; reason?: string }>(endpoint);
  }

  // Get featured reviews
  async getFeatured(): Promise<ReviewFE[]> {
    const response = await apiService.get<{ data: ReviewBE[] }>(
      "/reviews?isFeatured=true&isApproved=true&limit=100"
    );
    return toFEReviews(response.data);
  }

  // Get homepage reviews
  async getHomepage(): Promise<ReviewFE[]> {
    const response = await apiService.get<{ data: ReviewBE[] }>(
      "/reviews?isFeatured=true&isApproved=true&verifiedPurchase=true&limit=20"
    );
    return toFEReviews(response.data);
  }
}

export const reviewsService = new ReviewsService();
export type { ModerateReviewData };
