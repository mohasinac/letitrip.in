import { apiService } from "./api.service";
import { AUCTION_ROUTES, buildUrl } from "@/constants/api-routes";
import {
  AuctionBE,
  AuctionFiltersBE,
  BidBE,
} from "@/types/backend/auction.types";
import {
  AuctionFE,
  AuctionCardFE,
  AuctionFormFE,
  PlaceBidFormFE,
  BidFE,
} from "@/types/frontend/auction.types";
import {
  toFEAuction,
  toFEAuctions,
  toFEAuctionCard,
  toFEBid,
  toBECreateAuctionRequest,
} from "@/types/transforms/auction.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
  BulkActionResponse,
} from "@/types/shared/common.types";
import { logServiceError } from "@/lib/error-logger";
import { getUserFriendlyError } from "@/components/common/ErrorMessage";

class AuctionsService {
  /**
   * Handle service errors and convert to user-friendly messages
   */
  private handleError(error: any, context: string): never {
    logServiceError("AuctionsService", context, error);
    const friendlyMessage = getUserFriendlyError(error);

    // Create enhanced error with friendly message
    const enhancedError: any = new Error(friendlyMessage);
    enhancedError.originalError = error;
    enhancedError.context = context;

    throw enhancedError;
  }

  // List auctions (role-filtered) with cursor-based pagination
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

  // Get auction by ID
  async getById(id: string): Promise<AuctionFE> {
    try {
      const auctionBE = await apiService.get<AuctionBE>(
        AUCTION_ROUTES.BY_ID(id)
      );
      return toFEAuction(auctionBE);
    } catch (error) {
      this.handleError(error, `getById(${id})`);
    }
  }

  // Get auction by slug
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

  // Create auction (seller/admin)
  async create(formData: AuctionFormFE): Promise<AuctionFE> {
    try {
      const request = toBECreateAuctionRequest(formData);
      const auctionBE = await apiService.post<AuctionBE>(
        AUCTION_ROUTES.LIST,
        request
      );
      return toFEAuction(auctionBE);
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  // Update auction (owner/admin)
  async update(
    id: string,
    formData: Partial<AuctionFormFE>
  ): Promise<AuctionFE> {
    try {
      const auctionBE = await apiService.patch<AuctionBE>(
        AUCTION_ROUTES.BY_ID(id),
        formData
      );
      return toFEAuction(auctionBE);
    } catch (error) {
      this.handleError(error, `update(${id})`);
    }
  }

  // Delete auction (owner/admin)
  async delete(id: string): Promise<{ message: string }> {
    try {
      return apiService.delete<{ message: string }>(AUCTION_ROUTES.BY_ID(id));
    } catch (error) {
      this.handleError(error, `delete(${id})`);
    }
  }

  // Validate slug availability
  async validateSlug(
    slug: string,
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
    id: string,
    limit?: number,
    startAfter?: string | null,
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

      const response = await apiService.get<PaginatedResponseBE<BidBE>>(
        endpoint
      );

      return {
        data: response.data.map((bid) => toFEBid(bid)),
        count: response.count,
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
        amount: formData.amount,
        isAutoBid: formData.isAutoBid,
        maxAutoBidAmount: formData.maxAutoBidAmount,
      });
      return toFEBid(bidBE);
    } catch (error) {
      this.handleError(error, `placeBid(${id}, ${formData.amount})`);
    }
  }

  // Set featured auction (admin only)
  async setFeatured(
    id: string,
    featured: boolean,
    priority?: number
  ): Promise<AuctionFE> {
    const auctionBE = await apiService.patch<AuctionBE>(
      `/auctions/${id}/feature`,
      {
        featured,
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
      status: "active" as any,
      limit: 20,
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
      const auctionsBE = await apiService.get<AuctionBE[]>(
        "/auctions/watchlist"
      );
      return toFEAuctions(auctionsBE);
    } catch (error) {
      this.handleError(error, "getWatchlist()");
    }
  }

  // Get user's active bids
  async getMyBids(): Promise<BidFE[]> {
    try {
      const bidsBE = await apiService.get<BidBE[]>("/auctions/my-bids");
      return bidsBE.map((bid) => toFEBid(bid));
    } catch (error) {
      this.handleError(error, "getMyBids()");
    }
  }

  // Get user's won auctions
  async getWonAuctions(): Promise<AuctionFE[]> {
    try {
      const auctionsBE = await apiService.get<AuctionBE[]>("/auctions/won");
      return toFEAuctions(auctionsBE);
    } catch (error) {
      this.handleError(error, "getWonAuctions()");
    }
  }

  /**
   * Bulk actions - supports: start, end, cancel, feature, unfeature, delete, update
   */
  async bulkAction(
    action: string,
    auctionIds: string[],
    data?: any
  ): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        AUCTION_ROUTES.BULK,
        {
          action,
          ids: auctionIds,
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
    auctionIds: string[],
    updates: Partial<AuctionFormFE>
  ): Promise<BulkActionResponse> {
    return this.bulkAction("update", auctionIds, updates);
  }

  // Quick create for inline editing (minimal fields)
  async quickCreate(data: {
    name: string;
    startingBid: number;
    startTime: Date | string;
    endTime: Date | string;
    status?: string;
    images?: string[];
  }): Promise<AuctionFE> {
    const auctionBE = await apiService.post<AuctionBE>(AUCTION_ROUTES.LIST, {
      ...data,
      description: "",
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
    });
    return toFEAuction(auctionBE);
  }

  // Quick update for inline editing
  async quickUpdate(
    id: string,
    data: Partial<AuctionFormFE>
  ): Promise<AuctionFE> {
    const auctionBE = await apiService.patch<AuctionBE>(
      AUCTION_ROUTES.BY_ID(id),
      data
    );
    return toFEAuction(auctionBE);
  }
}

export const auctionsService = new AuctionsService();
