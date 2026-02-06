/**
 * Reviews Collection Schema
 *
 * Firebase Firestore collection for product reviews
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface ReviewDocument {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  status: ReviewStatus;
  moderatorId?: string;
  moderatorNote?: string;
  rejectionReason?: string;
  helpfulCount: number;
  reportCount: number;
  verified: boolean; // Whether user actually purchased the product
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export const REVIEW_COLLECTION = "reviews" as const;

// ============================================
// 2. INDEXED FIELDS (Must match firestore.indexes.json)
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * SYNC REQUIRED: Update firestore.indexes.json when changing these
 * Deploy: firebase deploy --only firestore:indexes
 */
export const REVIEW_INDEXED_FIELDS = [
  "productId", // For product's reviews
  "userId", // For user's reviews
  "status", // For filtering by moderation status
  "rating", // For rating-based queries
  "verified", // For verified reviews
  "createdAt", // For sorting by date
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) reviews
 * products (1) ----< (N) reviews
 *
 * Foreign Keys:
 * - reviews/{id}.userId references users/{uid}
 * - reviews/{id}.productId references products/{id}
 * - reviews/{id}.moderatorId references users/{uid}
 *
 * CASCADE BEHAVIOR:
 * When user is deleted:
 * 1. Keep reviews for trip ratings
 * 2. Anonymize user data (set userName to "Anonymous")
 * 3. Remove userAvatar
 *
 * When trip is deleted:
 * 1. Keep reviews for historical records
 * 2. Mark as archived or delete (business decision)
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default review data
 */
export const DEFAULT_REVIEW_DATA: Partial<ReviewDocument> = {
  status: "pending",
  helpfulCount: 0,
  reportCount: 0,
  verified: false,
  images: [],
};

/**
 * Fields that are publicly readable (approved reviews only)
 */
export const REVIEW_PUBLIC_FIELDS = [
  "id",
  "productId",
  "userName",
  "userAvatar",
  "rating",
  "title",
  "comment",
  "helpfulCount",
  "verified",
  "images",
  "createdAt",
] as const;

/**
 * Fields that users can update (before approval)
 */
export const REVIEW_UPDATABLE_FIELDS = [
  "rating",
  "title",
  "comment",
  "images",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new reviews
 */
export type ReviewCreateInput = Omit<
  ReviewDocument,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "helpfulCount"
  | "reportCount"
  | "moderatorId"
  | "moderatorNote"
  | "approvedAt"
  | "rejectedAt"
>;

/**
 * Type for updating reviews (user updates)
 */
export type ReviewUpdateInput = Partial<
  Pick<ReviewDocument, (typeof REVIEW_UPDATABLE_FIELDS)[number]>
>;

/**
 * Type for moderator review actions
 */
export type ReviewModerationInput = {
  status: ReviewStatus;
  moderatorId: string;
  moderatorNote?: string;
  rejectionReason?: string;
};

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const reviewQueryHelpers = {
  byProduct: (productId: string) => ["productId", "==", productId] as const,
  byUser: (userId: string) => ["userId", "==", userId] as const,
  byStatus: (status: ReviewStatus) => ["status", "==", status] as const,
  approved: () => ["status", "==", "approved"] as const,
  pending: () => ["status", "==", "pending"] as const,
  verified: () => ["verified", "==", true] as const,
  byRating: (rating: number) => ["rating", "==", rating] as const,
  highRated: () => ["rating", ">=", 4] as const,
} as const;
