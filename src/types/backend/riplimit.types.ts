/**
 * @fileoverview Type Definitions
 * @module src/types/backend/riplimit.types
 * @description This file contains TypeScript type definitions for riplimit
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * RipLimit Backend Types
 * Epic: E028 - RipLimit Bidding Currency
 *
 * RipLimit is a virtual bidding currency where:
 * - 1 INR = 20 RipLimit
 * - Users can purchase unlimited RipLimit
 * - Users can bid on multiple auctions simultaneously
 * - RipLimit is blocked when bidding, released when outbid
 */

import { FirebaseTimestamp } from "../shared/common.types";

// ==================== CONSTANTS ====================

/** Exchange rate: 1 INR = 20 RipLimit */
export const RIPLIMIT_EXCHANGE_RATE = 20;

/** Minimum purchase amount in RipLimit (200 RL = ₹10) */
export const RIPLIMIT_MIN_PURCHASE = 200;

/** Minimum refund amount in RipLimit (1000 RL = ₹50) */
export const RIPLIMIT_MIN_REFUND = 1000;

/** Payment window for won auctions in hours */
export const AUCTION_PAYMENT_WINDOW_HOURS = 24;

/** Grace period before auction is cancelled in hours */
export const AUCTION_CANCEL_GRACE_HOURS = 48;

// ==================== ENUMS ====================

/**
 * RipLimit transaction types
 */
export enum RipLimitTransactionType {
  /** Purchase with real money */
  PURCHASE = "purchase",
  /** Bid placed - RipLimit blocked */
  BID_BLOCK = "bid_block",
  /** Outbid or auction cancelled - RipLimit released */
  BID_RELEASE = "bid_release",
  /** Won auction - RipLimit used for payment */
  AUCTION_PAYMENT = "auction_payment",
  /** Refund requested */
  REFUND = "refund",
  /** Admin adjustment (bonus, correction) */
  ADJUSTMENT = "adjustment",
  /** Withdrawal to bank */
  WITHDRAWAL = "withdrawal",
}

/**
 * RipLimit transaction status
 */
export enum RipLimitTransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * RipLimit purchase status
 */
export enum RipLimitPurchaseStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * RipLimit refund status
 */
export enum RipLimitRefundStatus {
  REQUESTED = "requested",
  PROCESSING = "processing",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

// ==================== ACCOUNT ====================

/**
 * RipLimit account for a user
 * Collection: riplimit_accounts/{userId}
 */
export interface RipLimitAccountBE {
  /** User ID (same as document ID) */
  userId: string;
  /** Available balance that can be used for bidding */
  availableBalance: number;
  /** Balance blocked in active bids */
  blockedBalance: number;
  /** Total lifetime purchases in RipLimit */
  lifetimePurchases: number;
  /** Total lifetime spent in RipLimit */
  lifetimeSpent: number;
  /** User has unpaid won auctions */
  hasUnpaidAuctions: boolean;
  /** List of unpaid auction IDs */
  unpaidAuctionIds: string[];
  /** Number of strikes (3 = ban) */
  strikes: number;
  /** Account is blocked from bidding */
  isBlocked: boolean;
  /** Block reason if blocked */
  blockReason?: string;
  /** Created At */
  createdAt: FirebaseTimestamp;
  /** Updated At */
  updatedAt: FirebaseTimestamp;
}

/**
 * Blocked amount per auction
 * Sub-collection: riplimit_accounts/{userId}/blocked_bids/{auctionId}
 */
export interface RipLimitBlockedBidBE {
  /** Auction ID */
  auctionId: string;
  /** Bid ID */
  bidId: string;
  /** Blocked RipLimit amount */
  amount: number;
  /** Bid amount in INR */
  bidAmountINR: number;
  /** When the bid was placed */
  createdAt: FirebaseTimestamp;
}

// ==================== TRANSACTIONS ====================

/**
 * RipLimit transaction record
 * Collection: riplimit_transactions
 */
export interface RipLimitTransactionBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Type */
  type: RipLimitTransactionType;
  /** RipLimit amount (positive for credit, negative for debit) */
  amount: number;
  /** INR equivalent amount */
  inrAmount: number;
  /** Balance after this transaction */
  balanceAfter: number;
  /** Related auction ID (for bid transactions) */
  auctionId?: string;
  /** Related bid ID */
  bidId?: string;
  /** Related payment ID (for purchases) */
  paymentId?: string;
  /** Related order ID (for auction wins) */
  orderId?: string;
  /** Status */
  status: RipLimitTransactionStatus;
  /** Human readable description */
  description: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Created At */
  createdAt: FirebaseTimestamp;
  /** Updated At */
  updatedAt?: FirebaseTimestamp;
}

// ==================== PURCHASES ====================

/**
 * RipLimit purchase record
 * Collection: riplimit_purchases
 */
export interface RipLimitPurchaseBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** RipLimit amount purchased */
  ripLimitAmount: number;
  /** INR amount paid */
  inrAmount: number;
  /** Razorpay order ID */
  razorpayOrderId: string;
  /** Razorpay payment ID (after verification) */
  razorpayPaymentId?: string;
  /** Razorpay signature (after verification) */
  razorpaySignature?: string;
  /** Payment method used */
  paymentMethod?: string;
  /** Status */
  status: RipLimitPurchaseStatus;
  /** Transaction ID after completion */
  transactionId?: string;
  /** Created At */
  createdAt: FirebaseTimestamp;
  /** Completed At */
  completedAt?: FirebaseTimestamp;
}

// ==================== REFUNDS ====================

/**
 * RipLimit refund request
 * Collection: riplimit_refunds
 */
export interface RipLimitRefundBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** RipLimit amount to refund */
  ripLimitAmount: number;
  /** INR amount to return */
  inrAmount: number;
  /** Fee deducted (if any) */
  feeAmount: number;
  /** Net INR to refund */
  netAmount: number;
  /** Status */
  status: RipLimitRefundStatus;
  /** Refund to original payment method or bank */
  refundMethod: "original" | "bank";
  /** Bank details if method is bank */
  bankDetails?: {
    /** Account Number */
    accountNumber: string;
    /** Ifsc Code */
    ifscCode: string;
    /** Account Holder Name */
    accountHolderName: string;
  };
  /** Admin notes */
  adminNotes?: string;
  /** Rejection reason if rejected */
  rejectionReason?: string;
  /** Transaction ID */
  transactionId?: string;
  /** Created At */
  createdAt: FirebaseTimestamp;
  /** Processed At */
  processedAt?: FirebaseTimestamp;
  /** Processed By */
  processedBy?: string;
}

// ==================== API REQUESTS ====================

/**
 * Purchase RipLimit request
 */
export interface RipLimitPurchaseRequestBE {
  /** Amount in INR to purchase */
  amount: number;
}

/**
 * Verify purchase payment request
 */
export interface RipLimitVerifyPurchaseRequestBE {
  /** Razorpay order ID */
  razorpayOrderId: string;
  /** Razorpay payment ID */
  razorpayPaymentId: string;
  /** Razorpay signature */
  razorpaySignature: string;
}

/**
 * Refund request
 */
export interface RipLimitRefundRequestBE {
  /** RipLimit amount to refund */
  amount: number;
  /** Refund method */
  method: "original" | "bank";
  /** Bank details if method is bank */
  bankDetails?: {
    /** Account Number */
    accountNumber: string;
    /** Ifsc Code */
    ifscCode: string;
    /** Account Holder Name */
    accountHolderName: string;
  };
}

/**
 * Admin balance adjustment request
 */
export interface RipLimitAdjustmentRequestBE {
  /** Amount to adjust (positive or negative) */
  amount: number;
  /** Reason for adjustment */
  reason: string;
}

// ==================== API RESPONSES ====================

/**
 * Balance response
 */
export interface RipLimitBalanceResponseBE {
  /** Success */
  success: boolean;
  /** Data */
  data: {
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
    blockedBids: {
      /** Auction Id */
      auctionId: string;
      /** Bid Id */
      bidId: string;
      /** Amount */
      amount: number;
      /** Bid Amount I N R */
      bidAmountINR: number;
      /** Auction Title */
      auctionTitle?: string;
    }[];
  };
}

/**
 * Purchase initiation response
 */
export interface RipLimitPurchaseResponseBE {
  /** Success */
  success: boolean;
  /** Data */
  data: {
    /** Purchase Id */
    purchaseId: string;
    /** Razorpay Order Id */
    razorpayOrderId: string;
    /** Rip Limit Amount */
    ripLimitAmount: number;
    /** Inr Amount */
    inrAmount: number;
    /** Razorpay Key */
    razorpayKey: string;
  };
}

/**
 * Admin stats response
 */
export interface RipLimitAdminStatsBE {
  /** Success */
  success: boolean;
  /** Data */
  data: {
    /** Total RipLimit in circulation (all user balances) */
    totalCirculation: number;
    /** Total available across all users */
    totalAvailable: number;
    /** Total blocked in bids */
    totalBlocked: number;
    /** Total revenue from purchases (INR) */
    totalRevenue: number;
    /** Total refunded (INR) */
    totalRefunded: number;
    /** Net revenue (INR) */
    netRevenue: number;
    /** Number of users with RipLimit */
    userCount: number;
    /** Number of users with unpaid auctions */
    unpaidUserCount: number;
    /** Recent transactions */
    recentTransactions: RipLimitTransactionBE[];
  };
}

// ==================== HELPERS ====================

/**
 * Convert INR to RipLimit
 */
/**
 * Performs inr to rip limit operation
 *
 * @param {number} inr - The inr
 *
 * @returns {number} The inrtoriplimit result
 *
 * @example
 * inrToRipLimit(123);
 */

/**
 * Performs inr to rip limit operation
 *
 * @param {number} inr - The inr
 *
 * @returns {number} The inrtoriplimit result
 *
 * @example
 * inrToRipLimit(123);
 */

export function inrToRipLimit(inr: number): number {
  return Math.floor(inr * RIPLIMIT_EXCHANGE_RATE);
}

/**
 * Convert RipLimit to INR
 */
/**
 * Performs rip limit to inr operation
 *
 * @param {number} ripLimit - The rip limit
 *
 * @returns {number} The riplimittoinr result
 *
 * @example
 * ripLimitToInr(123);
 */

/**
 * Performs rip limit to inr operation
 *
 * @param {number} ripLimit - The rip limit
 *
 * @returns {number} The riplimittoinr result
 *
 * @example
 * ripLimitToInr(123);
 */

export function ripLimitToInr(ripLimit: number): number {
  return ripLimit / RIPLIMIT_EXCHANGE_RATE;
}

/**
 * Check if user can bid
 */
/**
 * Checks if user bid
 *
 * @param {RipLimitAccountBE} account - The account
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * canUserBid(account);
 */

/**
 * Checks if user bid
 *
 * @param {RipLimitAccountBE} account - The account
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * canUserBid(account);
 */

export function canUserBid(account: RipLimitAccountBE): {
  /** Can Bid */
  canBid: boolean;
  /** Reason */
  reason?: string;
} {
  if (account.isBlocked) {
    return {
      /** Can Bid */
      canBid: false,
      /** Reason */
      reason: account.blockReason || "Account is blocked",
    };
  }
  if (account.hasUnpaidAuctions) {
    return { canBid: false, reason: "You have unpaid won auctions" };
  }
  return { canBid: true };
}

/**
 * Check if user has sufficient balance for bid
 */
/**
 * Checks if sufficient balance
 *
 * @param {RipLimitAccountBE} account - The account
 * @param {number} bidAmountINR - The bid amount i n r
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasSufficientBalance(account, 123);
 */

/**
 * Checks if sufficient balance
 *
 * @returns {number} The hassufficientbalance result
 *
 * @example
 * hasSufficientBalance();
 */

export function hasSufficientBalance(
  /** Account */
  account: RipLimitAccountBE,
  /** Bid Amount I N R */
  bidAmountINR: number,
): {
  /** Sufficient */
  sufficient: boolean;
  /** Required */
  required: number;
  /** Available */
  available: number;
  /** Shortfall */
  shortfall: number;
} {
  const required = inrToRipLimit(bidAmountINR);
  const available = account.availableBalance;
  const shortfall = Math.max(0, required - available);
  return {
    /** Sufficient */
    sufficient: available >= required,
    required,
    available,
    shortfall,
  };
}
