/**
 * @fileoverview Reviews Service - Extends BaseService
 * @module src/services/reviews.service
 * @description Review management service with CRUD and moderation operations
 * 
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { BaseService } from "./base.service";
import { apiService } from "./api.service";
import { REVIEW_ROUTES } from "@/constants/api-routes";
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

class ReviewsService extends BaseService<
  ReviewBE,
  ReviewFE,
  ReviewFormFE,
  Record<string, any>
> {
  protected endpoint = REVIEW_ROUTES.LIST;
  protected entityName = "Review";

  protected toBE(form: ReviewFormFE): Partial<ReviewBE> {
    return toBECreateReviewRequest(form) as Partial<ReviewBE>;
  }

  protected toFE(be: ReviewBE): ReviewFE {
    return toFEReview(be);
  }

  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  // Moderate review (shop owner/admin)
  async moderate(id: string, data: ModerateReviewData): Promise<ReviewFE> {
    const response: any = await apiService.patch(
      `${REVIEW_ROUTES.BY_ID(id)}/moderate`,
      data,
    );
    return toFEReview(response.data);
  }

  // Mark review as helpful
  async markHelpful(id: string): Promise<{ helpfulCount: number }> {
    return apiService.post<{ helpfulCount: number }>(
      REVIEW_ROUTES.HELPFUL(id),
      {},
    );
  }

  // Upload media fo/**
 * Performs form data operation
 *
 * @returns {any} The formdata result
 *
 */
r review
  async uploadMedia(files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(REVIEW_ROUTES.MEDIA, {
      /** Method */
      method: "POST",
      /** Body */
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
    /** Product Id */
    productId?: string;
    /** Shop Id */
    shopId?: string;
    /** Auction Id */
    auctionId?: string;
  }): Promise<{
    /** Average Rating */
    averageRating: number;
    /** Total Reviews */
    totalReviews: number;
    /** Rating Distr/**
 * Performs params operation
 *
 * @returns {any} The params result
 *
 */
ibution */
    ratingDistribution: { rating: number; count: number }[];
    /** Verified Purchase Percentage */
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
      ? `${REVIEW_ROUTES.SUMMARY}?${queryString}`
      : REVIEW_ROUTES.SUMMARY;

    return apiService.get<any>(endpoint);
  }

  // Check if user can review
  async canReview(
    /** Product Id */
    productId?: string,
    /** Auction Id */
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
  async getFeatured(): Promise<ReviewFE[]> {
    const response = await apiService.get<{ data: ReviewBE[] }>(
      "/reviews?featured=true&isApproved=true&limit=100",
    );
    return toFEReviews(response.data);
  }

  // Get homepage reviews
  async getHomepage(): Promise<ReviewFE[]> {
    const response = await apiService.get<{ data: ReviewBE[] }>(
      `${REVIEW_ROUTES.LIST}?featured=true&isApproved=true&verifiedPurchase=true&limit=20`,
    );
    return toFEReviews(response.data);
  }

  // Bulk operations (admin only)
  private async bulkAction(
    /** Action */
    action: string,
    /** Ids */
    ids: string[],
    /** Data */
    data?: Record<string, any>,
  ): Promise<{
    /** Success */
    success: boolean;
    /** Results */
    results: {
      /** Success */
      success: string[];
      /** Failed */
      failed: { id: string; error: string }[];
    };
    /** Summary */
    summary: { total: number; succeeded: number; failed: number };
  }> {
    return apiService.post(REVIEW_ROUTES.BULK, { action, ids, data });
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
