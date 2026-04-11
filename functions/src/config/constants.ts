/**
 * Shared configuration constants for all Cloud Functions.
 *
 * Centralised here so schedules, timeouts, and batch sizes are easy to tune
 * without touching individual job files.
 */

// ---------------------------------------------------------------------------
// Business day anchor
// ---------------------------------------------------------------------------
/** The platform's business day starts at this hour in IST (10 = 10:00 AM IST). */
export const BUSINESS_DAY_START_HOUR_IST = 10;

/** Timezone for business-day calculations. 10:00 AM IST = 04:30 UTC. */
export const BUSINESS_DAY_TIMEZONE = "Asia/Kolkata";

// ---------------------------------------------------------------------------
// Cloud Scheduler cron expressions (UTC)
// ---------------------------------------------------------------------------
export const SCHEDULES = {
  /**
   * Auction settlement — every 15 min balances prompt winner notification
   * with free-tier invocation budget (~2,976/month vs 8,928 at every 5 min).
   */
  EVERY_15_MIN: "every 15 minutes",

  /**
   * Pending-order timeout sweep — every 2 hours.
   * ORDER_TIMEOUT_HOURS = 24, so at worst the cancellation fires 2 h late.
   * Halves invocations vs hourly (372/month vs 744).
   */
  EVERY_2_HOURS: "0 */2 * * *",

  /** Coupon expiry — just after midnight UTC */
  DAILY_0005: "5 0 * * *",

  /** Product stats recompute — quiet hours */
  DAILY_0100: "0 1 * * *",

  /**
   * Combined daily data cleanup (sessions + tokens) — 02:00 UTC.
   * Merging two cleanup tasks into one invocation saves a cold-start and
   * an invocation charge every day.
   */
  DAILY_0200: "0 2 * * *",

  /** Payout batch sweep — early morning before business hours */
  DAILY_0600: "0 6 * * *",

  /** Auto-payout eligibility sweep — 04:45 UTC, just before payoutBatch */
  DAILY_0445: "45 4 * * *",

  /**
   * Business-day-aligned daily sweep — 04:30 UTC = 10:00 AM IST.
   * This is the platform's day-start boundary. Jobs that count "days" for
   * business rules (payouts, pending windows) should use this schedule so
   * their cutoff snaps cleanly to the current business day start.
   */
  DAILY_0430_UTC: "30 4 * * *",

  /**
   * Auth event cleanup — every 5 minutes.
   * Removes stale RTDB auth_events nodes (older than 3 min) from abandoned popup sessions.
   */
  EVERY_5_MIN: "every 5 minutes",

  /** Abandoned cart prune — Sunday 04:00 UTC */
  WEEKLY_SUN_0400: "0 4 * * 0",

  /** Read-notification prune — Monday 01:00 UTC */
  WEEKLY_MON_0100: "0 1 * * 1",

  /**
   * Weekly payout eligibility sweep — Saturday 05:00 UTC.
   * Runs one hour before payoutBatch (DAILY_0600) so the freshly created
   * "pending" payout records are picked up in the same morning window.
   */
  WEEKLY_SAT_0500: "0 5 * * 6",

  /** Category metrics + store stats reconciliation — 03:00 UTC */
  DAILY_0300: "0 3 * * *",

  /** Offer expiry sweep — 00:15 UTC (just after coupon expiry at 00:05) */
  DAILY_0015: "15 0 * * *",
} as const;

// ---------------------------------------------------------------------------
// Runtime region — deploy close to your primary user base
// ---------------------------------------------------------------------------
export const REGION = "asia-south1"; // Mumbai (closest to India)

// ---------------------------------------------------------------------------
// Batch / query limits
// ---------------------------------------------------------------------------
/** Stay well under the 500-operation Firestore batch ceiling */
export const BATCH_LIMIT = 400;

/** Max docs to process in a single scheduler invocation */
export const QUERY_LIMIT = 400;

// ---------------------------------------------------------------------------
// Business-rule timeouts
// ---------------------------------------------------------------------------
/** Hours before an unpaid pending order is auto-cancelled */
export const ORDER_TIMEOUT_HOURS = 24;

/** Days after last activity before an abandoned cart is purged */
export const CART_TTL_DAYS = 30;

/** Days after which a read notification is eligible for pruning */
export const NOTIFICATION_TTL_DAYS = 90;

// ---------------------------------------------------------------------------
// Media temporary upload cleanup
// ---------------------------------------------------------------------------
/**
 * Storage folder prefix used to identify staged (un-confirmed) uploads.
 * The media upload route prefixes uploaded paths with this folder segment
 * until the entity is successfully saved. The cleanup job scans only this
 * prefix so that saved media is never at risk.
 *
 * Example staged path: tmp/uid/product-image-xyz.jpg
 * Example saved path:  media/uid/product-image-xyz.jpg
 */
export const MEDIA_TMP_FOLDER_PREFIX = "tmp/";

/**
 * Hours after which an unresolved staged upload is considered orphaned
 * and eligible for deletion.  Covers browser crashes, tab closes, and
 * backend save failures.  24 h is generous enough to survive any normal
 * user session while still reclaiming storage within one business day.
 */
export const MEDIA_TMP_TTL_HOURS = 24;

// ---------------------------------------------------------------------------
// Firestore collection names (mirrored from src/db/schema — kept in sync)
// ---------------------------------------------------------------------------
export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  BIDS: "bids",
  REVIEWS: "reviews",
  SESSIONS: "sessions",
  EMAIL_VERIFICATION_TOKENS: "emailVerificationTokens",
  PASSWORD_RESET_TOKENS: "passwordResetTokens",
  COUPONS: "coupons",
  CARTS: "carts",
  PAYOUTS: "payouts",
  NOTIFICATIONS: "notifications",
  CATEGORIES: "categories",
  STORES: "stores",
  OFFERS: "offers",
} as const;
