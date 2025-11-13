/**
 * BACKEND AUCTION TYPES
 *
 * These types match the API response structure and Firestore documents exactly.
 */

import { Timestamp } from "firebase/firestore";
import { AuctionType, AuctionStatus } from "../shared/common.types";

/**
 * Auction bid
 */
export interface BidBE {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  isAutoBid: boolean;
  maxAutoBidAmount: number | null;
  createdAt: Timestamp;
}

/**
 * Auction entity from backend/Firestore
 */
export interface AuctionBE {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  productDescription: string;

  // Seller
  sellerId: string;
  sellerName: string;
  shopId: string | null;
  shopName: string | null;

  // Auction details
  type: AuctionType;
  status: AuctionStatus;
  startingPrice: number;
  reservePrice: number | null;
  currentPrice: number;
  buyNowPrice: number | null;

  // Bidding
  bidIncrement: number;
  minimumBid: number;
  totalBids: number;
  uniqueBidders: number;
  highestBidderId: string | null;
  highestBidderName: string | null;

  // Auto-bidding
  hasAutoBid: boolean;
  autoBidMaxAmount: number | null;

  // Timing
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // in seconds

  // Extended bidding
  allowExtension: boolean;
  extensionTime: number; // seconds to extend
  timesExtended: number;

  // Status
  isActive: boolean;
  isEnded: boolean;
  hasBids: boolean;
  hasWinner: boolean;
  winnerId: string | null;
  winnerName: string | null;
  winningBid: number | null;

  // Reserve
  reserveMet: boolean;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Auction list item (minimal fields)
 */
export interface AuctionListItemBE {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  type: AuctionType;
  status: AuctionStatus;
  currentPrice: number;
  buyNowPrice: number | null;
  totalBids: number;
  endTime: Timestamp;
  isActive: boolean;
}

/**
 * Create auction request
 */
export interface CreateAuctionRequestBE {
  productId: string;
  type: AuctionType;
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  bidIncrement: number;
  startTime: string; // ISO date
  endTime: string; // ISO date
  allowExtension?: boolean;
  extensionTime?: number;
}

/**
 * Place bid request
 */
export interface PlaceBidRequestBE {
  amount: number;
  isAutoBid?: boolean;
  maxAutoBidAmount?: number;
}

/**
 * Update auction request
 */
export interface UpdateAuctionRequestBE {
  status?: AuctionStatus;
  endTime?: string; // ISO date
  buyNowPrice?: number;
}

/**
 * Auction filters for list queries
 */
export interface AuctionFiltersBE {
  type?: AuctionType | AuctionType[];
  status?: AuctionStatus | AuctionStatus[];
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  hasReserve?: boolean;
  hasBuyNow?: boolean;
  search?: string;
  endingSoon?: boolean; // Within 24 hours
  startAfter?: string; // ISO date
  startBefore?: string; // ISO date
  endAfter?: string; // ISO date
  endBefore?: string; // ISO date
}

/**
 * Auction list response
 */
export interface AuctionListResponseBE {
  auctions: AuctionListItemBE[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Auction detail response
 */
export interface AuctionDetailResponseBE {
  auction: AuctionBE;
  bids: BidBE[];
  userBid: BidBE | null;
  userMaxBid: number | null;
}

/**
 * Bid history response
 */
export interface BidHistoryResponseBE {
  bids: BidBE[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Auction stats response
 */
export interface AuctionStatsResponseBE {
  totalAuctions: number;
  activeAuctions: number;
  completedAuctions: number;
  totalBids: number;
  totalRevenue: number;
  averageAuctionValue: number;
  auctionsToday: number;
  auctionsThisWeek: number;
  endingSoon: number; // Within 24 hours
}
