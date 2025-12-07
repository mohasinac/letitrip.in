/**
 * RipLimit Type Transformations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Functions to convert between Backend (BE) and Frontend (FE) RipLimit types.
 */

import { parseDateOrDefault as parseDate } from "@/lib/date-utils";
import { formatDate, formatRelativeTime } from "@/lib/formatters";
import { formatPrice as formatINR } from "@/lib/price.utils";
import { RipLimitTransactionBE } from "../backend/riplimit.types";
import {
  RipLimitBalanceFE,
  RipLimitBlockedBidFE,
  RipLimitTransactionFE,
  RipLimitTransactionHistoryFE,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "../frontend/riplimit.types";

/**
 * Format RipLimit amount
 */
function formatRipLimit(amount: number): string {
  return `${amount.toLocaleString("en-IN")} RL`;
}

/**
 * Format relative time with short style for RipLimit
 */
function formatTimeAgo(date: Date): string {
  return formatRelativeTime(date, { style: "short" });
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
export function toFERipLimitTransaction(
  tx: RipLimitTransactionBE
): RipLimitTransactionFE {
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
export function toFERipLimitTransactionHistory(
  data: {
    transactions: RipLimitTransactionBE[];
    total: number;
  },
  limit: number = 20,
  offset: number = 0
): RipLimitTransactionHistoryFE {
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
