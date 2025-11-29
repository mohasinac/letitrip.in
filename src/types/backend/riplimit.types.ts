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
  createdAt: FirebaseTimestamp;
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
  id: string;
  userId: string;
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
  status: RipLimitTransactionStatus;
  /** Human readable description */
  description: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  createdAt: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
}

// ==================== PURCHASES ====================

/**
 * RipLimit purchase record
 * Collection: riplimit_purchases
 */
export interface RipLimitPurchaseBE {
  id: string;
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
  status: RipLimitPurchaseStatus;
  /** Transaction ID after completion */
  transactionId?: string;
  createdAt: FirebaseTimestamp;
  completedAt?: FirebaseTimestamp;
}

// ==================== REFUNDS ====================

/**
 * RipLimit refund request
 * Collection: riplimit_refunds
 */
export interface RipLimitRefundBE {
  id: string;
  userId: string;
  /** RipLimit amount to refund */
  ripLimitAmount: number;
  /** INR amount to return */
  inrAmount: number;
  /** Fee deducted (if any) */
  feeAmount: number;
  /** Net INR to refund */
  netAmount: number;
  status: RipLimitRefundStatus;
  /** Refund to original payment method or bank */
  refundMethod: "original" | "bank";
  /** Bank details if method is bank */
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  /** Admin notes */
  adminNotes?: string;
  /** Rejection reason if rejected */
  rejectionReason?: string;
  /** Transaction ID */
  transactionId?: string;
  createdAt: FirebaseTimestamp;
  processedAt?: FirebaseTimestamp;
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
    accountNumber: string;
    ifscCode: string;
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
  success: boolean;
  data: {
    availableBalance: number;
    blockedBalance: number;
    totalBalance: number;
    availableBalanceINR: number;
    blockedBalanceINR: number;
    totalBalanceINR: number;
    hasUnpaidAuctions: boolean;
    unpaidAuctionIds: string[];
    isBlocked: boolean;
    blockedBids: {
      auctionId: string;
      bidId: string;
      amount: number;
      bidAmountINR: number;
      auctionTitle?: string;
    }[];
  };
}

/**
 * Purchase initiation response
 */
export interface RipLimitPurchaseResponseBE {
  success: boolean;
  data: {
    purchaseId: string;
    razorpayOrderId: string;
    ripLimitAmount: number;
    inrAmount: number;
    razorpayKey: string;
  };
}

/**
 * Admin stats response
 */
export interface RipLimitAdminStatsBE {
  success: boolean;
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
export function inrToRipLimit(inr: number): number {
  return Math.floor(inr * RIPLIMIT_EXCHANGE_RATE);
}

/**
 * Convert RipLimit to INR
 */
export function ripLimitToInr(ripLimit: number): number {
  return ripLimit / RIPLIMIT_EXCHANGE_RATE;
}

/**
 * Check if user can bid
 */
export function canUserBid(account: RipLimitAccountBE): {
  canBid: boolean;
  reason?: string;
} {
  if (account.isBlocked) {
    return { canBid: false, reason: account.blockReason || "Account is blocked" };
  }
  if (account.hasUnpaidAuctions) {
    return { canBid: false, reason: "You have unpaid won auctions" };
  }
  return { canBid: true };
}

/**
 * Check if user has sufficient balance for bid
 */
export function hasSufficientBalance(
  account: RipLimitAccountBE,
  bidAmountINR: number
): { sufficient: boolean; required: number; available: number; shortfall: number } {
  const required = inrToRipLimit(bidAmountINR);
  const available = account.availableBalance;
  const shortfall = Math.max(0, required - available);
  return {
    sufficient: available >= required,
    required,
    available,
    shortfall,
  };
}
