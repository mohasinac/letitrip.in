/**
 * API & Network Configuration Constants
 *
 * Centralized constants for HTTP timeouts, retries, rate limits,
 * and other network-related configurations.
 */

// ============================================================================
// HTTP TIMEOUT CONSTANTS (milliseconds)
// ============================================================================

export const HTTP_TIMEOUTS = {
  VERY_SHORT: 3000, // 3 seconds - quick endpoints
  SHORT: 5000, // 5 seconds - standard API calls
  MEDIUM: 10000, // 10 seconds - longer operations
  LONG: 30000, // 30 seconds - file uploads, heavy processing
  EXTRA_LONG: 60000, // 60 seconds - very heavy operations
  SLOW_API_THRESHOLD: 3000, // 3 seconds - threshold for tracking slow APIs
} as const;

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

export const RETRY_CONFIG = {
  // Retry attempts
  MAX_ATTEMPTS: 3,
  DEFAULT_ATTEMPTS: 2,

  // Retry delays (milliseconds)
  INITIAL_DELAY: 1000, // 1 second - start delay
  EXPONENTIAL_BASE: 2, // Exponential backoff multiplier (1s, 2s, 4s...)
  MAX_DELAY: 30000, // 30 seconds - cap retry delay

  // Jitter for distributed retries
  JITTER_ENABLED: true,
  JITTER_FACTOR: 0.1, // 10% jitter
} as const;

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMITS = {
  // Generic API rate limits
  STANDARD_PER_MINUTE: 60,
  STANDARD_PER_HOUR: 3600,
  STANDARD_PER_DAY: 10000,

  // Strict limits (auth, sensitive operations)
  STRICT_PER_MINUTE: 10,
  STRICT_PER_HOUR: 100,
  STRICT_PER_DAY: 1000,

  // Generous limits (public endpoints)
  GENEROUS_PER_MINUTE: 200,
  GENEROUS_PER_HOUR: 10000,
  GENEROUS_PER_DAY: 100000,
} as const;

// ============================================================================
// CACHE CONTROL
// ============================================================================

export const CACHE_CONTROL = {
  // Cache TTL (time-to-live) in milliseconds
  TTL_VERY_SHORT: 60000, // 1 minute
  TTL_SHORT: 300000, // 5 minutes
  TTL_MEDIUM: 600000, // 10 minutes
  TTL_LONG: 1800000, // 30 minutes
  TTL_VERY_LONG: 3600000, // 1 hour

  // Stale-while-revalidate (SWR) times
  SWR_SHORT: 300000, // 5 minutes
  SWR_MEDIUM: 900000, // 15 minutes
  SWR_LONG: 1800000, // 30 minutes
  SWR_VERY_LONG: 3600000, // 1 hour

  // Max-age for immutable content (1 year in seconds)
  MAX_AGE_IMMUTABLE: 31536000,
} as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const PAGINATION = {
  // Default page sizes
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE_SIZE_ADMIN: 50,
  DEFAULT_PAGE_SIZE_LIST: 100,

  // Min/max page sizes
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE_STANDARD: 100,
  MAX_PAGE_SIZE_ADMIN: 500,

  // Default page number
  DEFAULT_PAGE: 1,
} as const;

// ============================================================================
// UPLOAD CONFIGURATION
// ============================================================================

export const UPLOAD_CONFIG = {
  // File size limits (bytes)
  MAX_FILE_SIZE_IMAGE: 5242880, // 5 MB
  MAX_FILE_SIZE_DOCUMENT: 10485760, // 10 MB
  MAX_FILE_SIZE_VIDEO: 104857600, // 100 MB
  MAX_FILE_SIZE_AVATAR: 2097152, // 2 MB

  // Multiple file limits
  MAX_FILES_IMAGES: 10,
  MAX_FILES_DOCUMENTS: 5,
  MAX_FILES_VIDEOS: 3,

  // Chunk size for resumable uploads (bytes)
  CHUNK_SIZE: 1048576, // 1 MB chunks
} as const;

// ============================================================================
// SERVICE-SPECIFIC TIMEOUTS
// ============================================================================

export const SERVICE_TIMEOUTS = {
  // Address API timeouts
  ADDRESS_API: HTTP_TIMEOUTS.SHORT, // 5 seconds
  SHIPROCKET: HTTP_TIMEOUTS.LONG, // 30 seconds
  PAYMENT_GATEWAY: HTTP_TIMEOUTS.LONG, // 30 seconds
  EMAIL_SERVICE: HTTP_TIMEOUTS.MEDIUM, // 10 seconds
  WHATSAPP_API: HTTP_TIMEOUTS.SHORT, // 5 seconds

  // File operations
  FILE_UPLOAD: HTTP_TIMEOUTS.EXTRA_LONG, // 60 seconds
  FILE_DOWNLOAD: HTTP_TIMEOUTS.LONG, // 30 seconds

  // Database operations
  DB_QUERY: HTTP_TIMEOUTS.MEDIUM, // 10 seconds
  DB_TRANSACTION: HTTP_TIMEOUTS.LONG, // 30 seconds
} as const;

// ============================================================================
// API RESPONSE CODES
// ============================================================================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirect
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ============================================================================
// EXPONENTIAL BACKOFF HELPER
// ============================================================================

/**
 * Calculate exponential backoff delay with jitter
 * @param attemptNumber The attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(attemptNumber: number): number {
  const baseDelay =
    RETRY_CONFIG.INITIAL_DELAY *
    Math.pow(RETRY_CONFIG.EXPONENTIAL_BASE, attemptNumber);
  const cappedDelay = Math.min(baseDelay, RETRY_CONFIG.MAX_DELAY);

  if (!RETRY_CONFIG.JITTER_ENABLED) {
    return cappedDelay;
  }

  // Add random jitter
  const jitter = cappedDelay * RETRY_CONFIG.JITTER_FACTOR * Math.random();
  return cappedDelay + jitter;
}

/**
 * Check if HTTP status code indicates a retryable error
 * @param status HTTP status code
 * @returns True if should retry
 */
export function isRetryableStatus(status: number): boolean {
  return (
    status === HTTP_STATUS.SERVICE_UNAVAILABLE ||
    status === HTTP_STATUS.GATEWAY_TIMEOUT ||
    status === HTTP_STATUS.TOO_MANY_REQUESTS ||
    (status >= 500 && status < 600)
  );
}
