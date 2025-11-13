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
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  isAutoBid: boolean;
  maxAutoBidAmount: number | null;
  createdAt: Date;

  // Formatted
  formattedAmount: string; // "₹15,000"
  timeAgo: string; // "2 minutes ago"

  // UI states
  isHighest: boolean;
  isYourBid: boolean;
}

/**
 * Auction entity for frontend (UI-optimized)
 */
export interface AuctionFE {
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

  // Formatted prices
  formattedStartingPrice: string;
  formattedReservePrice: string | null;
  formattedCurrentPrice: string;
  formattedBuyNowPrice: string | null;

  // Bidding
  bidIncrement: number;
  minimumBid: number;
  totalBids: number;
  uniqueBidders: number;
  highestBidderId: string | null;
  highestBidderName: string | null;

  formattedBidIncrement: string;
  formattedMinimumBid: string;

  // Auto-bidding
  hasAutoBid: boolean;
  autoBidMaxAmount: number | null;

  // Timing
  startTime: Date;
  endTime: Date;
  duration: number;

  // Formatted timing
  startTimeDisplay: string; // "Nov 13, 2025 2:30 PM"
  endTimeDisplay: string;
  timeRemaining: string; // "2d 5h 30m"
  timeRemainingSeconds: number;
  durationDisplay: string; // "7 days"

  // Extended bidding
  allowExtension: boolean;
  extensionTime: number;
  timesExtended: number;

  // Status
  isActive: boolean;
  isEnded: boolean;
  hasBids: boolean;
  hasWinner: boolean;
  winnerId: string | null;
  winnerName: string | null;
  winningBid: number | null;

  formattedWinningBid: string | null;

  // UI states
  isUpcoming: boolean;
  isLive: boolean;
  isEndingSoon: boolean; // Within 1 hour
  canBid: boolean;
  canBuyNow: boolean;
  isYourAuction: boolean; // Current user is seller
  isYouWinning: boolean; // Current user is highest bidder
  isYouWinner: boolean; // Current user won

  // Reserve
  reserveMet: boolean;
  reserveStatus: string; // "Reserve met" | "Reserve not met" | "No reserve"

  // Progress
  priceProgress: number; // 0-100 (startingPrice to buyNowPrice)
  bidProgress: number; // 0-100 (based on bid count)
  timeProgress: number; // 0-100 (elapsed time)

  // Badges
  badges: string[]; // ["Live", "Ending Soon", "Hot", "Reserve Met", etc.]

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Auction card for lists (minimal fields)
 */
export interface AuctionCardFE {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  type: AuctionType;
  status: AuctionStatus;
  currentPrice: number;
  formattedCurrentPrice: string;
  buyNowPrice: number | null;
  formattedBuyNowPrice: string | null;
  totalBids: number;
  endTime: Date;
  timeRemaining: string;
  timeRemainingSeconds: number;
  isActive: boolean;
  isEndingSoon: boolean;
  badges: string[];
}

/**
 * Auction filters for frontend
 */
export interface AuctionFiltersFE {
  type?: AuctionType[];
  status?: AuctionStatus[];
  priceRange?: {
    min: number | null;
    max: number | null;
  };
  hasReserve?: boolean;
  hasBuyNow?: boolean;
  endingSoon?: boolean;
  search?: string;
  sortBy?: "endTime" | "currentPrice" | "totalBids" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Place bid form data
 */
export interface PlaceBidFormFE {
  amount: number;
  isAutoBid: boolean;
  maxAutoBidAmount?: number;
}

/**
 * Auction form data (for creating/updating auctions)
 */
export interface AuctionFormFE {
  productId: string;
  type: AuctionType;
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: Date;
  endTime: Date;
  autoExtend: boolean;
  extensionMinutes?: number;
  minBidIncrement: number;
}

/**
 * Auction stats for dashboard
 */
export interface AuctionStatsFE {
  totalAuctions: number;
  activeAuctions: number;
  completedAuctions: number;
  totalBids: number;
  totalRevenue: number;
  formattedRevenue: string;
  averageAuctionValue: number;
  formattedAverageValue: string;
  auctionsToday: number;
  auctionsThisWeek: number;
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

export const AUCTION_TYPE_DESCRIPTIONS: Record<AuctionType, string> = {
  [AuctionType.REGULAR]: "Price increases with each bid",
  [AuctionType.REVERSE]: "Price decreases over time",
  [AuctionType.SILENT]: "Bids are hidden from other bidders",
};

export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  [AuctionStatus.DRAFT]: "Draft",
  [AuctionStatus.SCHEDULED]: "Scheduled",
  [AuctionStatus.ACTIVE]: "Active",
  [AuctionStatus.EXTENDED]: "Extended",
  [AuctionStatus.ENDED]: "Ended",
  [AuctionStatus.CANCELLED]: "Cancelled",
  [AuctionStatus.COMPLETED]: "Completed",
};

export const AUCTION_STATUS_COLORS: Record<AuctionStatus, string> = {
  [AuctionStatus.DRAFT]: "gray",
  [AuctionStatus.SCHEDULED]: "blue",
  [AuctionStatus.ACTIVE]: "green",
  [AuctionStatus.EXTENDED]: "orange",
  [AuctionStatus.ENDED]: "purple",
  [AuctionStatus.CANCELLED]: "red",
  [AuctionStatus.COMPLETED]: "teal",
};
