/**
 * Offers Collection Schema
 *
 * Firestore collection for buyer "Make an Offer" negotiations on standard products.
 * An offer moves through a lifecycle: pending → accepted | declined | countered → (counter) pending → …
 * Accepted offers lock the price and generate a checkout link.
 * Offers expire automatically via a Firebase Function after `expiresAt`.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export type OfferStatus =
  | "pending" // Buyer submitted, awaiting seller response
  | "accepted" // Seller accepted — ready for checkout at lockedPrice
  | "declined" // Seller declined
  | "countered" // Seller sent a counter price — awaiting buyer response
  | "expired" // Passed expiresAt without a response
  | "withdrawn" // Buyer withdrew before response
  | "paid"; // Buyer completed checkout — order placed

export interface OfferDocument {
  id: string;
  productId: string;
  productTitle: string;
  productSlug?: string;
  productImageUrl?: string;

  buyerUid: string;
  buyerName: string;
  buyerEmail: string;

  sellerId: string;
  sellerName: string;

  /** Price the buyer offered (in paise for consistency, stored as subunit integer) */
  offerAmount: number;
  /** Original listed price at offer time */
  listedPrice: number;
  /** Seller's counter-offer amount (set when status === 'countered') */
  counterAmount?: number;
  /** Final agreed price — set when status === 'accepted' */
  lockedPrice?: number;
  currency: string;

  status: OfferStatus;

  /** Optional buyer message */
  buyerNote?: string;
  /** Optional seller note/reason */
  sellerNote?: string;

  /** ISO expiry timestamp — auto-set to createdAt + 48h */
  expiresAt: Date;
  /** Set when a counter was accepted by the buyer */
  acceptedAt?: Date;
  /** Last time either party acted */
  respondedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const OFFER_COLLECTION = "offers" as const;

// ============================================
// 2. INPUT TYPES
// ============================================

export type OfferCreateInput = Pick<
  OfferDocument,
  | "productId"
  | "productTitle"
  | "productSlug"
  | "productImageUrl"
  | "buyerUid"
  | "buyerName"
  | "buyerEmail"
  | "sellerId"
  | "sellerName"
  | "offerAmount"
  | "listedPrice"
  | "currency"
  | "buyerNote"
>;

export type OfferUpdateInput = Partial<
  Pick<
    OfferDocument,
    | "status"
    | "counterAmount"
    | "lockedPrice"
    | "sellerNote"
    | "acceptedAt"
    | "respondedAt"
    | "updatedAt"
  >
>;

// ============================================
// 3. INDEXED FIELDS (must match firestore.indexes.json)
// ============================================

export const OFFER_INDEXED_FIELDS = [
  "buyerUid", // buyer's offer inbox
  "sellerId", // seller's offer inbox
  "productId", // offers on a specific product
  "status", // filter by lifecycle state
  "createdAt", // sort
  "expiresAt", // expiry sweep
] as const;

// ============================================
// 4. FIELD NAME CONSTANTS
// ============================================

export const OFFER_FIELDS = {
  ID: "id",
  PRODUCT_ID: "productId",
  PRODUCT_TITLE: "productTitle",
  BUYER_UID: "buyerUid",
  BUYER_NAME: "buyerName",
  BUYER_EMAIL: "buyerEmail",
  SELLER_ID: "sellerId",
  SELLER_NAME: "sellerName",
  OFFER_AMOUNT: "offerAmount",
  LISTED_PRICE: "listedPrice",
  COUNTER_AMOUNT: "counterAmount",
  LOCKED_PRICE: "lockedPrice",
  CURRENCY: "currency",
  STATUS: "status",
  BUYER_NOTE: "buyerNote",
  SELLER_NOTE: "sellerNote",
  EXPIRES_AT: "expiresAt",
  ACCEPTED_AT: "acceptedAt",
  RESPONDED_AT: "respondedAt",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;
