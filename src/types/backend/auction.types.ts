/**
 * @fileoverview Type Definitions
 * @module src/types/backend/auction.types
 * @description This file contains TypeScript type definitions for auction
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
  /** Id */
  id: string;
  /** Auction Id */
  auctionId: string;
  /** User Id */
  userId: string;
  /** User Name */
  userName: string;
  /** User Email */
  userEmail: string;
  /** Amount */
  amount: number;
  /** Is Auto Bid */
  isAutoBid: boolean;
  /** Max Auto Bid Amount */
  maxAutoBidAmount: number | null;
  /** Created At */
  createdAt: Timestamp;
}

/**
 * Auction entity from backend/Firestore
 */
export interface AuctionBE {
  /** Id */
  id: string;
  /** Slug */
  slug: string; // Unique slug for auction URL
  /** Product Id */
  productId: string;
  /** Product Name */
  productName: string;
  /** Product Slug */
  productSlug: string;
  /** Product Image */
  productImage: string;
  /** Images */
  images?: string[]; // Multiple images for carousel
  /** Videos */
  videos?: string[]; // Video URLs for carousel
  /** Product Description */
  productDescription: string;

  // Seller
  /** Seller Id */
  sellerId: string;
  /** Seller Name */
  sellerName: string;
  /** Shop Id */
  shopId: string | null;
  /** Shop Name */
  shopName: string | null;

  // Auction details
  /** Type */
  type: AuctionType;
  /** Status */
  status: AuctionStatus;
  /** Starting Price */
  startingPrice: number;
  /** Reserve Price */
  reservePrice: number | null;
  /** Current Price */
  currentPrice: number;
  /** Buy Now Price */
  buyNowPrice: number | null;

  // Bidding
  /** Bid Increment */
  bidIncrement: number;
  /** Minimum Bid */
  minimumBid: number;
  /** Total Bids */
  totalBids: number;
  /** Unique Bidders */
  uniqueBidders: number;
  /** Highest Bidder Id */
  highestBidderId: string | null;
  /** Highest Bidder Name */
  highestBidderName: string | null;

  // Auto-bidding
  /** Has Auto Bid */
  hasAutoBid: boolean;
  /** Auto Bid Max Amount */
  autoBidMaxAmount: number | null;

  // Timing
  /** Start Time */
  startTime: Timestamp;
  /** End Time */
  endTime: Timestamp;
  /** Duration */
  duration: number; // in seconds

  // Extended bidding
  /** Allow Extension */
  allowExtension: boolean;
  /** ExtensionTime */
  extensionTime: number; // seconds to extend
  /** Times Extended */
  timesExtended: number;

  // Status
  /** Is Active */
  isActive: boolean;
  /** Is Ended */
  isEnded: boolean;
  /** Has Bids */
  hasBids: boolean;
  /** Has Winner */
  hasWinner: boolean;
  /** Winner Id */
  winnerId: string | null;
  /** Winner Name */
  winnerName: string | null;
  /** Winning Bid */
  winningBid: number | null;

  // Reserve
  /** Reserve Met */
  reserveMet: boolean;

  // Timestamps
  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;

  // Metadata
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Auction list item (minimal fields)
 */
export interface AuctionListItemBE {
  /** Id */
  id: string;
  /** Slug */
  slug: string; // Unique slug for auction URL
  /** Product Id */
  productId: string;
  /** Product Name */
  productName: string;
  /** Product Slug */
  productSlug: string;
  /** Product Image */
  productImage: string;
  /** Images */
  images?: string[]; // Multiple images for carousel
  /** Videos */
  videos?: string[]; // Video URLs for carousel
  /** Type */
  type: AuctionType;
  /** Status */
  status: AuctionStatus;
  /** Current Price */
  currentPrice: number;
  /** Buy Now Price */
  buyNowPrice: number | null;
  /** Total Bids */
  totalBids: number;
  /** End Time */
  endTime: Timestamp;
  /** Is Active */
  isActive: boolean;
}

/**
 * Create auction request
 */
export interface CreateAuctionRequestBE {
  /** Product Id */
  productId: string;
  /** Type */
  type: AuctionType;
  /** Starting Price */
  startingPrice: number;
  /** Reserve Price */
  reservePrice?: number;
  /** Buy Now Price */
  buyNowPrice?: number;
  /** Bid Increment */
  bidIncrement: number;
  /** StartTime */
  startTime: string; // ISO date
  /** EndTime */
  endTime: string; // ISO date
  /** Allow Extension */
  allowExtension?: boolean;
  /** Extension Time */
  extensionTime?: number;
}

/**
 * Place bid request
 */
export interface PlaceBidRequestBE {
  /** Amount */
  amount: number;
  /** Is Auto Bid */
  isAutoBid?: boolean;
  /** Max Auto Bid Amount */
  maxAutoBidAmount?: number;
}

/**
 * Update auction request
 */
export interface UpdateAuctionRequestBE {
  /** Status */
  status?: AuctionStatus;
  /** EndTime */
  endTime?: string; // ISO date
  /** Buy Now Price */
  buyNowPrice?: number;
}

/**
 * Auction filters for list queries
 */
export interface AuctionFiltersBE {
  /** Type */
  type?: AuctionType | AuctionType[];
  /** Status */
  status?: AuctionStatus | AuctionStatus[];
  /** Seller Id */
  sellerId?: string;
  /** Shop Id */
  shopId?: string;
  /** Min Price */
  minPrice?: number;
  /** Max Price */
  maxPrice?: number;
  /** Has Reserve */
  hasReserve?: boolean;
  /** Has Buy Now */
  hasBuyNow?: boolean;
  /** Search */
  search?: string;
  /** EndingSoon */
  endingSoon?: boolean; // Within 24 hours
  /** StartAfter */
  startAfter?: string; // ISO date
  /** StartBefore */
  startBefore?: string; // ISO date
  /** EndAfter */
  endAfter?: string; // ISO date
  /** EndBefore */
  endBefore?: string; // ISO date
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
}

/**
 * Auction list response
 */
export interface AuctionListResponseBE {
  /** Auctions */
  auctions: AuctionListItemBE[];
  /** Pagination */
  pagination: {
    /** Page */
    page: number;
    /** Limit */
    limit: number;
    /** Total Pages */
    totalPages: number;
    /** Total Items */
    totalItems: number;
    /** Has Next Page */
    hasNextPage: boolean;
    /** Has Prev Page */
    hasPrevPage: boolean;
  };
}

/**
 * Auction detail response
 */
export interface AuctionDetailResponseBE {
  /** Auction */
  auction: AuctionBE;
  /** Bids */
  bids: BidBE[];
  /** User Bid */
  userBid: BidBE | null;
  /** User Max Bid */
  userMaxBid: number | null;
}

/**
 * Bid history response
 */
export interface BidHistoryResponseBE {
  /** Bids */
  bids: BidBE[];
  /** Pagination */
  pagination: {
    /** Page */
    page: number;
    /** Limit */
    limit: number;
    /** Total Pages */
    totalPages: number;
    /** Total Items */
    totalItems: number;
  };
}

/**
 * Auction stats response
 */
export interface AuctionStatsResponseBE {
  /** Total Auctions */
  totalAuctions: number;
  /** Active Auctions */
  activeAuctions: number;
  /** Completed Auctions */
  completedAuctions: number;
  /** Total Bids */
  totalBids: number;
  /** Total Revenue */
  totalRevenue: number;
  /** Average Auction Value */
  averageAuctionValue: number;
  /** Auctions Today */
  auctionsToday: number;
  /** Auctions This Week */
  auctionsThisWeek: number;
  /** EndingSoon */
  endingSoon: number; // Within 24 hours
}
