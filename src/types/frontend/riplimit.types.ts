/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/riplimit.types
 * @description This file contains TypeScript type definitions for riplimit
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * RipLimit Frontend Types
 * Epic: E028 - RipLimit Bidding Currency
 *
 * UI-optimized types for RipLimit operations.
 * These types are used by frontend components and services.
 */

/**
 * RipLimit balance for UI display
 */
export interface RipLimitBalanceFE {
  // Formatted values for display
  /** Available Balance */
  availableBalance: number;
  /** Blocked Balance */
  blockedBalance: number;
  /** Total Balance */
  totalBalance: number;
  /** Formatted Available */
  formattedAvailable: string;
  /** Formatted Blocked */
  formattedBlocked: string;
  /** Formatted Total */
  formattedTotal: string;

  // INR equivalents
  /** Available Balance I N R */
  availableBalanceINR: number;
  /** Blocked Balance I N R */
  blockedBalanceINR: number;
  /** Total Balance I N R */
  totalBalanceINR: number;
  /** Formatted Available I N R */
  formattedAvailableINR: string;
  /** Formatted Blocked I N R */
  formattedBlockedINR: string;
  /** Formatted Total I N R */
  formattedTotalINR: string;

  // Status flags
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: boolean;
  /** Unpaid Auction Count */
  unpaidAuctionCount: number;
  /** Is Blocked */
  isBlocked: boolean;
  /** Can Bid */
  canBid: boolean;

  // Blocked bids
  /** Blocked Bids */
  blockedBids: RipLimitBlockedBidFE[];
}

/**
 * Blocked bid for UI display
 */
export interface RipLimitBlockedBidFE {
  /** Auction Id */
  auctionId: string;
  /** Bid Id */
  bidId: string;
  /** Amount */
  amount: number;
  /** Formatted Amount */
  formattedAmount: string;
  /** Bid Amount I N R */
  bidAmountINR: number;
  /** Formatted Bid Amount I N R */
  formattedBidAmountINR: string;
}

/**
 * Transaction for UI display
 */
export interface RipLimitTransactionFE {
  /** Id */
  id: string;
  /** Type */
  type: string;
  /** Type Label */
  typeLabel: string;
  /** Amount */
  amount: number;
  /** Formatted Amount */
  formattedAmount: string;
  /** Is Credit */
  isCredit: boolean;
  /** Inr Amount */
  inrAmount: number;
  /** Formatted I N R Amount */
  formattedINRAmount: string;
  /** Balance After */
  balanceAfter: number;
  /** Formatted Balance After */
  formattedBalanceAfter: string;
  /** Description */
  description: string;
  /** Auction Id */
  auctionId?: string;
  /** Order Id */
  orderId?: string;
  /** Status */
  status: string;
  /** Status Label */
  statusLabel: string;
  /** Created At */
  createdAt: Date;
  /** Formatted Date */
  formattedDate: string;
  /** Time Ago */
  timeAgo: string;
}

/**
 * Transaction history response for UI
 */
export interface RipLimitTransactionHistoryFE {
  /** Transactions */
  transactions: RipLimitTransactionFE[];
  /** Total */
  total: number;
  /** Has More */
  hasMore: boolean;
}

/**
 * Purchase form data
 */
export interface RipLimitPurchaseFormFE {
  /** Rip Limit Amount */
  ripLimitAmount: number;
  /** Inr Amount */
  inrAmount: number;
}

/**
 * Purchase response for UI
 */
export interface RipLimitPurchaseResponseFE {
  /** Order Id */
  orderId: string;
  /** Razorpay Order Id */
  razorpayOrderId: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Rip Limit Amount */
  ripLimitAmount: number;
  /** Formatted Amount */
  formattedAmount: string;
}

/**
 * Purchase verification response for UI
 */
export interface RipLimitPurchaseVerifyResponseFE {
  /** Success */
  success: boolean;
  /** New Balance */
  newBalance: number;
  /** Formatted New Balance */
  formattedNewBalance: string;
  /** Purchased Amount */
  purchasedAmount: number;
  /** Formatted Purchased Amount */
  formattedPurchasedAmount: string;
  /** Message */
  message: string;
}

/**
 * Transaction type labels for UI
 */
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  /** P U R C H A S E */
  PURCHASE: "Purchase",
  /** A D J U S T M E N T */
  ADJUSTMENT: "Admin Adjustment",
  BID_BLOCK: "Bid Placed",
  BID_RELEASE: "Bid Released",
  AUCTION_PAYMENT: "Auction Payment",
  /** R E F U N D */
  REFUND: "Refund",
  /** B O N U S */
  BONUS: "Bonus",
  /** P R O M O T I O N A L */
  PROMOTIONAL: "Promotional",
};

/**
 * Transaction status labels for UI
 */
export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  /** P E N D I N G */
  PENDING: "Pending",
  /** C O M P L E T E D */
  COMPLETED: "Completed",
  /** F A I L E D */
  FAILED: "Failed",
  /** R E V E R S E D */
  REVERSED: "Reversed",
};
