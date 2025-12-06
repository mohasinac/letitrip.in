/**
 * @fileoverview Auctions Service - Extends BaseService
 * @module src/services/auctions.service
 * @description Auction management service with CRUD and bidding operations
 *
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { AUCTION_ROUTES, buildUrl } from "@/constants/api-routes";
import { PAGINATION } from "@/constants/limits";
import { AUCTION_STATUS } from "@/constants/statuses";
import { logServiceError } from "@/lib/error-logger";
import {
  AuctionBE,
  AuctionFiltersBE,
  BidBE,
} from "@/types/backend/auction.types";
import {
  AuctionCardFE,
  AuctionFE,
  AuctionFormFE,
  BidFE,
  PlaceBidFormFE,
} from "@/types/frontend/auction.types";
import type {
  BulkActionResponse,
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
import {
  toBECreateAuctionRequest,
  toFEAuction,
  toFEAuctionCard,
  toFEAuctions,
  toFEBid,
} from "@/types/transforms/auction.transforms";
import { apiService } from "./api.service";
import { BaseService } from "./base.service";

/**
 * Auctions Service
 * Extends BaseService for common CRUD operations
 * Adds auction-specific methods (bidding, live status, featured management, etc.)
 */
class AuctionsService extends BaseService<
  AuctionBE,
  AuctionFE,
  AuctionFormFE,
  AuctionFiltersBE
> {
  protected endpoint = AUCTION_ROUTES.LIST;
  protected entityName = "Auction";

  protected toBE(form: AuctionFormFE): Partial<AuctionBE> {
    return toBECreateAuctionRequest(form) as Partial<AuctionBE>;
  }

  protected toFE(be: AuctionBE): AuctionFE {
    return toFEAuction(be);
  }

  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  /**
   * Override list to transform to AuctionCardFE
   */
  async list(
    filters?: Partial<AuctionFiltersBE>
  ): Promise<PaginatedResponseFE<AuctionCardFE>> {
    try {
      const endpoint = buildUrl(AUCTION_ROUTES.LIST, filters);
      const response = await apiService.get<PaginatedResponseBE<any>>(endpoint);

      return {
        data: (response.data || []).map(toFEAuctionCard),
        count: response.count,
        pagination: response.pagination,
      };
    } catch (error) {
      this.handleError(error, "list");
    }
  }

  /**
   * Get auction by slug (auctions use slug instead of ID for public access)
   */
  async getBySlug(slug: string): Promise<AuctionFE> {
    try {
      const auctionBE = await apiService.get<AuctionBE>(
        AUCTION_ROUTES.BY_SLUG(slug)
      );
      return toFEAuction(auctionBE);
    } catch (error) {
      this.handleError(error, `getBySlug(${slug})`);
    }
  }

  // Validate slug availability
  async validateSlug(
    /** Slug */
    slug: string,
    /** Shop Id */
    shopId?: string
  ): Promise<{ available: boolean; message?: string }> {
    const params = new URLSearchParams();
    params.append("slug", slug);
    if (shopId) params.append("shop_id", shopId);

    return apiService.get<{ available: boolean; message?: string }>(
      `/auctions/validate-slug?${params.toString()}`
    );
  }

  // Get auction bids
  async getBids(
    /** Id */
    id: string,
    /** Limit */
    limit?: number,
    /** Start After */
    startAfter?: string | null,
    /** Sort Order */
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginatedResponseFE<BidFE>> {
    try {
      const params = new URLSearchParams();
      if (startAfter) params.append("startAfter", startAfter);
      if (limit) params.append("limit", limit.toString());
      if (sortOrder) params.append("sortOrder", sortOrder);

      const queryString = params.toString();
      const endpoint = queryString
        ? `/auctions/${id}/bid?${queryString}`
        : `/auctions/${id}/bid`;

      /**
       * Performs response operation
       *
       * @param {any} endpoint - The endpoint
       *
       * @returns {any} The response result
       *
       */
      const response = await apiService.get<PaginatedResponseBE<BidBE>>(
        endpoint
      );

      return {
        /** Data */
        data: response.data.map((bid) => toFEBid(bid)),
        /** Count */
        count: response.count,
        /** Pagination */
        pagination: response.pagination,
      };
    } catch (error) {
      this.handleError(error, `getBids(${id})`);
    }
  }

  // Place bid (authenticated users)
  async placeBid(id: string, formData: PlaceBidFormFE): Promise<BidFE> {
    try {
      const bidBE = await apiService.post<BidBE>(`/auctions/${id}/bid`, {
        /** Amount */
        amount: formData.amount,
        /** Is Auto Bid */
        isAutoBid: formData.isAutoBid,
        /** Max Auto Bid Amount */
        maxAutoBidAmount: formData.maxAutoBidAmount,
      });
      return toFEBid(bidBE);
    } catch (error) {
      this.handleError(error, `placeBid(${id}, ${formData.amount})`);
    }
  }

  // Set featured auction (admin only)
  async setFeatured(
    /** Id */
    id: string,
    /** Featured */
    featured: boolean,
    /** Priority */
    priority?: number
  ): Promise<AuctionFE> {
    const auctionBE = await apiService.patch<AuctionBE>(
      `/auctions/${id}/feature`,
      {
        featured,
        /** Featured Priority */
        featuredPriority: priority,
      }
    );
    return toFEAuction(auctionBE);
  }

  // Get live auctions
  async getLive(): Promise<AuctionFE[]> {
    const auctionsBE = await apiService.get<AuctionBE[]>("/auctions/live");
    return toFEAuctions(auctionsBE);
  }

  // Get featured auctions
  async getFeatured(): Promise<AuctionFE[]> {
    const auctionsBE = await apiService.get<AuctionBE[]>("/auctions/featured");
    return toFEAuctions(auctionsBE);
  }

  // Get homepage auctions
  async getHomepage(): Promise<AuctionCardFE[]> {
    const response = await this.list({
      /** Status */
      status: AUCTION_STATUS.ACTIVE as any,
      /** Limit */
      limit: PAGINATION.DEFAULT_PAGE_SIZE,
    });
    return response.data;
  }

  // Get similar auctions
  async getSimilar(id: string, limit?: number): Promise<AuctionFE[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/auctions/${id}/similar?${queryString}`
      : `/auctions/${id}/similar`;

    const auctionsBE = await apiService.get<AuctionBE[]>(endpoint);
    return toFEAuctions(auctionsBE);
  }

  // Get seller's other auctions
  async getSellerAuctions(id: string, limit?: number): Promise<AuctionFE[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/auctions/${id}/seller-items?${queryString}`
      : `/auctions/${id}/seller-items`;

    const auctionsBE = await apiService.get<AuctionBE[]>(endpoint);
    return toFEAuctions(auctionsBE);
  }

  // Watch/unwatch auction
  async toggleWatch(id: string): Promise<{ watching: boolean }> {
    return apiService.post<{ watching: boolean }>(`/auctions/${id}/watch`, {});
  }

  // Get user's watchlist
  async getWatchlist(): Promise<AuctionFE[]> {
    try {
      const response = await apiService.get<{
        /** Success */
        success: boolean;
        /** Data */
        data: AuctionBE[];
      }>("/auctions/watchlist");
      const auctionsBE = response.data || [];
      return toFEAuctions(auctionsBE);
    } catch (error) {
      this.handleError(error, "getWatchlist()");
    }
  }

  // Get user's active bids
  async getMyBids(): Promise<BidFE[]> {
    try {
      const response = await apiService.get<{
        /**
         * Performs bids b e operation
         *
         * @param {any} (bid - The (bid
         *
         * @returns {any} The bidsbe result
         *
         */
        /** Success */
        success: boolean;
        /** Data */
        data: BidBE[];
      }>("/auctions/my-bids");
      const bidsBE = response.data || [];
      return bidsBE.map((bid) => toFEBid(bid));
    } catch (error) {
      this.handleError(error, "getMyBids()");
    }
  }

  // Get user's won auctions
  async getWonAuctions(): Promise<AuctionFE[]> {
    try {
      const response = await apiService.get<{
        /** Success */
        success: boolean;
        /** Data */
        data: AuctionBE[];
      }>("/auctions/won");
      const auctionsBE = response.data || [];
      return toFEAuctions(auctionsBE);
    } catch (error) {
      this.handleError(error, "getWonAuctions()");
    }
  }

  /**
   * Bulk actions - supports: start, end, cancel, feature, unfeature, delete, update
   */
  async bulkAction(
    /** Action */
    action: string,
    /** Auction Ids */
    auctionIds: string[],
    /** Data */
    data?: any
  ): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        AUCTION_ROUTES.BULK,
        {
          action,
          /** Ids */
          ids: auctionIds,
          /** Updates */
          updates: data,
        }
      );
      return response;
    } catch (error) {
      logServiceError("Auctions", "bulkAction", error as Error);
      throw error;
    }
  }

  /**
   * Bulk start auctions
   */
  async bulkStart(auctionIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("start", auctionIds);
  }

  /**
   * Bulk end auctions
   */
  async bulkEnd(auctionIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("end", auctionIds);
  }

  /**
   * Bulk cancel auctions
   */
  async bulkCancel(auctionIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("cancel", auctionIds);
  }

  /**
   * Bulk feature auctions
   */
  async bulkFeature(auctionIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("feature", auctionIds);
  }

  /**
   * Bulk unfeature auctions
   */
  async bulkUnfeature(auctionIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("unfeature", auctionIds);
  }

  /**
   * Bulk delete auctions
   */
  async bulkDelete(auctionIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("delete", auctionIds);
  }

  /**
   * Bulk update auctions
   */
  async bulkUpdate(
    /** Auction Ids */
    auctionIds: string[],
    /** Updates */
    updates: Partial<AuctionFormFE>
  ): Promise<BulkActionResponse> {
    return this.bulkAction("update", auctionIds, updates);
  }

  // Quick create for inline editing (minimal fields)
  async quickCreate(data: {
    /** Name */
    name: string;
    /** Starting Bid */
    startingBid: number;
    /** Start Time */
    startTime: Date | string;
    /** End Time */
    endTime: Date | string;
    /** Status */
    status?: string;
    /** Images */
    images?: string[];
  }): Promise<AuctionFE> {
    const auctionBE = await apiService.post<AuctionBE>(AUCTION_ROUTES.LIST, {
      ...data,
      /** Description */
      description: "",
      /** Slug */
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
    });
    return toFEAuction(auctionBE);
  }

  // Quick update for inline editing
  async quickUpdate(
    /** Id */
    id: string,
    /** Data */
    data: Partial<AuctionFormFE>
  ): Promise<AuctionFE> {
    const auctionBE = await apiService.patch<AuctionBE>(
      AUCTION_ROUTES.BY_ID(id),
      data
    );
    return toFEAuction(auctionBE);
  }

  /**
   * Batch fetch auctions by IDs
   * Used for admin-curated featured sections
   */
  async getByIds(ids: string[]): Promise<AuctionCardFE[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const response: any = await apiService.post("/auctions/batch", { ids });
      return (response.data || []).map(toFEAuctionCard);
    } catch (error) {
      this.handleError(error, "getByIds");
    }
  }
}

export const auctionsService = new AuctionsService();
