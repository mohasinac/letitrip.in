/**
 * Application Configuration Constants
 *
 * Centralized configuration values
 */

/**
 * Platform business-day anchor.
 *
 * A new platform day starts at 10:00 AM IST every day.
 *
 * Rule:
 *   - An order/event before 10:00 AM IST belongs to the previous business day.
 *   - Day 1 = the next upcoming 10:00 AM IST at or after the event.
 *   - "N days" (payouts, pending windows, etc.) counts N 10:00 AM IST
 *     boundaries after the reference event.
 *
 * Use `getBusinessDaysRemaining` / `getBusinessDayEligibilityDate` from
 * `@/utils` to compute countdowns in UI components and Server Actions.
 */
export const BUSINESS_DAY_CONFIG = {
  /** Hour (IST) at which the new platform day starts. */
  START_HOUR_IST: 10,
  /** IANA timezone for all business-day calculations. */
  TIMEZONE: "Asia/Kolkata",
  /** UTC equivalent: 10:00 AM IST = 04:30 UTC. */
  START_HOUR_UTC: 4,
  START_MINUTE_UTC: 30,
} as const;

export const TOKEN_CONFIG = {
  // Token expiry times (in milliseconds)
  EMAIL_VERIFICATION: {
    EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours
    EXPIRY_HOURS: 24,
  },
  PASSWORD_RESET: {
    EXPIRY_MS: 60 * 60 * 1000, // 1 hour
    EXPIRY_MINUTES: 60,
  },
  SESSION: {
    MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
  },
} as const;

export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  BCRYPT_ROUNDS: 12,
  REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_LOWERCASE: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
} as const;

export const VALIDATION_CONFIG = {
  EMAIL: {
    MAX_LENGTH: 255,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword"],
} as const;

/**
 * Locale, currency, and regional defaults.
 *
 * Single source of truth for regional settings.
 * All formatters, analytics payloads, and site defaults
 * MUST derive from these values.
 *
 * To add a new locale/currency in future:
 *   1. Add the locale string to SUPPORTED_LOCALES
 *   2. Update the relevant messages/ JSON files
 *   3. Update src/i18n/routing.ts locales array
 *   4. Adjust DEFAULT_LOCALE if needed
 */
export const LOCALE_CONFIG = {
  /** BCP 47 language tag used for all Intl formatters */
  DEFAULT_LOCALE: "en-IN",
  /** ISO 4217 currency code */
  DEFAULT_CURRENCY: "INR",
  /** Unicode currency symbol */
  CURRENCY_SYMBOL: "₹",
  /** Default country name (display) */
  DEFAULT_COUNTRY: "India",
  /** Default city name (display) */
  DEFAULT_CITY: "Mumbai",
  /** Default country ISO-2 code */
  DEFAULT_COUNTRY_CODE: "IN",
  /** Default international dialling prefix */
  DEFAULT_PHONE_CODE: "+91",
  /** IANA timezone — must stay in sync with BUSINESS_DAY_CONFIG.TIMEZONE */
  TIMEZONE: "Asia/Kolkata",
  /**
   * Supported locales list — routing.ts must mirror this.
   * Currently English-only; extend here when adding new languages.
   */
  SUPPORTED_LOCALES: ["en"] as const,
} as const;

