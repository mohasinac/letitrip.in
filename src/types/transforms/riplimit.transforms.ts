/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/riplimit.transforms
 * @description This file contains functionality related to riplimit.transforms
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * Formats rip limit
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatriplimit result
 */

/**
 * Formats rip limit
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatriplimit result
 */

function formatRipLimit(amount: number): string {
  return `${amount.toLocaleString("en-IN")} RL`;
}

/**
 * Format INR amount
 */
/**
 * Formats i n r
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatinr result
 */

/**
 * Formats i n r
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatinr result
 */

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    /** Style */
    style: "currency",
    /** Currency */
    currency: "INR",
    /** Maximum Fraction Digits */
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format relative time
 */
/**
 * Formats time ago
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formattimeago result
 */

/**
 * Formats time ago
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formattimeago result
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
/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    /** Day */
    day: "numeric",
    /** Month */
    month: "short",
    /** Year */
    year: "numeric",
    /** Hour */
    hour: "2-digit",
    /** Minute */
    minute: "2-digit",
  }).format(date);
}

/**
 * Parse date from various formats
 */
/**
 * Parses date
 *
 * @param {unknown} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {unknown} date - The date
 *
 * @returns {any} The parsedate result
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
/**
 * Performs to f e rip limit balance operation
 *
 * @returns {number} The toferiplimitbalance result
 *
 * @example
 * toFERipLimitBalance();
 */

/**
 * Performs to f e rip limit balance operation
 *
 * @returns {number} The toferiplimitbalance result
 *
 * @example
 * toFERipLimitBalance();
 */

export function toFERipLimitBalance(data: {
  /** Available Balance */
  availableBalance: number;
  /** Blocked Balance */
  blockedBalance: number;
  /** Total Balance */
  totalBalance: number;
  /** Available Balance I N R */
  availableBalanceINR: number;
  /** Blocked Balance I N R */
  blockedBalanceINR: number;
  /** Total Balance I N R */
  totalBalanceINR: number;
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: boolean;
  /** Unpaid Auction Ids */
  unpaidAuctionIds: string[];
  /** Is Blocked */
  isBlocked: boolean;
  /** Blocked Bids */
  blockedBids: Array<{
    /** Auction Id */
    auctionId: string;
    /** Bid Id */
    bidId: string;
    /** Amount */
    amount: number;
    /** Bid Amount I N R */
    bidAmountINR: number;
  }>;
}): RipLimitBalanceFE {
  /**
 * Performs blocked bids operation
 *
 * @param {any} (bid - The (bid
 *
 * @returns {any} The blockedbids result
 *
 */
const blockedBids: RipLimitBlockedBidFE[] = data.blockedBids.map((bid) => ({
    /** Auction Id */
    auctionId: bid.auctionId,
    /** Bid Id */
    bidId: bid.bidId,
    /** Amount */
    amount: bid.amount,
    /** Formatted Amount */
    formattedAmount: formatRipLimit(bid.amount),
    /** Bid Amount I N R */
    bidAmountINR: bid.bidAmountINR,
    /** Formatted Bid Amount I N R */
    formattedBidAmountINR: formatINR(bid.bidAmountINR),
  }));

  return {
    /** Available Balance */
    availableBalance: data.availableBalance,
    /** Blocked Balance */
    blockedBalance: data.blockedBalance,
    /** Total Balance */
    totalBalance: data.totalBalance,
    /** Formatted Available */
    formattedAvailable: formatRipLimit(data.availableBalance),
    /** Formatted Blocked */
    formattedBlocked: formatRipLimit(data.blockedBalance),
    /** Formatted Total */
    formattedTotal: formatRipLimit(data.totalBalance),

    /** Available Balance I N R */
    availableBalanceINR: data.availableBalanceINR,
    /** Blocked Balance I N R */
    blockedBalanceINR: data.blockedBalanceINR,
    /** Total Balance I N R */
    totalBalanceINR: data.totalBalanceINR,
    /** Formatted Available I N R */
    formattedAvailableINR: formatINR(data.availableBalanceINR),
    /** Formatted Blocked I N R */
    formattedBlockedINR: formatINR(data.blockedBalanceINR),
    /** Formatted Total I N R */
    formattedTotalINR: formatINR(data.totalBalanceINR),

    /** Has Unpaid Auctions */
    hasUnpaidAuctions: data.hasUnpaidAuctions,
    /** Unpaid Auction Count */
    unpaidAuctionCount: data.unpaidAuctionIds.length,
    /** Is Blocked */
    isBlocked: data.isBlocked,
    /** Can Bid */
    canBid: !data.isBlocked && !data.hasUnpaidAuctions,

    blockedBids,
  };
}

/**
 * Transform transaction API response to FE type
 */
/**
 * Performs to f e rip limit transaction operation
 *
 * @param {RipLimitTransactionBE} tx - The tx
 *
 * @returns {any} The toferiplimittransaction result
 *
 * @example
 * toFERipLimitTransaction(tx);
 */

/**
 * Performs to f e rip limit transaction operation
 *
 * @param {RipLimitTransactionBE} /** Tx */
  tx - The /**  tx */
  tx
 *
 * @returns {any} The toferiplimittransaction result
 *
 * @example
 * toFERipLimitTransaction(/** Tx */
  tx);
 */

/**
 * Performs to f e rip limit transaction operation
 *
 * @param {RipLimitTransactionBE} tx - The tx
 *
 * @returns {RipLimitTransactionFE} The toferiplimittransaction result
 *
 * @example
 * toFERipLimitTransaction(tx);
 */
export function toFERipLimitTransaction(
  /** Tx */
  tx: RipLimitTransactionBE,
): RipLimitTransactionFE {
  const createdAt = parseDate(tx.createdAt);
  const isCredit = tx.amount > 0;

  return {
    /** Id */
    id: tx.id,
    /** Type */
    type: tx.type,
    /** Type Label */
    typeLabel: TRANSACTION_TYPE_LABELS[tx.type] || tx.type,
    /** Amount */
    amount: tx.amount,
    /** Formatted Amount */
    formattedAmount: `${isCredit ? "+" : ""}${formatRipLimit(tx.amount)}`,
    isCredit,
    /** Inr Amount */
    inrAmount: tx.inrAmount,
    /** Formatted I N R Amount */
    formattedINRAmount: formatINR(tx.inrAmount),
    /** Balance After */
    balanceAfter: tx.balanceAfter,
    /** Formatted Balance After */
    formattedBalanceAfter: formatRipLimit(tx.balanceAfter),
    /** Description */
    description: tx.description,
    /** Auction Id */
    auctionId: tx.auctionId,
    /** Order Id */
    orderId: tx.orderId,
    /** Status */
    status: tx.status,
    /** Status Label */
    statusLabel: TRANSACTION_STATUS_LABELS[tx.status] || tx.status,
    createdAt,
    /** Formatted Date */
    formattedDate: formatDate(createdAt),
    /** Time Ago */
    timeAgo: formatTimeAgo(createdAt),
  };
}

/**
 * Transform transaction history API response to FE type
 */
/**
 * Performs to f e rip limit transaction history operation
 *
 * @returns {number} The toferiplimittransactionhistory result
 *
 * @example
 * toFERipLimitTransactionHistory();
 */

/**
 * Performs to f e rip limit transaction history operation
 *
 * @returns {any} The toferiplimittransactionhistory result
 *
 * @example
 * toFERipLimitTransactionHistory();
 */

export function toFERipLimitTransactionHistory(
  /** Data */
  data: {
    /** Transactions */
    transactions: RipLimitTransactionBE[];
    /** Total */
    total: number;
  },
  /** Limit */
  limit: number = 20,
  /** Offset */
  offset: number = 0,
): RipLimitTransactionHistoryFE {
  return {
    /** Transactions */
    transactions: data.transactions.map(toFERipLimitTransaction),
    /** Total */
    total: data.total,
    /** Has More */
    hasMore: offset + data.transactions.length < data.total,
  };
}

/**
 * Create empty balance for loading states
 */
/**
 * Creates a new empty balance
 *
 * @returns {any} The emptybalance result
 *
 * @example
 * createEmptyBalance();
 */

/**
 * Creates a new empty balance
 *
 * @returns {any} The emptybalance result
 *
 * @example
 * createEmptyBalance();
 */

export function createEmptyBalance(): RipLimitBalanceFE {
  return {
    /** Available Balance */
    availableBalance: 0,
    /** Blocked Balance */
    blockedBalance: 0,
    /** Total Balance */
    totalBalance: 0,
    /** Formatted Available */
    formattedAvailable: "0 RL",
    /** Formatted Blocked */
    formattedBlocked: "0 RL",
    /** Formatted Total */
    formattedTotal: "0 RL",
    /** Available Balance I N R */
    availableBalanceINR: 0,
    /** Blocked Balance I N R */
    blockedBalanceINR: 0,
    /** Total Balance I N R */
    totalBalanceINR: 0,
    /** Formatted Available I N R */
    formattedAvailableINR: "₹0",
    /** Formatted Blocked I N R */
    formattedBlockedINR: "₹0",
    /** Formatted Total I N R */
    formattedTotalINR: "₹0",
    /** Has Unpaid Auctions */
    hasUnpaidAuctions: false,
    /** Unpaid Auction Count */
    unpaidAuctionCount: 0,
    /** Is Blocked */
    isBlocked: false,
    /** Can Bid */
    canBid: true,
    /** Blocked Bids */
    blockedBids: [],
  };
}
