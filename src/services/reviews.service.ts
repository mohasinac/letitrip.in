import { REVIEW_ROUTES } from "@/constants/api-routes";
import { ReviewBE } from "@/types/backend/review.types";
import { ReviewFE, ReviewFormFE } from "@/types/frontend/review.types";
import type { PaginatedResponseFE } from "@/types/shared/common.types";
import {
  toBECreateReviewRequest,
  toFEReview,
  toFEReviews,
} from "@/types/transforms/review.transforms";
import { apiService } from "./api.service";
import { BaseService } from "./base-service";

interface ModerateReviewData {
  isApproved: boolean;
  moderationNotes?: string;
}

/**
 * Reviews Service - Extends BaseService
 *
 * Provides review management with BaseService CRUD operations
 * plus review-specific methods for moderation and filtering.
 */
class ReviewsService extends BaseService<
  ReviewFE,
  ReviewBE,
  ReviewFormFE,
  Partial<ReviewFormFE>
> {
  constructor() {
    super({
      resourceName: "review",
      baseRoute: REVIEW_ROUTES.LIST,
      toFE: toFEReview,
      toBECreate: toBECreateReviewRequest,
      toBEUpdate: (data) => toBECreateReviewRequest(data as ReviewFormFE),
    });
  }

  /**
   * Override list to support custom query string building
   */
  async list(
    filters?: Record<string, any>
  ): Promise<PaginatedResponseFE<ReviewFE>> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `${REVIEW_ROUTES.LIST}?${queryString}`
        : REVIEW_ROUTES.LIST;

      const response: any = await apiService.get(endpoint);
      return {
        data: toFEReviews(response.data || response.reviews || []),
        count: response.count || 0,
        pagination: response.pagination,
      };
    } catch (error) {
      return BaseService.handleError(error, "list reviews");
    }
  }

  // Note: getById, create, update, delete are inherited from BaseService

  /**
   * Moderate review (shop owner/admin)
   * Approve or reject reviews with optional moderation notes
   */
  async moderate(id: string, data: ModerateReviewData): Promise<ReviewFE> {
    try {
      const response: any = await apiService.patch(
        `${REVIEW_ROUTES.BY_ID(id)}/moderate`,
        data
      );
      return toFEReview(response.data);
    } catch (error) {
      return BaseService.handleError(error, "moderate review");
    }
  }

  // Mark review as helpful
  async markHelpful(id: string): Promise<{ helpfulCount: number }> {
    try {
      return await apiService.post<{ helpfulCount: number }>(
        REVIEW_ROUTES.HELPFUL(id),
        {}
      );
    } catch (error) {
      return BaseService.handleError(error, "mark review as helpful");
    }
  }

  // Upload media for review
  async uploadMedia(files: File[]): Promise<{ urls: string[] }> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      return await apiService.postFormData<{ urls: string[] }>(
        REVIEW_ROUTES.MEDIA,
        formData
      );
    } catch (error) {
      return BaseService.handleError(error, "upload review media");
    }
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
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const endpoint = queryString
        ? `${REVIEW_ROUTES.SUMMARY}?${queryString}`
        : REVIEW_ROUTES.SUMMARY;

      return await apiService.get<any>(endpoint);
    } catch (error) {
      return BaseService.handleError(error, "get review summary");
    }
  }

  // Check if user can review
  async canReview(
    productId?: string,
    auctionId?: string
  ): Promise<{ canReview: boolean; reason?: string }> {
    try {
      const params = new URLSearchParams();
      if (productId) params.append("productId", productId);
      if (auctionId) params.append("auctionId", auctionId);

      const queryString = params.toString();
      const endpoint = `/reviews/can-review?${queryString}`;

      return await apiService.get<{ canReview: boolean; reason?: string }>(endpoint);
    } catch (error) {
      return BaseService.handleError(error, "check if user can review");
    }
  }

  // Get featured reviews
  async getFeatured(): Promise<ReviewFE[]> {
    try {
      const response = await apiService.get<{ data: ReviewBE[] }>(
        "/reviews?featured=true&isApproved=true&limit=100"
      );
      return toFEReviews(response.data);
    } catch (error) {
      return BaseService.handleError(error, "get featured reviews");
    }
  }

  // Get homepage reviews
  async getHomepage(): Promise<ReviewFE[]> {
    try {
      const response = await apiService.get<{ data: ReviewBE[] }>(
        `${REVIEW_ROUTES.LIST}?featured=true&isApproved=true&verifiedPurchase=true&limit=20`
      );
      return toFEReviews(response.data);
    } catch (error) {
      return BaseService.handleError(error, "get homepage reviews");
    }
  }

  // Bulk operations (admin only)
  private async bulkAction(
    action: string,
    ids: string[],
    data?: Record<string, any>
  ): Promise<{
    success: boolean;
    results: {
      success: string[];
      failed: { id: string; error: string }[];
    };
    summary: { total: number; succeeded: number; failed: number };
  }> {
    try {
      return await apiService.post(REVIEW_ROUTES.BULK, { action, ids, data });
    } catch (error) {
      return BaseService.handleError(error, `bulk ${action} reviews`);
    }
  }

  async bulkApprove(ids: string[]): Promise<any> {
    return this.bulkAction("approve", ids);
  }

  async bulkReject(ids: string[]): Promise<any> {
    return this.bulkAction("reject", ids);
  }

  async bulkFlag(ids: string[]): Promise<any> {
    return this.bulkAction("flag", ids);
  }

  async bulkUnflag(ids: string[]): Promise<any> {
    return this.bulkAction("unflag", ids);
  }

  async bulkDelete(ids: string[]): Promise<any> {
    return this.bulkAction("delete", ids);
  }

  async bulkUpdate(ids: string[], updates: Record<string, any>): Promise<any> {
    return this.bulkAction("update", ids, updates);
  }
}

export const reviewsService = new ReviewsService();
export type { ModerateReviewData };
