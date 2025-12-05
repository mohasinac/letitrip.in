/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/auction.types
 * @description This file contains TypeScript type definitions for auction
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * FRONTEND AUCTION TYPES
 *
 * These types are optimized for UI components and include computed fields,
 * formatted data, and UI-specific properties.
 */

import { AuctionType, AuctionStatus } from "../shared/common.types";

/**
 * Auction bid for frontend
 */
export interface BidFE {
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
  createdAt: Date;

  // Formatted
  formattedAmount: string; // "₹15,000"
  timeAgo: string; // "2 minutes ago"

  // UI states
  /** Is Highest */
  isHighest: boolean;
  /** Is Your Bid */
  isYourBid: boolean;

  // Backwards compatibility
  bidTime?: Date; // Alias for createdAt
  bidAmount?: number; // Alias for amount
}

/**
 * Auction entity for frontend (UI-optimized)
 */
export interface AuctionFE {
  /** Id */
  id: string;
  /** Product Id */
  productId: string;
  /** Product Name */
  productName: string;
  /** Product Slug */
  productSlug: string;
  /** Product Image */
  productImage: string;
  images?: string[]; // Multiple images for carousel
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

  // Formatted prices
  /** Formatted Starting Price */
  formattedStartingPrice: string;
  /** Formatted Reserve Price */
  formattedReservePrice: string | null;
  /** Formatted Current Price */
  formattedCurrentPrice: string;
  /** Formatted Buy Now Price */
  formattedBuyNowPrice: string | null;

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

  /** Formatted Bid Increment */
  formattedBidIncrement: string;
  /** Formatted Minimum Bid */
  formattedMinimumBid: string;

  // Auto-bidding
  /** Has Auto Bid */
  hasAutoBid: boolean;
  /** Auto Bid Max Amount */
  autoBidMaxAmount: number | null;

  // Timing
  /** Start Time */
  startTime: Date;
  /** End Time */
  endTime: Date;
  /** Duration */
  duration: number;

  // Formatted timing
  startTimeDisplay: string; // "Nov 13, 2025 2:30 PM"
  /** End Time Display */
  endTimeDisplay: string;
  timeRemaining: string; // "2d 5h 30m"
  /** Time Remaining Seconds */
  timeRemainingSeconds: number;
  durationDisplay: string; // "7 days"

  // Extended bidding
  /** Allow Extension */
  allowExtension: boolean;
  /** Extension Time */
  extensionTime: number;
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

  /** Formatted Winning Bid */
  formattedWinningBid: string | null;

  // UI states
  /** Is Upcoming */
  isUpcoming: boolean;
  /** Is Live */
  isLive: boolean;
  isEndingSoon: boolean; // Within 1 hour
  /** Can Bid */
  canBid: boolean;
  /** Can Buy Now */
  canBuyNow: boolean;
  isYourAuction: boolean; // Current user is seller
  isYouWinning: boolean; // Current user is highest bidder
  isYouWinner: boolean; // Current user won

  // Reserve
  /** Reserve Met */
  reserveMet: boolean;
  reserveStatus: string; // "Reserve met" | "Reserve not met" | "No reserve"

  // Progress
  priceProgress: number; // 0-100 (startingPrice to buyNowPrice)
  bidProgress: number; // 0-100 (based on bid count)
  timeProgress: number; // 0-100 (elapsed time)

  // Badges
  badges: string[]; // ["Live", "Ending Soon", "Hot", "Reserve Met", etc.]

  // Timestamps
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // Metadata
  /** Metadata */
  metadata?: Record<string, any>;

  // Backwards compatibility aliases (for legacy code)
  currentBid?: number; // Alias for currentPrice
  name?: string; // Alias for productName
  description?: string; // Alias for productDescription
  featured?: boolean; // Derived from metadata
  bidCount?: number; // Alias for totalBids
}

/**
 * Auction card for lists (minimal fields)
 */
export interface AuctionCardFE {
  /** Id */
  id: string;
  /** Product Id */
  productId: string;
  /** Product Name */
  productName: string;
  /** Product Slug */
  productSlug: string;
  /** Product Image */
  productImage: string;
  /** Type */
  type: AuctionType;
  /** Status */
  status: AuctionStatus;
  /** Current Price */
  currentPrice: number;
  /** Formatted Current Price */
  formattedCurrentPrice: string;
  /** Buy Now Price */
  buyNowPrice: number | null;
  /** Formatted Buy Now Price */
  formattedBuyNowPrice: string | null;
  /** Total Bids */
  totalBids: number;
  /** End Time */
  endTime: Date;
  /** Time Remaining */
  timeRemaining: string;
  /** Time Remaining Seconds */
  timeRemainingSeconds: number;
  /** Is Active */
  isActive: boolean;
  /** Is Ending Soon */
  isEndingSoon: boolean;
  /** Badges */
  badges: string[];

  // Backwards compatibility aliases
  slug?: string; // Alias for productSlug
  name?: string; // Alias for productName
  images?: string[]; // Multiple images for carousel
  videos?: string[]; // Video URLs for carousel
  currentBid?: number; // Alias for currentPrice
  bidCount?: number; // Alias for totalBids
  startingBid?: number; // For admin tables (not in minimal card)
  reservePrice?: number | null; // For admin tables
  startTime?: Date; // For admin tables
  shopId?: string | null; // For admin tables
  featured?: boolean; // For admin tables
}

/**
 * Auction filters for frontend
 */
export interface AuctionFiltersFE {
  /** Type */
  type?: AuctionType[];
  /** Status */
  status?: AuctionStatus[];
  /** Price Range */
  priceRange?: {
    /** Min */
    min: number | null;
    /** Max */
    max: number | null;
  };
  /** Has Reserve */
  hasReserve?: boolean;
  /** Has Buy Now */
  hasBuyNow?: boolean;
  /** Ending Soon */
  endingSoon?: boolean;
  /** Search */
  search?: string;
  /** Sort By */
  sortBy?: "endTime" | "currentPrice" | "totalBids" | "createdAt";
  /** Sort Order */
  sortOrder?: "asc" | "desc";
}

/**
 * Place bid form data
 */
export interface PlaceBidFormFE {
  /** Amount */
  amount: number;
  /** Is Auto Bid */
  isAutoBid: boolean;
  /** Max Auto Bid Amount */
  maxAutoBidAmount?: number;
}

/**
 * Auction form data (for creating/updating auctions)
 */
export interface AuctionFormFE {
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
  /** Start Time */
  startTime: Date;
  /** End Time */
  endTime: Date;
  /** Auto Extend */
  autoExtend: boolean;
  /** Extension Minutes */
  extensionMinutes?: number;
  /** Min Bid Increment */
  minBidIncrement: number;

  // Admin/moderation fields
  status?: AuctionStatus; // For admin status updates
}

/**
 * Product auction form data (for seller auction creation/editing)
 * Used in AuctionForm component
 */
export interface ProductAuctionFormFE {
  /** Shop Id */
  shopId: string | null;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description: string;
  /** Starting Bid */
  startingBid: number;
  /** Reserve Price */
  reservePrice: number | null;
  /** Start Time */
  startTime: Date;
  /** End Time */
  endTime: Date;
  /** Status */
  status: AuctionStatus;
  /** Images */
  images: string[];
  /** Videos */
  videos: string[];
}

/**
 * Auction stats for dashboard
 */
export interface AuctionStatsFE {
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
  /** Formatted Revenue */
  formattedRevenue: string;
  /** Average Auction Value */
  averageAuctionValue: number;
  /** Formatted Average Value */
  formattedAverageValue: string;
  /** Auctions Today */
  auctionsToday: number;
  /** Auctions This Week */
  auctionsThisWeek: number;
  /** Ending Soon */
  endingSoon: number;
  growthRate: string; // "+8% from last week"
}

/**
 * UI Constants
 */
export const AUCTION_TYPE_LABELS: Record<AuctionType, string> = {
  [AuctionType.REGULAR]: "Regular Auction",
  [AuctionType.REVERSE]: "Reverse Auction",
  [AuctionType.SILENT]: "Silent Auction",
};

/**
 * Auction Type Descriptions
 * @constant
 */
export const AUCTION_TYPE_DESCRIPTIONS: Record<AuctionType, string> = {
  [AuctionType.REGULAR]: "Price increases with each bid",
  [AuctionType.REVERSE]: "Price decreases over time",
  [AuctionType.SILENT]: "Bids are hidden from other bidders",
};

/**
 * Auction Status Labels
 * @constant
 */
export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  [AuctionStatus.DRAFT]: "Draft",
  [AuctionStatus.SCHEDULED]: "Scheduled",
  [AuctionStatus.ACTIVE]: "Active",
  [AuctionStatus.EXTENDED]: "Extended",
  [AuctionStatus.ENDED]: "Ended",
  [AuctionStatus.CANCELLED]: "Cancelled",
  [AuctionStatus.COMPLETED]: "Completed",
};

/**
 * Auction Status Colors
 * @constant
 */
export const AUCTION_STATUS_COLORS: Record<AuctionStatus, string> = {
  [AuctionStatus.DRAFT]: "gray",
  [AuctionStatus.SCHEDULED]: "blue",
  [AuctionStatus.ACTIVE]: "green",
  [AuctionStatus.EXTENDED]: "orange",
  [AuctionStatus.ENDED]: "purple",
  [AuctionStatus.CANCELLED]: "red",
  [AuctionStatus.COMPLETED]: "teal",
};
