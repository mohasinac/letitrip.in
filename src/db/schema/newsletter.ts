/**
 * Newsletter Subscribers Collection Schema
 *
 * Stores email newsletter subscriptions.
 * Collection: newsletterSubscribers
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface NewsletterSubscriberDocument {
  id: string; // Auto-generated (Firestore doc ID)
  email: string; // Subscriber email (unique)
  status: NewsletterSubscriberStatus; // "active" | "unsubscribed"
  source?: string; // Where they subscribed from (e.g. "homepage", "checkout")
  createdAt: Date; // Subscribe date
  updatedAt: Date;
  unsubscribedAt?: Date; // Set when status becomes "unsubscribed"
}

export type NewsletterSubscriberStatus = "active" | "unsubscribed";

export const NEWSLETTER_COLLECTION = "newsletterSubscribers" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================

/**
 * Firestore indices needed:
 * - email (unique check queries)
 * - status (listing active subscribers)
 * - createdAt (sort by subscribe date)
 *
 * No composite indices required for current queries.
 */
export const NEWSLETTER_INDEXED_FIELDS = [
  "email",
  "status",
  "createdAt",
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================

/**
 * RELATIONSHIPS:
 *
 * Standalone collection — no foreign keys.
 * Email is the unique natural key.
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================

export const DEFAULT_NEWSLETTER_DATA: Partial<NewsletterSubscriberDocument> = {
  status: "active",
};

export const NEWSLETTER_PUBLIC_FIELDS = [
  "id",
  "email",
  "status",
  "source",
  "createdAt",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type NewsletterSubscriberCreateInput = Pick<
  NewsletterSubscriberDocument,
  "email"
> &
  Partial<Pick<NewsletterSubscriberDocument, "source">>;

// ============================================
// 6. FIELD NAME CONSTANTS
// ============================================

export const NEWSLETTER_FIELDS = {
  ID: "id",
  EMAIL: "email",
  STATUS: "status",
  SOURCE: "source",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  UNSUBSCRIBED_AT: "unsubscribedAt",
  STATUS_VALUES: {
    ACTIVE: "active" as NewsletterSubscriberStatus,
    UNSUBSCRIBED: "unsubscribed" as NewsletterSubscriberStatus,
  },
} as const;
