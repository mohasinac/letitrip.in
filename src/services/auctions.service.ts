import { apiService } from "./api.service";
import { AUCTION_ROUTES, buildUrl } from "@/constants/api-routes";
import {
  AuctionBE,
  AuctionFiltersBE,
  CreateAuctionRequestBE,
  UpdateAuctionRequestBE,
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
} from "@/types/shared/common.types";

class AuctionsService {
  // List auctions (role-filtered) with cursor-based pagination
  async list(
    filters?: Partial<AuctionFiltersBE>
  ): Promise<PaginatedResponseFE<AuctionCardFE>> {
    const endpoint = buildUrl(AUCTION_ROUTES.LIST, filters);
    const response: any = await apiService.get(endpoint);

    return {
      data: (response.data || []).map(toFEAuctionCard),
      total: response.count || 0,
      page: 1, // Not used with cursor pagination
      limit: response.pagination?.limit || 50,
      totalPages: 1, // Not used with cursor pagination
      hasMore: response.pagination?.hasNextPage || false,
      nextCursor: response.pagination?.nextCursor || null,
    };
  }

  // Get auction by ID
  async getById(id: string): Promise<AuctionFE> {
    const auctionBE = await apiService.get<AuctionBE>(AUCTION_ROUTES.BY_ID(id));
    return toFEAuction(auctionBE);
  }

  // Get auction by slug
  async getBySlug(slug: string): Promise<AuctionFE> {
    const auctionBE = await apiService.get<AuctionBE>(
      AUCTION_ROUTES.BY_SLUG(slug)
    );
    return toFEAuction(auctionBE);
  }

  // Create auction (seller/admin)
  async create(formData: AuctionFormFE): Promise<AuctionFE> {
    const request = toBECreateAuctionRequest(formData);
    const auctionBE = await apiService.post<AuctionBE>(
      AUCTION_ROUTES.LIST,
      request
    );
    return toFEAuction(auctionBE);
  }

  // Update auction (owner/admin)
  async update(
    id: string,
    formData: Partial<AuctionFormFE>
  ): Promise<AuctionFE> {
    const auctionBE = await apiService.patch<AuctionBE>(
      AUCTION_ROUTES.BY_ID(id),
      formData
    );
    return toFEAuction(auctionBE);
  }

  // Delete auction (owner/admin)
  async delete(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(AUCTION_ROUTES.BY_ID(id));
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
    page?: number,
    limit?: number,
    startAfter?: string | null,
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginatedResponseFE<BidFE>> {
    const params = new URLSearchParams();
    if (startAfter) params.append("startAfter", startAfter);
    if (limit) params.append("limit", limit.toString());
    if (sortOrder) params.append("sortOrder", sortOrder);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/auctions/${id}/bid?${queryString}`
      : `/auctions/${id}/bid`;

    const response = await apiService.get<{
      success: boolean;
      data: BidBE[];
      count: number;
      pagination: {
        limit: number;
        hasNextPage: boolean;
        nextCursor: string | null;
      };
    }>(endpoint);

    return {
      data: response.data.map((bid) => toFEBid(bid)),
      total: response.count,
      page: page || 1,
      limit: response.pagination.limit,
      totalPages: 1,
      hasMore: response.pagination.hasNextPage,
      nextCursor: response.pagination.nextCursor,
    };
  }

  // Place bid (authenticated users)
  async placeBid(id: string, formData: PlaceBidFormFE): Promise<BidFE> {
    const bidBE = await apiService.post<BidBE>(`/auctions/${id}/bid`, {
      amount: formData.amount,
      isAutoBid: formData.isAutoBid,
      maxAutoBidAmount: formData.maxAutoBidAmount,
    });
    return toFEBid(bidBE);
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
    const auctionsBE = await apiService.get<AuctionBE[]>("/auctions/watchlist");
    return toFEAuctions(auctionsBE);
  }

  // Get user's active bids
  async getMyBids(): Promise<BidFE[]> {
    const bidsBE = await apiService.get<BidBE[]>("/auctions/my-bids");
    return bidsBE.map((bid) => toFEBid(bid));
  }

  // Get user's won auctions
  async getWonAuctions(): Promise<AuctionFE[]> {
    const auctionsBE = await apiService.get<AuctionBE[]>("/auctions/won");
    return toFEAuctions(auctionsBE);
  }

  /**
   * Bulk actions - supports: start, end, cancel, feature, unfeature, delete, update
   */
  async bulkAction(
    action: string,
    auctionIds: string[],
    data?: any
  ): Promise<{ success: boolean; results: any[] }> {
    return apiService.post(AUCTION_ROUTES.BULK, {
      action,
      auctionIds,
      data,
    });
  }

  /**
   * Bulk start auctions
   */
  async bulkStart(
    auctionIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("start", auctionIds);
  }

  /**
   * Bulk end auctions
   */
  async bulkEnd(
    auctionIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("end", auctionIds);
  }

  /**
   * Bulk cancel auctions
   */
  async bulkCancel(
    auctionIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("cancel", auctionIds);
  }

  /**
   * Bulk feature auctions
   */
  async bulkFeature(
    auctionIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("feature", auctionIds);
  }

  /**
   * Bulk unfeature auctions
   */
  async bulkUnfeature(
    auctionIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("unfeature", auctionIds);
  }

  /**
   * Bulk delete auctions
   */
  async bulkDelete(
    auctionIds: string[]
  ): Promise<{ success: boolean; results: any[] }> {
    return this.bulkAction("delete", auctionIds);
  }

  /**
   * Bulk update auctions
   */
  async bulkUpdate(
    auctionIds: string[],
    updates: Partial<AuctionFormFE>
  ): Promise<{ success: boolean; results: any[] }> {
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
