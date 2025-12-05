/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/auction.transforms
 * @description This file contains functionality related to auction.transforms
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * AUCTION TYPE TRANSFORMATIONS
 */

import { safeToISOString } from "@/lib/date-utils";
import { formatDate } from "@/lib/formatters";
import { formatPrice } from "@/lib/price.utils";
import { Timestamp } from "firebase/firestore";
import {
  AuctionBE,
  AuctionListItemBE,
  BidBE,
  CreateAuctionRequestBE,
  PlaceBidRequestBE,
} from "../backend/auction.types";
import {
  AuctionCardFE,
  AuctionFE,
  BidFE,
  PlaceBidFormFE,
} from "../frontend/auction.types";
import { AuctionStatus, AuctionType } from "../shared/common.types";

/**
 * Function: Parse Date
 */
/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

/**
 * Function: Format Time Remaining
 */
/**
 * Formats time remaining
 *
 * @param {Date | null} endTime - The end time
 *
 * @returns {string} The formattimeremaining result
 */

/**
 * Formats time remaining
 *
 * @param {Date | null} endTime - The end time
 *
 * @returns {string} The formattimeremaining result
 */

function formatTimeRemaining(endTime: Date | null): {
  /** Display */
  display: string;
  /** Seconds */
  seconds: number;
} {
  if (!endTime) return { display: "Ended", seconds: 0 };

  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds <= 0) return { display: "Ended", seconds: 0 };

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return { display: `${days}d ${hours}h`, seconds };
  if (hours > 0) return { display: `${hours}h ${minutes}m`, seconds };
  return { display: `${minutes}m`, seconds };
}

/**
 * Function: Generate Auction Badges
 */
/**
 * Performs generate auction badges operation
 *
 * @param {AuctionBE} auctionBE - The auction b e
 * @param {number} timeRemainingSeconds - The time remaining seconds
 *
 * @returns {string} The auctionbadges result
 */

/**
 * Performs generate auction badges operation
 *
 * @returns {number} The auctionbadges result
 */

function generateAuctionBadges(
  /** Auction B E */
  auctionBE: AuctionBE,
  /** Time Remaining Seconds */
  timeRemainingSeconds: number
): string[] {
  const badges: string[] = [];

  // Check if auction is truly active (status is active AND time remaining)
  if (auctionBE.status === AuctionStatus.ACTIVE && timeRemainingSeconds > 0) {
    badges.push("Live");
  }
  if (timeRemainingSeconds > 0 && timeRemainingSeconds < 3600)
    badges.push("Ending Soon");
  if (auctionBE.totalBids > 50) badges.push("Hot");
  if (auctionBE.reserveMet) badges.push("Reserve Met");
  if (auctionBE.buyNowPrice) badges.push("Buy Now Available");
  if (auctionBE.type === AuctionType.SILENT) badges.push("Silent");

  return badges;
}

/**
 * Function: To F E Bid
 */
/**
 * Performs to f e bid operation
 *
 * @param {BidBE} bidBE - The bid b e
 * @param {string} [currentUserId] - currentUser identifier
 * @param {string} [highestBidId] - highestBid identifier
 *
 * @returns {string} The tofebid result
 *
 * @example
 * toFEBid(bidBE, "example", "example");
 */

/**
 * Performs to f e bid operation
 *
 * @returns {string} The tofebid result
 *
 * @example
 * toFEBid();
 */

export function toFEBid(
  /** Bid B E */
  bidBE: BidBE,
  /** Current User Id */
  currentUserId?: string,
  /** Highest Bid Id */
  highestBidId?: string
): BidFE {
  const createdAt = parseDate(bidBE.createdAt) || new Date();
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

  return {
    ...bidBE,
    createdAt,
    /** Formatted Amount */
    formattedAmount: formatPrice(bidBE.amount),
    /** Time Ago */
    timeAgo:
      diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`,
    /** Is Highest */
    isHighest: bidBE.id === highestBidId,
    /** Is Your Bid */
    isYourBid: bidBE.userId === currentUserId,
    // Backwards compatibility
    /** Bid Time */
    bidTime: createdAt,
    /** Bid Amount */
    bidAmount: bidBE.amount,
  };
}

/**
 * Function: To F E Auction
 */
/**
 * Performs to f e auction operation
 *
 * @param {AuctionBE} auctionBE - The auction b e
 * @param {string} [currentUserId] - currentUser identifier
 *
 * @returns {string} The tofeauction result
 *
 * @example
 * toFEAuction(auctionBE, "example");
 */

/**
 * Performs to f e auction operation
 *
 * @returns {string} The tofeauction result
 *
 * @example
 * toFEAuction();
 */

export function toFEAuction(
  /** Auction B E */
  auctionBE: AuctionBE,
  /** Current User Id */
  currentUserId?: string
): AuctionFE {
  const startTime = parseDate(auctionBE.startTime) || new Date();
  const endTime = parseDate(auctionBE.endTime) || new Date();
  const createdAt = parseDate(auctionBE.createdAt) || new Date();
  const updatedAt = parseDate(auctionBE.updatedAt) || new Date();

  const { display: timeRemaining, seconds: timeRemainingSeconds } =
    formatTimeRemaining(endTime);
  const now = new Date();

  return {
    /** Id */
    id: auctionBE.id,
    /** Product Id */
    productId: auctionBE.productId,
    /** Product Name */
    productName: auctionBE.productName,
    /** Product Slug */
    productSlug: auctionBE.productSlug,
    /** Product Image */
    productImage: auctionBE.productImage,
    /** Product Description */
    productDescription: auctionBE.productDescription,
    /** Seller Id */
    sellerId: auctionBE.sellerId,
    /** Seller Name */
    sellerName: auctionBE.sellerName,
    /** Shop Id */
    shopId: auctionBE.shopId,
    /** Shop Name */
    shopName: auctionBE.shopName,
    /** Type */
    type: auctionBE.type,
    /** Status */
    status: auctionBE.status,
    /** Starting Price */
    startingPrice: auctionBE.startingPrice,
    /** Reserve Price */
    reservePrice: auctionBE.reservePrice,
    /** Current Price */
    currentPrice: auctionBE.currentPrice,
    /** Buy Now Price */
    buyNowPrice: auctionBE.buyNowPrice,
    /** Formatted Starting Price */
    formattedStartingPrice: formatPrice(auctionBE.startingPrice),
    /** Formatted Reserve Price */
    formattedReservePrice: auctionBE.reservePrice
      ? formatPrice(auctionBE.reservePrice)
      : null,
    /** Formatted Current Price */
    formattedCurrentPrice: formatPrice(auctionBE.currentPrice),
    /** Formatted Buy Now Price */
    formattedBuyNowPrice: auctionBE.buyNowPrice
      ? formatPrice(auctionBE.buyNowPrice)
      : null,
    /** Bid Increment */
    bidIncrement: auctionBE.bidIncrement,
    /** Minimum Bid */
    minimumBid: auctionBE.minimumBid,
    /** Total Bids */
    totalBids: auctionBE.totalBids,
    /** Unique Bidders */
    uniqueBidders: auctionBE.uniqueBidders,
    /** Highest Bidder Id */
    highestBidderId: auctionBE.highestBidderId,
    /** Highest Bidder Name */
    highestBidderName: auctionBE.highestBidderName,
    /** Formatted Bid Increment */
    formattedBidIncrement: formatPrice(auctionBE.bidIncrement),
    /** Formatted Minimum Bid */
    formattedMinimumBid: formatPrice(auctionBE.minimumBid),
    /** Has Auto Bid */
    hasAutoBid: auctionBE.hasAutoBid,
    /** Auto Bid Max Amount */
    autoBidMaxAmount: auctionBE.autoBidMaxAmount,
    startTime,
    endTime,
    /** Duration */
    duration: auctionBE.duration,
    /** Start Time Display */
    startTimeDisplay: startTime
      ? formatDate(startTime, { format: "medium", includeTime: true })
      : "Not started",
    /** End Time Display */
    endTimeDisplay: endTime
      ? formatDate(endTime, { format: "medium", includeTime: true })
      : "Ended",
    timeRemaining,
    timeRemainingSeconds,
    /** Duration Display */
    durationDisplay: `${Math.floor(auctionBE.duration / 86400)} days`,
    /** Allow Extension */
    allowExtension: auctionBE.allowExtension,
    /** Extension Time */
    extensionTime: auctionBE.extensionTime,
    /** Times Extended */
    timesExtended: auctionBE.timesExtended,
    /** Is Active */
    isActive: auctionBE.isActive && timeRemainingSeconds > 0,
    /** Is Ended */
    isEnded: auctionBE.isEnded || timeRemainingSeconds <= 0,
    /** Has Bids */
    hasBids: auctionBE.hasBids,
    /** Has Winner */
    hasWinner: auctionBE.hasWinner,
    /** Winner Id */
    winnerId: auctionBE.winnerId,
    /** Winner Name */
    winnerName: auctionBE.winnerName,
    /** Winning Bid */
    winningBid: auctionBE.winningBid,
    /** Formatted Winning Bid */
    formattedWinningBid: auctionBE.winningBid
      ? formatPrice(auctionBE.winningBid)
      : null,
    /** Is Upcoming */
    isUpcoming: now < startTime,
    /** Is Live */
    isLive:
      auctionBE.status === AuctionStatus.ACTIVE && timeRemainingSeconds > 0,
    /** Is Ending Soon */
    isEndingSoon: timeRemainingSeconds > 0 && timeRemainingSeconds < 3600,
    /** Can Bid */
    canBid:
      auctionBE.isActive &&
      timeRemainingSeconds > 0 &&
      auctionBE.sellerId !== currentUserId,
    /** Can Buy Now */
    canBuyNow:
      auctionBE.isActive && timeRemainingSeconds > 0 && !!auctionBE.buyNowPrice,
    /** Is Your Auction */
    isYourAuction: auctionBE.sellerId === currentUserId,
    /** Is You Winning */
    isYouWinning: auctionBE.highestBidderId === currentUserId,
    /** Is You Winner */
    isYouWinner: auctionBE.winnerId === currentUserId,
    /** Reserve Met */
    reserveMet: auctionBE.reserveMet,
    /** Reserve Status */
    reserveStatus: !auctionBE.reservePrice
      ? "No reserve"
      : auctionBE.reserveMet
      ? "Reserve met"
      : "Reserve not met",
    /** Price Progress */
    priceProgress: auctionBE.buyNowPrice
      ? ((auctionBE.currentPrice - auctionBE.startingPrice) /
          (auctionBE.buyNowPrice - auctionBE.startingPrice)) *
        100
      : 0,
    /** Bid Progress */
    bidProgress: Math.min((auctionBE.totalBids / 100) * 100, 100),
    /** Time Progress */
    timeProgress:
      ((now.getTime() - startTime.getTime()) /
        (endTime.getTime() - startTime.getTime())) *
      100,
    /** Badges */
    badges: generateAuctionBadges(auctionBE, timeRemainingSeconds),
    createdAt,
    updatedAt,
    /** Metadata */
    metadata: auctionBE.metadata,
    // Backwards compatibility aliases
    /** Current Bid */
    currentBid: auctionBE.currentPrice,
    /** Name */
    name: auctionBE.productName,
    /** Images */
    images:
      auctionBE.images && auctionBE.images.length > 0
        ? auctionBE.images
        : [auctionBE.productImage],
    /** Videos */
    videos: auctionBE.videos || [],
    /** Description */
    description: auctionBE.productDescription,
    /** Featured */
    featured:
      (auctionBE.metadata as any)?.featured ||
      (auctionBE.metadata as any)?.featured ||
      false,
    /** Bid Count */
    bidCount: auctionBE.totalBids,
  };
}

/**
 * Function: To F E Auction Card
 */
/**
 * Performs to f e auction card operation
 *
 * @param {AuctionListItemBE} auctionBE - The auction b e
 *
 * @returns {any} The tofeauctioncard result
 *
 * @example
 * toFEAuctionCard(auctionBE);
 */

/**
 * Performs to f e auction card operation
 *
 * @param {AuctionListItemBE} auctionBE - The auction b e
 *
 * @returns {any} The tofeauctioncard result
 *
 * @example
 * toFEAuctionCard(auctionBE);
 */

export function toFEAuctionCard(auctionBE: AuctionListItemBE): AuctionCardFE {
  const endTime = parseDate(auctionBE.endTime) || new Date();
  const { display: timeRemaining, seconds: timeRemainingSeconds } =
    formatTimeRemaining(endTime);

  return {
    /** Id */
    id: auctionBE.id,
    /** Product Id */
    productId: auctionBE.productId,
    /** Product Name */
    productName: auctionBE.productName,
    /** Product Slug */
    productSlug: auctionBE.productSlug,
    /** Product Image */
    productImage: auctionBE.productImage,
    /** Type */
    type: auctionBE.type,
    /** Status */
    status: auctionBE.status,
    /** Current Price */
    currentPrice: auctionBE.currentPrice,
    /** Formatted Current Price */
    formattedCurrentPrice: formatPrice(auctionBE.currentPrice),
    /** Buy Now Price */
    buyNowPrice: auctionBE.buyNowPrice,
    /** Formatted Buy Now Price */
    formattedBuyNowPrice: auctionBE.buyNowPrice
      ? formatPrice(auctionBE.buyNowPrice)
      : null,
    /** Total Bids */
    totalBids: auctionBE.totalBids,
    endTime,
    timeRemaining,
    timeRemainingSeconds,
    /** Is Active */
    isActive: auctionBE.isActive && timeRemainingSeconds > 0,
    /** Is Ending Soon */
    isEndingSoon: timeRemainingSeconds > 0 && timeRemainingSeconds < 3600,
    /** Badges */
    badges:
      auctionBE.status === AuctionStatus.ACTIVE && timeRemainingSeconds > 0
        ? ["Live"]
        : [],
    // Backwards compatibility
    /** Slug */
    slug: auctionBE.slug || auctionBE.productSlug,
    /** Name */
    name: auctionBE.productName,
    /** Images */
    images:
      auctionBE.images && auctionBE.images.length > 0
        ? auctionBE.images
        : [auctionBE.productImage],
    /** Videos */
    videos: auctionBE.videos || [],
    /** Current Bid */
    currentBid: auctionBE.currentPrice,
    /** Bid Count */
    bidCount: auctionBE.totalBids,
    // Admin fields not available in list response, will be undefined
    /** Starting Bid */
    startingBid: undefined,
    /** Reserve Price */
    reservePrice: undefined,
    /** Start Time */
    startTime: undefined,
    /** Shop Id */
    shopId: undefined,
    /** Featured */
    featured: false,
  };
}

/**
 * Function: To B E Create Auction Request
 */
/**
 * Performs to b e create auction request operation
 *
 * @param {any} formData - The form data
 *
 * @returns {any} The tobecreateauctionrequest result
 *
 * @example
 * toBECreateAuctionRequest(formData);
 */

/**
 * Performs to b e create auction request operation
 *
 * @param {any} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreateauctionrequest result
 *
 * @example
 * toBECreateAuctionRequest(/** Form Data */
  formData);
 */

/**
 * Performs to b e create auction request operation
 *
 * @param {any} formData - The formdata
 *
 * @returns {CreateAuctionRequestBE} The tobecreateauctionrequest result
 *
 * @example
 * toBECreateAuctionRequest(formData);
 */
export function toBECreateAuctionRequest(
  /** Form Data */
  formData: any
): CreateAuctionRequestBE {
  return {
    /** Product Id */
    productId: formData.productId,
    /** Type */
    type: formData.type,
    /** Starting Price */
    startingPrice: formData.startingPrice,
    /** Reserve Price */
    reservePrice: formData.reservePrice,
    /** Buy Now Price */
    buyNowPrice: formData.buyNowPrice,
    /** Bid Increment */
    bidIncrement: formData.bidIncrement,
    /** Start Time */
    startTime: safeToISOString(formData.startTime) || new Date().toISOString(),
    /** End Time */
    endTime: safeToISOString(formData.endTime) || new Date().toISOString(),
    /** Allow Extension */
    allowExtension: formData.allowExtension,
    /** Extension Time */
    extensionTime: formData.extensionTime,
  };
}

/**
 * Function: To B E Place Bid Request
 */
/**
 * Performs to b e place bid request operation
 *
 * @param {PlaceBidFormFE} formData - The form data
 *
 * @returns {any} The tobeplacebidrequest result
 *
 * @example
 * toBEPlaceBidRequest(formData);
 */

/**
 * Performs to b e place bid reque/**
 * Performs to b e place bid request operation
 *
 * @param {PlaceBidFormFE} formData - The formdata
 *
 * @returns {PlaceBidRequestBE} The tobeplacebidrequest result
 *
 * @example
 * toBEPlaceBidRequest(formData);
 */
st operation
 *
 * @param {PlaceBidFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobeplacebidrequest result
 *
 * @example
 * toBEPlaceBidRequest(/** Form Data */
  formData);
 */

export function toBEPlaceBidRequest(
  /** Form Data */
  formData: PlaceBidFormFE
): PlaceBidRequestBE {
  return {
    /** Amount */
    amount: formData.amount,
    /** Is Auto Bid */
    isAutoBid: formData.isAutoBid,
    /** Max Auto Bid Amount */
    maxAutoBidAmount: formData.maxAutoBidAmount,
  };
}

/**
 * Function: To F E Auctions
 */
/**
 * Performs to f e auctions operation
 *
 * @param {AuctionBE[]} auctionsBE - The auctions b e
 * @param {string} [currentUserId] - currentUser identifier
 *
 * @returns {string} The tofeauctions result
 *
 * @example
 * toFEAuctions(auctionsBE, "example");
 */

/**
 * Performs to f e auctions operation
 *
 * @returns {string} The tofeauctions result
 *
 * @example
 * toFEAuctions();
 */

export function toFEAuctions(
  /** Auctions B E */
  auctionsBE: AuctionBE[],
  /** Current User Id */
  currentUserId?: string
): AuctionFE[] {
  return auctionsBE.map((a) => toFEAuction(a, currentUserId));
}

/**
 * Function: To F E Auction Cards
 */
/**
 * Performs to f e auction cards ope/**
 * Performs to f e auction cards operation
 *
 * @param {AuctionListItemBE[]} auctionsBE - The auctionsbe
 *
 * @returns {AuctionCardFE[]} The tofeauctioncards result
 *
 * @example
 * toFEAuctionCards([]);
 */
ration
 *
 * @param {AuctionListItemBE[]} auctionsBE - The auctions b e
 *
 * @returns {any} The tofeauctioncards result
 *
 * @example
 * toFEAuctionCards(auctionsBE);
 */

/**
 * Performs to f e auction cards operation
 *
 * @param {AuctionListItemBE[]} /** Auctions B E */
  auctionsBE - The /**  auctions  b  e */
  auctions b e
 *
 * @returns {any} The tofeauctioncards result
 *
 * @example
 * toFEAuctionCards(/** Auctions B E */
  auctionsBE);
 */

export function toFEAuctionCards(
  /** Auctions B E */
  auctionsBE: AuctionListItemBE[]
): AuctionCardFE[] {
  return auctionsBE.map(toFEAuctionCard);
}
