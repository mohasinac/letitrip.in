/**
 * API & Network Configuration Constants
 * (Cloud Functions)
 *
 * Centralized constants for HTTP timeouts, retries, rate limits,
 * and other network-related configurations used in Cloud Functions.
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
  EXPONENTIAL_BASE: 2, // Exponential backoff multiplier
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
