import { apiService } from "./api.service";
import { AUCTION_ROUTES, buildUrl } from "@/constants/api-routes";
import type { Auction, AuctionStatus, Bid, PaginatedResponse } from "@/types";

interface AuctionFilters {
  shopId?: string;
  status?: AuctionStatus;
  search?: string;
  minBid?: number;
  maxBid?: number;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  endingSoon?: boolean; // Within 24 hours
  page?: number;
  limit?: number;
  sortBy?: "endTime" | "currentBid" | "bidCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

interface CreateAuctionData {
  shopId: string;
  name: string;
  slug: string;
  description: string;
  startingBid: number;
  reservePrice?: number;
  startTime: Date;
  endTime: Date;
  status: AuctionStatus;
}

interface UpdateAuctionData extends Partial<CreateAuctionData> {
  images?: string[];
  videos?: string[];
  isFeatured?: boolean;
  featuredPriority?: number;
}

interface PlaceBidData {
  bidAmount: number;
  isAutoBid?: boolean;
  maxAutoBid?: number;
}

class AuctionsService {
  // List auctions (role-filtered)
  async list(filters?: AuctionFilters): Promise<PaginatedResponse<Auction>> {
    const endpoint = buildUrl(AUCTION_ROUTES.LIST, filters);
    return apiService.get<PaginatedResponse<Auction>>(endpoint);
  }

  // Get auction by ID
  async getById(id: string): Promise<Auction> {
    return apiService.get<Auction>(AUCTION_ROUTES.BY_ID(id));
  }

  // Get auction by slug
  async getBySlug(slug: string): Promise<Auction> {
    return apiService.get<Auction>(AUCTION_ROUTES.BY_SLUG(slug));
  }

  // Create auction (seller/admin)
  async create(data: CreateAuctionData): Promise<Auction> {
    return apiService.post<Auction>(AUCTION_ROUTES.LIST, data);
  }

  // Update auction (owner/admin)
  async update(id: string, data: UpdateAuctionData): Promise<Auction> {
    return apiService.patch<Auction>(AUCTION_ROUTES.BY_ID(id), data);
  }

  // Delete auction (owner/admin)
  async delete(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(AUCTION_ROUTES.BY_ID(id));
  }

  // Get auction bids
  async getBids(
    id: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Bid>> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/auctions/${id}/bid?${queryString}`
      : `/auctions/${id}/bid`;

    return apiService.get<PaginatedResponse<Bid>>(endpoint);
  }

  // Place bid (authenticated users)
  async placeBid(id: string, data: PlaceBidData): Promise<Bid> {
    return apiService.post<Bid>(`/auctions/${id}/bid`, data);
  }

  // Set featured auction (admin only)
  async setFeatured(
    id: string,
    isFeatured: boolean,
    priority?: number,
  ): Promise<Auction> {
    return apiService.patch<Auction>(`/auctions/${id}/feature`, {
      isFeatured,
      featuredPriority: priority,
    });
  }

  // Get live auctions
  async getLive(): Promise<Auction[]> {
    return apiService.get<Auction[]>("/auctions/live");
  }

  // Get featured auctions
  async getFeatured(): Promise<Auction[]> {
    return apiService.get<Auction[]>("/auctions/featured");
  }

  // Get homepage auctions
  async getHomepage(): Promise<Auction[]> {
    const response = await this.list({
      showOnHomepage: true,
      status: "live",
      limit: 20,
    });
    return Array.isArray(response) ? response : (response as any).data || [];
  }

  // Get similar auctions
  async getSimilar(id: string, limit?: number): Promise<Auction[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/auctions/${id}/similar?${queryString}`
      : `/auctions/${id}/similar`;

    return apiService.get<Auction[]>(endpoint);
  }

  // Get seller's other auctions
  async getSellerAuctions(id: string, limit?: number): Promise<Auction[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/auctions/${id}/seller-items?${queryString}`
      : `/auctions/${id}/seller-items`;

    return apiService.get<Auction[]>(endpoint);
  }

  // Watch/unwatch auction
  async toggleWatch(id: string): Promise<{ watching: boolean }> {
    return apiService.post<{ watching: boolean }>(`/auctions/${id}/watch`, {});
  }

  // Get user's watchlist
  async getWatchlist(): Promise<Auction[]> {
    return apiService.get<Auction[]>("/auctions/watchlist");
  }

  // Get user's active bids
  async getMyBids(): Promise<Bid[]> {
    return apiService.get<Bid[]>("/auctions/my-bids");
  }

  // Get user's won auctions
  async getWonAuctions(): Promise<Auction[]> {
    return apiService.get<Auction[]>("/auctions/won");
  }
}

export const auctionsService = new AuctionsService();
export type {
  AuctionFilters,
  CreateAuctionData,
  UpdateAuctionData,
  PlaceBidData,
};
