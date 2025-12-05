/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/auction.types
 * @description This file contains TypeScript type definitions for auction
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
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
  /** FormattedAmount */
  formattedAmount: string; // "₹15,000"
  /** TimeAgo */
  timeAgo: string; // "2 minutes ago"

  // UI states
  /** Is Highest */
  isHighest: boolean;
  /** Is Your Bid */
  isYourBid: boolean;

  // Backwards compatibility
  /** BidTime */
  bidTime?: Date; // Alias for createdAt
  /** BidAmount */
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
  /** StartTimeDisplay */
  startTimeDisplay: string; // "Nov 13, 2025 2:30 PM"
  /** End Time Display */
  endTimeDisplay: string;
  /** TimeRemaining */
  timeRemaining: string; // "2d 5h 30m"
  /** Time Remaining Seconds */
  timeRemainingSeconds: number;
  /** DurationDisplay */
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
  /** IsEndingSoon */
  isEndingSoon: boolean; // Within 1 hour
  /** Can Bid */
  canBid: boolean;
  /** Can Buy Now */
  canBuyNow: boolean;
  /** IsYourAuction */
  isYourAuction: boolean; // Current user is seller
  /** IsYouWinning */
  isYouWinning: boolean; // Current user is highest bidder
  /** IsYouWinner */
  isYouWinner: boolean; // Current user won

  // Reserve
  /** Reserve Met */
  reserveMet: boolean;
  /** ReserveStatus */
  reserveStatus: string; // "Reserve met" | "Reserve not met" | "No reserve"

  // Progress
  /** PriceProgress */
  priceProgress: number; // 0-100 (startingPrice to buyNowPrice)
  /** BidProgress */
  bidProgress: number; // 0-100 (based on bid count)
  /** TimeProgress */
  timeProgress: number; // 0-100 (elapsed time)

  // Badges
  /** Badges */
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
  /** CurrentBid */
  currentBid?: number; // Alias for currentPrice
  /** Name */
  name?: string; // Alias for productName
  /** Description */
  description?: string; // Alias for productDescription
  /** Featured */
  featured?: boolean; // Derived from metadata
  /** BidCount */
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
  /** Slug */
  slug?: string; // Alias for productSlug
  /** Name */
  name?: string; // Alias for productName
  /** Images */
  images?: string[]; // Multiple images for carousel
  /** Videos */
  videos?: string[]; // Video URLs for carousel
  /** CurrentBid */
  currentBid?: number; // Alias for currentPrice
  /** BidCount */
  bidCount?: number; // Alias for totalBids
  /** StartingBid */
  startingBid?: number; // For admin tables (not in minimal card)
  /** ReservePrice */
  reservePrice?: number | null; // For admin tables
  /** StartTime */
  startTime?: Date; // For admin tables
  /** ShopId */
  shopId?: string | null; // For admin tables
  /** Featured */
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
  /** Status */
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
  /** GrowthRate */
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
