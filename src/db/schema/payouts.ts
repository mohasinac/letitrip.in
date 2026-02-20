/**
 * Payouts Collection Schema
 *
 * Firebase Firestore collection for seller payout requests and processing.
 * Tracks money owed to sellers after platform commission deduction.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface PayoutBankAccount {
  accountHolderName: string;
  /** Last 4 digits only (masked for security) */
  accountNumberMasked: string;
  ifscCode: string;
  bankName: string;
}

export interface PayoutDocument {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;

  /** Net payout amount (after platform fee) */
  amount: number;
  /** Gross order revenue before platform fee */
  grossAmount: number;
  /** Platform commission amount deducted */
  platformFee: number;
  /** Platform fee rate used (e.g. 0.05 = 5%) */
  platformFeeRate: number;

  currency: string;
  status: PayoutStatus;

  paymentMethod: PayoutPaymentMethod;
  bankAccount?: PayoutBankAccount;
  /** UPI ID for UPI payouts */
  upiId?: string;

  /** Notes provided by the seller when requesting */
  notes?: string;
  /** Admin note added when processing/completing/failing */
  adminNote?: string;

  /** Order IDs included in this payout (for deduplication) */
  orderIds: string[];

  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PayoutStatus = "pending" | "processing" | "completed" | "failed";
export type PayoutPaymentMethod = "bank_transfer" | "upi";

export const PAYOUT_COLLECTION = "payouts" as const;

// ============================================
// 2. INDEXED FIELDS (Must match firestore.indexes.json)
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * SYNC REQUIRED: Update firestore.indexes.json when changing these
 * Deploy: firebase deploy --only firestore:indexes
 */
export const PAYOUT_INDEXED_FIELDS = [
  "sellerId", // For seller's payouts
  "status", // For filtering by status
  "requestedAt", // For sorting by request date
  "createdAt", // For sorting by creation date
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) payouts   (seller has many payouts)
 * orders (N) ----> (1) payouts  (payout covers multiple orders)
 *
 * Foreign Keys:
 * - payouts/{id}.sellerId references users/{uid}
 * - payouts/{id}.orderIds[] references orders/{id}
 *
 * CASCADE BEHAVIOR:
 * When user is deleted: anonymise seller data but preserve financial records
 * When order is deleted: keep payout records for audit trail
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
export const PAYOUT_FIELDS = {
  SELLER_ID: "sellerId",
  STATUS: "status",
  REQUESTED_AT: "requestedAt",
  CREATED_AT: "createdAt",
  STATUS_VALUES: {
    PENDING: "pending" as PayoutStatus,
    PROCESSING: "processing" as PayoutStatus,
    COMPLETED: "completed" as PayoutStatus,
    FAILED: "failed" as PayoutStatus,
  },
} as const;

/**
 * Default platform fee rate: 5%
 */
export const DEFAULT_PLATFORM_FEE_RATE = 0.05 as const;

export const DEFAULT_PAYOUT_DATA: Partial<PayoutDocument> = {
  status: "pending",
  currency: "INR",
  platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
  orderIds: [],
};

export const PAYOUT_PUBLIC_FIELDS = [
  "id",
  "sellerId",
  "amount",
  "currency",
  "status",
  "paymentMethod",
  "requestedAt",
  "processedAt",
  "createdAt",
] as const;

export const PAYOUT_ADMIN_UPDATEABLE_FIELDS = [
  "status",
  "adminNote",
  "processedAt",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type PayoutCreateInput = Omit<
  PayoutDocument,
  "id" | "createdAt" | "updatedAt" | "status" | "requestedAt"
>;

export type PayoutUpdateInput = Partial<
  Pick<PayoutDocument, (typeof PAYOUT_ADMIN_UPDATEABLE_FIELDS)[number]>
>;

// ============================================
// 6. QUERY HELPERS
// ============================================
export const payoutQueryHelpers = {
  bySeller: (sellerId: string) => ["sellerId", "==", sellerId] as const,
  byStatus: (status: PayoutStatus) => ["status", "==", status] as const,
  pendingForSeller: (sellerId: string) =>
    [
      ["sellerId", "==", sellerId],
      ["status", "==", "pending"],
    ] as const,
} as const;
