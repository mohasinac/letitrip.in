/**
 * RipLimit Type Transformations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Functions to convert between Backend (BE) and Frontend (FE) RipLimit types.
 */

import {
  RipLimitBalanceFE,
  RipLimitBlockedBidFE,
  RipLimitTransactionFE,
  RipLimitTransactionHistoryFE,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS,
} from "../frontend/riplimit.types";
import { RipLimitTransactionBE } from "../backend/riplimit.types";

/**
 * Format RipLimit amount
 */
function formatRipLimit(amount: number): string {
  return `${amount.toLocaleString("en-IN")} RL`;
}

/**
 * Format INR amount
 */
function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format relative time
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Parse date from various formats
 */
function parseDate(date: unknown): Date {
  if (date instanceof Date) return date;
  if (typeof date === "string") return new Date(date);
  if (date && typeof date === "object" && "toDate" in date) {
    return (date as { toDate: () => Date }).toDate();
  }
  if (date && typeof date === "object" && "_seconds" in date) {
    return new Date((date as { _seconds: number })._seconds * 1000);
  }
  return new Date();
}

/**
 * Transform balance API response to FE type
 */
export function toFERipLimitBalance(data: {
  availableBalance: number;
  blockedBalance: number;
  totalBalance: number;
  availableBalanceINR: number;
  blockedBalanceINR: number;
  totalBalanceINR: number;
  hasUnpaidAuctions: boolean;
  unpaidAuctionIds: string[];
  isBlocked: boolean;
  blockedBids: Array<{
    auctionId: string;
    bidId: string;
    amount: number;
    bidAmountINR: number;
  }>;
}): RipLimitBalanceFE {
  const blockedBids: RipLimitBlockedBidFE[] = data.blockedBids.map((bid) => ({
    auctionId: bid.auctionId,
    bidId: bid.bidId,
    amount: bid.amount,
    formattedAmount: formatRipLimit(bid.amount),
    bidAmountINR: bid.bidAmountINR,
    formattedBidAmountINR: formatINR(bid.bidAmountINR),
  }));

  return {
    availableBalance: data.availableBalance,
    blockedBalance: data.blockedBalance,
    totalBalance: data.totalBalance,
    formattedAvailable: formatRipLimit(data.availableBalance),
    formattedBlocked: formatRipLimit(data.blockedBalance),
    formattedTotal: formatRipLimit(data.totalBalance),

    availableBalanceINR: data.availableBalanceINR,
    blockedBalanceINR: data.blockedBalanceINR,
    totalBalanceINR: data.totalBalanceINR,
    formattedAvailableINR: formatINR(data.availableBalanceINR),
    formattedBlockedINR: formatINR(data.blockedBalanceINR),
    formattedTotalINR: formatINR(data.totalBalanceINR),

    hasUnpaidAuctions: data.hasUnpaidAuctions,
    unpaidAuctionCount: data.unpaidAuctionIds.length,
    isBlocked: data.isBlocked,
    canBid: !data.isBlocked && !data.hasUnpaidAuctions,

    blockedBids,
  };
}

/**
 * Transform transaction API response to FE type
 */
export function toFERipLimitTransaction(tx: RipLimitTransactionBE): RipLimitTransactionFE {
  const createdAt = parseDate(tx.createdAt);
  const isCredit = tx.amount > 0;

  return {
    id: tx.id,
    type: tx.type,
    typeLabel: TRANSACTION_TYPE_LABELS[tx.type] || tx.type,
    amount: tx.amount,
    formattedAmount: `${isCredit ? "+" : ""}${formatRipLimit(tx.amount)}`,
    isCredit,
    inrAmount: tx.inrAmount,
    formattedINRAmount: formatINR(tx.inrAmount),
    balanceAfter: tx.balanceAfter,
    formattedBalanceAfter: formatRipLimit(tx.balanceAfter),
    description: tx.description,
    auctionId: tx.auctionId,
    orderId: tx.orderId,
    status: tx.status,
    statusLabel: TRANSACTION_STATUS_LABELS[tx.status] || tx.status,
    createdAt,
    formattedDate: formatDate(createdAt),
    timeAgo: formatTimeAgo(createdAt),
  };
}

/**
 * Transform transaction history API response to FE type
 */
export function toFERipLimitTransactionHistory(data: {
  transactions: RipLimitTransactionBE[];
  total: number;
}, limit: number = 20, offset: number = 0): RipLimitTransactionHistoryFE {
  return {
    transactions: data.transactions.map(toFERipLimitTransaction),
    total: data.total,
    hasMore: offset + data.transactions.length < data.total,
  };
}

/**
 * Create empty balance for loading states
 */
export function createEmptyBalance(): RipLimitBalanceFE {
  return {
    availableBalance: 0,
    blockedBalance: 0,
    totalBalance: 0,
    formattedAvailable: "0 RL",
    formattedBlocked: "0 RL",
    formattedTotal: "0 RL",
    availableBalanceINR: 0,
    blockedBalanceINR: 0,
    totalBalanceINR: 0,
    formattedAvailableINR: "₹0",
    formattedBlockedINR: "₹0",
    formattedTotalINR: "₹0",
    hasUnpaidAuctions: false,
    unpaidAuctionCount: 0,
    isBlocked: false,
    canBid: true,
    blockedBids: [],
  };
}
