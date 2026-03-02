/**
 * RipCoins Collection Schema
 *
 * Firebase Firestore collection for RipCoin transaction ledger.
 *
 * RipCoins are a virtual currency used exclusively for auction bidding.
 *
 * Economics:
 *   - Purchase: 10 RipCoins = ₹1 (acquisition cost ₹0.10 per coin)
 *   - Bid value: 1 RipCoin = ₹1 bid value
 *   - Win + pay within 3 days → locked coins returned to wallet
 *   - Win + do NOT pay within 3 days → locked coins forfeited permanently
 *   - Outbid / auction loss → locked coins released immediately
 *   - Auction ends with no payment → coins forfeited after 3-day grace window
 *
 * Balances are maintained on the UserDocument (ripcoinBalance, engagedRipcoins).
 * This collection is the transaction ledger — each entry is immutable.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface RipCoinTransactionDocument {
  id: string;
  userId: string;
  type: RipCoinTransactionType;
  coins: number; // Always positive; type indicates direction
  balanceBefore: number; // Snapshot of wallet balance before this tx
  balanceAfter: number; // Snapshot of wallet balance after this tx
  // Payment reference (only for 'purchase' transactions)
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amountPaid?: number; // ₹ paid (coins / 10)
  // Bid/auction reference (for engage / release / forfeit / return)
  bidId?: string;
  productId?: string;
  productTitle?: string;
  bidAmount?: number; // Rupee value of the bid that was placed
  // Admin notes
  notes?: string;
  createdAt: Date;
}

/**
 * Transaction type enum
 *
 * purchase  — user bought coins (Razorpay verified)
 * engage    — coins locked when a bid is placed
 * release   — locked coins returned (outbid / auction lost)
 * forfeit   — locked coins permanently lost (won but didn't pay in 3 days)
 * return    — locked coins returned after winning + completing payment
 * admin_grant — admin manually credits coins (refunds, bonuses, support)
 * admin_deduct — admin manually removes coins
 */
export type RipCoinTransactionType =
  | "purchase"
  | "engage"
  | "release"
  | "forfeit"
  | "return"
  | "admin_grant"
  | "admin_deduct";

export const RIPCOIN_COLLECTION = "ripcoins" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================

export const RIPCOIN_INDEXED_FIELDS = [
  "userId", // Query user's own transaction history
  "type", // Filter by transaction type
  "bidId", // Join with bid documents
  "productId", // Find all coin transactions for a product
  "razorpayOrderId", // Verify payment reference
  "createdAt", // Sorting
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) ripcoins (one wallet, many transactions)
 * bids  (1) ----< (N) ripcoins (engage/release/forfeit/return per bid)
 *
 * Foreign Keys:
 *   ripcoins.userId → users.uid
 *   ripcoins.bidId  → bids.id
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================

/** Cost in rupees to buy one pack of RipCoins */
export const RIPCOIN_PACK_PRICE_RS = 1; // ₹1 per pack

/** Number of RipCoins in a standard pack */
export const RIPCOIN_PACK_SIZE = 10; // 10 coins per ₹1

/** Minimum pack purchase (100 coins = ₹10) */
export const RIPCOIN_MIN_PACKS = 10; // minimum 10 packs per purchase

/** Maximum packs purchasable in one transaction (5000 coins = ₹500) */
export const RIPCOIN_MAX_PACKS = 500;

/** 1 RipCoin = ₹1 of bid value */
export const RIPCOIN_BID_VALUE_RS = 1;

/** Grace period (ms) after auction win before coins are forfeited */
export const RIPCOIN_PAYMENT_GRACE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export const DEFAULT_RIPCOIN_TX_DATA: Partial<RipCoinTransactionDocument> = {
  createdAt: new Date(),
};

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type RipCoinTransactionCreateInput = Omit<
  RipCoinTransactionDocument,
  "id" | "createdAt"
>;

// ============================================
// 6. QUERY HELPERS
// ============================================

import type { FirebaseSieveFields } from "@/lib/query/firebase-sieve";

export const RIPCOIN_SIEVE_FIELDS: FirebaseSieveFields = {
  userId: { canFilter: true, canSort: false },
  type: { canFilter: true, canSort: false },
  bidId: { canFilter: true, canSort: false },
  productId: { canFilter: true, canSort: false },
  createdAt: { canFilter: true, canSort: true },
};

export const ripcoinQueryHelpers = {
  byUser: (userId: string) => ({
    field: "userId",
    op: "==" as const,
    value: userId,
  }),
  byBid: (bidId: string) => ({
    field: "bidId",
    op: "==" as const,
    value: bidId,
  }),
  engaged: () => ({
    field: "type",
    op: "==" as const,
    value: "engage" as RipCoinTransactionType,
  }),
};
