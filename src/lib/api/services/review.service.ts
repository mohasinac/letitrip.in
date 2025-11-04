/**
 * Review Service
 * Handles all review-related API operations
 */

import { apiClient } from "../client";
import type { 
  Review, 
  CreateReviewData, 
  ReviewFilters, 
  ReviewStats, 
  ReviewListResponse 
} from "@/types/shared";

export class ReviewService {
  /**
   * Get reviews with filters
   */
  static async getReviews(filters?: ReviewFilters): Promise<ReviewListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<ReviewListResponse>(
        `/api/reviews?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error("ReviewService.getReviews error:", error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific product
   */
  static async getProductReviews(
    productId: string,
    filters?: Omit<ReviewFilters, 'productId'>
  ): Promise<ReviewListResponse> {
    try {
      return await this.getReviews({ ...filters, productId });
    } catch (error) {
      console.error("ReviewService.getProductReviews error:", error);
      throw error;
    }
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(filters?: Omit<ReviewFilters, 'userId'>): Promise<ReviewListResponse> {
    try {
      const response = await apiClient.get<ReviewListResponse>(
        `/api/user/reviews${filters ? `?${new URLSearchParams(filters as any).toString()}` : ''}`
      );
      
      return response;
    } catch (error) {
      console.error("ReviewService.getUserReviews error:", error);
      throw error;
    }
  }

  /**
   * Create new review
   */
  static async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      const response = await apiClient.post<Review>("/api/reviews", reviewData);
      return response;
    } catch (error) {
      console.error("ReviewService.createReview error:", error);
      throw error;
    }
  }

  /**
   * Update review
   */
  static async updateReview(reviewId: string, updates: Partial<CreateReviewData>): Promise<Review> {
    try {
      const response = await apiClient.put<Review>(
        `/api/reviews/${reviewId}`,
        updates
      );
      return response;
    } catch (error) {
      console.error("ReviewService.updateReview error:", error);
      throw error;
    }
  }

  /**
   * Delete review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/reviews/${reviewId}`);
    } catch (error) {
      console.error("ReviewService.deleteReview error:", error);
      throw error;
    }
  }

  /**
   * Mark review as helpful
   */
  static async markHelpful(reviewId: string): Promise<Review> {
    try {
      const response = await apiClient.post<Review>(
        `/api/reviews/${reviewId}/helpful`
      );
      return response;
    } catch (error) {
      console.error("ReviewService.markHelpful error:", error);
      throw error;
    }
  }

  /**
   * Get review statistics for a product
   */
  static async getReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const response = await apiClient.get<ReviewStats>(
        `/api/reviews/stats?productId=${productId}`
      );
      return response;
    } catch (error) {
      console.error("ReviewService.getReviewStats error:", error);
      throw error;
    }
  }
}

export default ReviewService;
