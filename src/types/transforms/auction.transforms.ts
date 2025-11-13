/**
 * AUCTION TYPE TRANSFORMATIONS
 */

import { Timestamp } from "firebase/firestore";
import {
  AuctionBE,
  AuctionListItemBE,
  BidBE,
  CreateAuctionRequestBE,
  PlaceBidRequestBE,
} from "../backend/auction.types";
import {
  AuctionFE,
  AuctionCardFE,
  BidFE,
  PlaceBidFormFE,
} from "../frontend/auction.types";
import { AuctionStatus, AuctionType } from "../shared/common.types";

function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatTimeRemaining(endTime: Date): {
  display: string;
  seconds: number;
} {
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

function generateAuctionBadges(
  auctionBE: AuctionBE,
  timeRemainingSeconds: number
): string[] {
  const badges: string[] = [];

  if (auctionBE.status === AuctionStatus.ACTIVE) badges.push("Live");
  if (timeRemainingSeconds > 0 && timeRemainingSeconds < 3600)
    badges.push("Ending Soon");
  if (auctionBE.totalBids > 50) badges.push("Hot");
  if (auctionBE.reserveMet) badges.push("Reserve Met");
  if (auctionBE.buyNowPrice) badges.push("Buy Now Available");
  if (auctionBE.type === AuctionType.SILENT) badges.push("Silent");

  return badges;
}

export function toFEBid(
  bidBE: BidBE,
  currentUserId?: string,
  highestBidId?: string
): BidFE {
  const createdAt = parseDate(bidBE.createdAt)!;
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

  return {
    ...bidBE,
    createdAt,
    formattedAmount: formatPrice(bidBE.amount),
    timeAgo:
      diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`,
    isHighest: bidBE.id === highestBidId,
    isYourBid: bidBE.userId === currentUserId,
  };
}

export function toFEAuction(
  auctionBE: AuctionBE,
  currentUserId?: string
): AuctionFE {
  const startTime = parseDate(auctionBE.startTime)!;
  const endTime = parseDate(auctionBE.endTime)!;
  const createdAt = parseDate(auctionBE.createdAt)!;
  const updatedAt = parseDate(auctionBE.updatedAt)!;

  const { display: timeRemaining, seconds: timeRemainingSeconds } =
    formatTimeRemaining(endTime);
  const now = new Date();

  return {
    id: auctionBE.id,
    productId: auctionBE.productId,
    productName: auctionBE.productName,
    productSlug: auctionBE.productSlug,
    productImage: auctionBE.productImage,
    productDescription: auctionBE.productDescription,
    sellerId: auctionBE.sellerId,
    sellerName: auctionBE.sellerName,
    shopId: auctionBE.shopId,
    shopName: auctionBE.shopName,
    type: auctionBE.type,
    status: auctionBE.status,
    startingPrice: auctionBE.startingPrice,
    reservePrice: auctionBE.reservePrice,
    currentPrice: auctionBE.currentPrice,
    buyNowPrice: auctionBE.buyNowPrice,
    formattedStartingPrice: formatPrice(auctionBE.startingPrice),
    formattedReservePrice: auctionBE.reservePrice
      ? formatPrice(auctionBE.reservePrice)
      : null,
    formattedCurrentPrice: formatPrice(auctionBE.currentPrice),
    formattedBuyNowPrice: auctionBE.buyNowPrice
      ? formatPrice(auctionBE.buyNowPrice)
      : null,
    bidIncrement: auctionBE.bidIncrement,
    minimumBid: auctionBE.minimumBid,
    totalBids: auctionBE.totalBids,
    uniqueBidders: auctionBE.uniqueBidders,
    highestBidderId: auctionBE.highestBidderId,
    highestBidderName: auctionBE.highestBidderName,
    formattedBidIncrement: formatPrice(auctionBE.bidIncrement),
    formattedMinimumBid: formatPrice(auctionBE.minimumBid),
    hasAutoBid: auctionBE.hasAutoBid,
    autoBidMaxAmount: auctionBE.autoBidMaxAmount,
    startTime,
    endTime,
    duration: auctionBE.duration,
    startTimeDisplay: startTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    endTimeDisplay: endTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    timeRemaining,
    timeRemainingSeconds,
    durationDisplay: `${Math.floor(auctionBE.duration / 86400)} days`,
    allowExtension: auctionBE.allowExtension,
    extensionTime: auctionBE.extensionTime,
    timesExtended: auctionBE.timesExtended,
    isActive: auctionBE.isActive,
    isEnded: auctionBE.isEnded,
    hasBids: auctionBE.hasBids,
    hasWinner: auctionBE.hasWinner,
    winnerId: auctionBE.winnerId,
    winnerName: auctionBE.winnerName,
    winningBid: auctionBE.winningBid,
    formattedWinningBid: auctionBE.winningBid
      ? formatPrice(auctionBE.winningBid)
      : null,
    isUpcoming: now < startTime,
    isLive: auctionBE.status === AuctionStatus.ACTIVE,
    isEndingSoon: timeRemainingSeconds > 0 && timeRemainingSeconds < 3600,
    canBid: auctionBE.isActive && auctionBE.sellerId !== currentUserId,
    canBuyNow: auctionBE.isActive && !!auctionBE.buyNowPrice,
    isYourAuction: auctionBE.sellerId === currentUserId,
    isYouWinning: auctionBE.highestBidderId === currentUserId,
    isYouWinner: auctionBE.winnerId === currentUserId,
    reserveMet: auctionBE.reserveMet,
    reserveStatus: !auctionBE.reservePrice
      ? "No reserve"
      : auctionBE.reserveMet
      ? "Reserve met"
      : "Reserve not met",
    priceProgress: auctionBE.buyNowPrice
      ? ((auctionBE.currentPrice - auctionBE.startingPrice) /
          (auctionBE.buyNowPrice - auctionBE.startingPrice)) *
        100
      : 0,
    bidProgress: Math.min((auctionBE.totalBids / 100) * 100, 100),
    timeProgress:
      ((now.getTime() - startTime.getTime()) /
        (endTime.getTime() - startTime.getTime())) *
      100,
    badges: generateAuctionBadges(auctionBE, timeRemainingSeconds),
    createdAt,
    updatedAt,
    metadata: auctionBE.metadata,
  };
}

export function toFEAuctionCard(auctionBE: AuctionListItemBE): AuctionCardFE {
  const endTime = parseDate(auctionBE.endTime)!;
  const { display: timeRemaining, seconds: timeRemainingSeconds } =
    formatTimeRemaining(endTime);

  return {
    id: auctionBE.id,
    productId: auctionBE.productId,
    productName: auctionBE.productName,
    productSlug: auctionBE.productSlug,
    productImage: auctionBE.productImage,
    type: auctionBE.type,
    status: auctionBE.status,
    currentPrice: auctionBE.currentPrice,
    formattedCurrentPrice: formatPrice(auctionBE.currentPrice),
    buyNowPrice: auctionBE.buyNowPrice,
    formattedBuyNowPrice: auctionBE.buyNowPrice
      ? formatPrice(auctionBE.buyNowPrice)
      : null,
    totalBids: auctionBE.totalBids,
    endTime,
    timeRemaining,
    timeRemainingSeconds,
    isActive: auctionBE.isActive,
    isEndingSoon: timeRemainingSeconds > 0 && timeRemainingSeconds < 3600,
    badges: auctionBE.status === AuctionStatus.ACTIVE ? ["Live"] : [],
  };
}

export function toBECreateAuctionRequest(
  formData: any
): CreateAuctionRequestBE {
  return {
    productId: formData.productId,
    type: formData.type,
    startingPrice: formData.startingPrice,
    reservePrice: formData.reservePrice,
    buyNowPrice: formData.buyNowPrice,
    bidIncrement: formData.bidIncrement,
    startTime: formData.startTime.toISOString(),
    endTime: formData.endTime.toISOString(),
    allowExtension: formData.allowExtension,
    extensionTime: formData.extensionTime,
  };
}

export function toBEPlaceBidRequest(
  formData: PlaceBidFormFE
): PlaceBidRequestBE {
  return {
    amount: formData.amount,
    isAutoBid: formData.isAutoBid,
    maxAutoBidAmount: formData.maxAutoBidAmount,
  };
}

export function toFEAuctions(
  auctionsBE: AuctionBE[],
  currentUserId?: string
): AuctionFE[] {
  return auctionsBE.map((a) => toFEAuction(a, currentUserId));
}

export function toFEAuctionCards(
  auctionsBE: AuctionListItemBE[]
): AuctionCardFE[] {
  return auctionsBE.map(toFEAuctionCard);
}
