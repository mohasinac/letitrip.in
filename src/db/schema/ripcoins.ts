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
  amountPaid?: number; // ₹ paid
  packageId?: string; // Fixed package ID: "100"|"500"|"1000"|"5000"|"10000"
  bonusCoins?: number; // Bonus coins credited (e.g. 250 on 5000-pack)
  refunded?: boolean; // Whether this purchase transaction has been refunded
  refundedAt?: Date; // When the refund was processed
  razorpayRefundId?: string; // Razorpay refund ID (if money was refunded)
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
 * purchase    — user bought coins (Razorpay verified)
 * engage      — coins locked when a bid is placed
 * release     — locked coins returned (outbid / auction lost)
 * forfeit     — locked coins permanently lost (won but didn't pay in 3 days)
 * return      — locked coins returned after winning + completing payment
 * refund      — purchase refunded; coins debited back
 * admin_grant — admin manually credits coins (bonuses, support)
 * admin_deduct — admin manually removes coins
 */
export type RipCoinTransactionType =
  | "purchase"
  | "engage"
  | "release"
  | "forfeit"
  | "return"
  | "refund"
  | "admin_grant"
  | "admin_deduct"
  | "earn_purchase";

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

/** Maximum packs purchasable in one transaction (10000 coins = ₹1000) */
export const RIPCOIN_MAX_PACKS = 1000;

/** 1 RipCoin = ₹1 of bid value */
export const RIPCOIN_BID_VALUE_RS = 1;

/** Earn rate: ₹10 spent on a purchase = 1 RipCoin credited */
export const RIPCOIN_EARN_RATE = 10;

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

// ============================================
// 7. FIXED PURCHASE PACKAGES
// ============================================

export interface RipCoinPackage {
  packageId: string;
  coins: number; // base coins purchased
  priceRs: number; // INR price the user pays
  bonusPct: number; // bonus percentage (0 | 5 | 10)
  bonusCoins: number; // calculated bonus coins
  totalCoins: number; // coins + bonusCoins
}

export const RIPCOIN_PACKAGES: readonly RipCoinPackage[] = [
  {
    packageId: "100",
    coins: 100,
    priceRs: 10,
    bonusPct: 0,
    bonusCoins: 0,
    totalCoins: 100,
  },
  {
    packageId: "500",
    coins: 500,
    priceRs: 50,
    bonusPct: 0,
    bonusCoins: 0,
    totalCoins: 500,
  },
  {
    packageId: "1000",
    coins: 1000,
    priceRs: 100,
    bonusPct: 0,
    bonusCoins: 0,
    totalCoins: 1000,
  },
  {
    packageId: "5000",
    coins: 5000,
    priceRs: 500,
    bonusPct: 5,
    bonusCoins: 250,
    totalCoins: 5250,
  },
  {
    packageId: "10000",
    coins: 10000,
    priceRs: 1000,
    bonusPct: 10,
    bonusCoins: 1000,
    totalCoins: 11000,
  },
] as const;

export const VALID_PACKAGE_IDS = RIPCOIN_PACKAGES.map((p) => p.packageId);

export function getRipCoinPackage(packageId: string): RipCoinPackage | null {
  return RIPCOIN_PACKAGES.find((p) => p.packageId === packageId) ?? null;
}

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
