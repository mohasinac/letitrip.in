/**
 * Time Constants
 * Centralized time-related constants to eliminate magic numbers throughout the codebase
 *
 * @status NEW - Created to replace hardcoded time values
 * @epic General - Code Quality & Refactoring
 */

// ============================================================================
// MILLISECOND CONVERSIONS
// ============================================================================

export const TIME_MS = {
  // Basic units
  SECOND: 1000,
  MINUTE: 1000 * 60,
  HOUR: 1000 * 60 * 60,
  DAY: 1000 * 60 * 60 * 24,
  WEEK: 1000 * 60 * 60 * 24 * 7,
  MONTH: 1000 * 60 * 60 * 24 * 30, // Approximate
  YEAR: 1000 * 60 * 60 * 24 * 365, // Approximate (non-leap)
} as const;

// ============================================================================
// AUCTION TIMING CONSTANTS
// ============================================================================

export const AUCTION_TIMING = {
  // Minimum and maximum auction durations
  MIN_DURATION_HOURS: 1,
  MAX_DURATION_HOURS: 720, // 30 days
  MAX_DURATION_DAYS: 30,

  // Payment and delivery
  PAYMENT_DUE_HOURS: 48,
  DEFAULT_PAYMENT_DUE_HOURS: 48,

  // Extension limits
  MAX_EXTENSION_HOURS: 24,
  DEFAULT_EXTENSION_HOURS: 24,

  // "Soon" thresholds (for UI notifications)
  ENDING_SOON_HOURS: 24, // Auction ending in next 24 hours
  STARTING_SOON_HOURS: 24, // Auction starting in next 24 hours
  ENDING_SOON_MS: 24 * TIME_MS.HOUR,
  STARTING_SOON_MS: 24 * TIME_MS.HOUR,

  // Badge display thresholds
  ENDING_SOON_BADGE_THRESHOLD_SECONDS: 3600, // Show "Ending Soon" badge when < 1 hour remaining

  // Watchlist notifications
  DEFAULT_NOTIFY_BEFORE_END_MINUTES: 60,
} as const;

// ============================================================================
// RETURN POLICY CONSTANTS
// ============================================================================

export const RETURN_POLICY = {
  MAX_RETURN_WINDOW_DAYS: 14,
  MAX_RETURN_WINDOW_DAYS_STANDARD: 30,
  DEFAULT_RETURN_WINDOW_DAYS: 0, // No returns by default
} as const;

// ============================================================================
// BIDDING CONSTRAINTS
// ============================================================================

export const BIDDING_CONSTRAINTS = {
  // Bid amounts
  MIN_STARTING_BID: 1, // ₹1 minimum
  MAX_STARTING_BID: 10000000, // ₹1 Crore maximum
  DEFAULT_BID_INCREMENT: 10, // ₹10 default increment
  MIN_BID_INCREMENT: 1,
  MAX_BID_INCREMENT: 1000000,

  // Auto-bidding
  DEFAULT_ALLOW_AUTO_BID: true,
} as const;

// ============================================================================
// DURATION & DURATION CONSTRAINTS
// ============================================================================

export const DURATION_CONSTRAINTS = {
  MAX_DURATION_HOURS_FOR_EXTENSION: 24,
  MAX_IMAGES: 10,
  MAX_VIDEOS: 3,
  MAX_DESCRIPTION_LENGTH: 5000,
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_SHORT_DESCRIPTION_LENGTH: 200,
  MAX_TAGS: 20,
  MAX_TAG_LENGTH: 50,
} as const;

// ============================================================================
// FEATURED AUCTION CONSTRAINTS
// ============================================================================

export const FEATURED_AUCTION = {
  MIN_PRIORITY: 0,
  MAX_PRIORITY: 100,
  DEFAULT_PRIORITY: 50,
} as const;

// ============================================================================
// CACHE DURATIONS
// ============================================================================

export const CACHE_DURATION = {
  // Short-lived cache (5 minutes)
  SHORT: 5 * TIME_MS.MINUTE,

  // Medium-lived cache (1 hour)
  MEDIUM: 1 * TIME_MS.HOUR,

  // Long-lived cache (1 day)
  LONG: 24 * TIME_MS.HOUR,

  // Extra long cache (1 week)
  EXTRA_LONG: 7 * TIME_MS.DAY,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert hours to milliseconds
 */
export function hoursToMs(hours: number): number {
  return hours * TIME_MS.HOUR;
}

/**
 * Convert days to milliseconds
 */
export function daysToMs(days: number): number {
  return days * TIME_MS.DAY;
}

/**
 * Convert milliseconds to hours
 */
export function msToHours(ms: number): number {
  return ms / TIME_MS.HOUR;
}

/**
 * Convert milliseconds to days
 */
export function msToDays(ms: number): number {
  return ms / TIME_MS.DAY;
}

/**
 * Format milliseconds to human-readable format
 */
export function formatDuration(ms: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const days = Math.floor(ms / TIME_MS.DAY);
  const hours = Math.floor((ms % TIME_MS.DAY) / TIME_MS.HOUR);
  const minutes = Math.floor((ms % TIME_MS.HOUR) / TIME_MS.MINUTE);
  const seconds = Math.floor((ms % TIME_MS.MINUTE) / TIME_MS.SECOND);

  return { days, hours, minutes, seconds };
}
