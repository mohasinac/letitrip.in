/**
 * Bids Collection Schema
 *
 * Firebase Firestore collection for auction bids
 */

import { generateBidId, type GenerateBidIdInput } from "@/utils";

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface BidDocument {
  id: string;
  productId: string; // Auction product ID
  productTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  bidAmount: number;
  currency: string;
  status: BidStatus;
  isWinning: boolean; // Current highest bid
  previousBidAmount?: number; // Previous bid by same user
  bidDate: Date;
  autoMaxBid?: number; // Maximum auto-bid amount
  createdAt: Date;
  updatedAt: Date;
}

export type BidStatus = "active" | "outbid" | "won" | "lost" | "cancelled";

export const BID_COLLECTION = "bids" as const;

// ============================================
// 2. INDEXED FIELDS (Must match firestore.indexes.json)
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * SYNC REQUIRED: Update firestore.indexes.json when changing these
 * Deploy: firebase deploy --only firestore:indexes
 */
export const BID_INDEXED_FIELDS = [
  "productId", // For product's bids
  "userId", // For user's bids
  "status", // For filtering by status
  "isWinning", // For current highest bid
  "bidDate", // For sorting by bid date
  "createdAt", // For sorting by creation date
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) bids
 * products (1) ----< (N) bids (for auction items only)
 *
 * Foreign Keys:
 * - bids/{id}.userId references users/{uid}
 * - bids/{id}.productId references products/{id}
 *
 * CASCADE BEHAVIOR:
 * When user is deleted:
 * 1. Keep bids for auction history
 * 2. Anonymize user data (set userName to "Anonymous Bidder")
 *
 * When product is deleted:
 * 1. Keep bids for historical records
 * 2. Mark all bids as 'cancelled'
 *
 * When auction ends:
 * 1. Mark highest bid as 'won'
 * 2. Mark all other bids as 'lost'
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default bid data
 */
export const DEFAULT_BID_DATA: Partial<BidDocument> = {
  status: "active",
  currency: "INR",
  isWinning: false,
};

/**
 * Fields that are publicly readable
 */
export const BID_PUBLIC_FIELDS = [
  "id",
  "productId",
  "productTitle",
  "userName",
  "bidAmount",
  "currency",
  "bidDate",
  "isWinning",
  "createdAt",
] as const;

/**
 * Fields that users can update
 */
export const BID_UPDATABLE_FIELDS = ["autoMaxBid"] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new bids
 */
export type BidCreateInput = Omit<
  BidDocument,
  "id" | "createdAt" | "updatedAt" | "status" | "isWinning"
>;

/**
 * Type for updating bids
 */
export type BidUpdateInput = Partial<
  Pick<BidDocument, (typeof BID_UPDATABLE_FIELDS)[number]>
>;

/**
 * Type for admin bid updates
 */
export type BidAdminUpdateInput = Partial<
  Omit<BidDocument, "id" | "createdAt">
>;

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const bidQueryHelpers = {
  byProduct: (productId: string) => ["productId", "==", productId] as const,
  byUser: (userId: string) => ["userId", "==", userId] as const,
  byStatus: (status: BidStatus) => ["status", "==", status] as const,
  winning: (productId: string) =>
    [
      ["productId", "==", productId],
      ["isWinning", "==", true],
    ] as const,
  active: () => ["status", "==", "active"] as const,
} as const;

// ============================================
// 7. ID GENERATION HELPERS
// ============================================

/**
 * Generate SEO-friendly bid ID
 * Pattern: bid-{product-name}-{user-first-name}-{date}-{random}
 *
 * @param input - Bid details
 * @returns SEO-friendly bid ID
 *
 * Example: createBidId({
 *   productName: "Vintage Camera",
 *   userFirstName: "John",
 *   date: new Date("2026-02-10")
 * }) → "bid-vintage-camera-john-20260210-a7b2c9"
 */
export function createBidId(
  input: Omit<GenerateBidIdInput, "random"> & { random?: string },
): string {
  return generateBidId(input as GenerateBidIdInput);
}
