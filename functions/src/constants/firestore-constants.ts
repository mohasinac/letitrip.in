/**
 * Firestore & Database Constants
 * (Cloud Functions)
 *
 * Constants for Firestore query limits, batch sizes, and database configurations.
 */

// ============================================================================
// FIRESTORE QUERY BATCH SIZES
// ============================================================================

export const FIRESTORE_BATCH_SIZES = {
  // Single document fetch (for lookups)
  SINGLE_DOCUMENT: 1,

  // Small batches (notifications, processing)
  SMALL_BATCH: 50,

  // Medium batches (reviews, activity logs)
  MEDIUM_BATCH: 100,

  // Large batches (cleanup, archival)
  LARGE_BATCH: 500,

  // Extra large batches (bulk migrations, exports)
  EXTRA_LARGE_BATCH: 1000,
} as const;

// ============================================================================
// FIRESTORE WRITE BATCH LIMITS
// ============================================================================

export const FIRESTORE_WRITE_LIMITS = {
  // Firestore batch write limit (hard limit: 500 writes per batch)
  MAX_WRITES_PER_BATCH: 500,

  // Practical batch size to avoid timeouts
  RECOMMENDED_BATCH_SIZE: 100,

  // Batch processing sleep interval (ms) to avoid rate limits
  BATCH_SLEEP_INTERVAL: 1000, // 1 second between batches
} as const;

// ============================================================================
// FIRESTORE INDEXES & CONSTRAINTS
// ============================================================================

export const FIRESTORE_CONSTRAINTS = {
  // Maximum document size (Firestore limit: 1 MB)
  MAX_DOCUMENT_SIZE_BYTES: 1048576, // 1 MB

  // String field limits
  MAX_STRING_LENGTH: 1000000, // 1 million characters per field

  // Array field limits
  MAX_ARRAY_LENGTH: 20000,

  // Collection size warning threshold
  COLLECTION_SIZE_WARNING: 10000000, // 10 million documents
} as const;

// ============================================================================
// FIRESTORE TRANSACTION CONFIGURATION
// ============================================================================

export const FIRESTORE_TRANSACTIONS = {
  // Maximum retries for transaction
  MAX_RETRIES: 5,

  // Timeout for transaction (ms)
  TRANSACTION_TIMEOUT_MS: 30000, // 30 seconds
} as const;

// ============================================================================
// COMMON QUERY BATCH PATTERNS
// ============================================================================

export const QUERY_PATTERNS = {
  // Single document lookup (payments, auctions)
  SINGLE_LOOKUP: FIRESTORE_BATCH_SIZES.SINGLE_DOCUMENT,

  // List queries for notifications, reviews
  NOTIFICATION_QUERY: FIRESTORE_BATCH_SIZES.SMALL_BATCH,

  // Batch processing for reports, activity
  ACTIVITY_BATCH: FIRESTORE_BATCH_SIZES.MEDIUM_BATCH,

  // Cleanup and archival operations
  CLEANUP_BATCH: FIRESTORE_BATCH_SIZES.LARGE_BATCH,
} as const;
