/**
 * Application Configuration Constants
 * 
 * Centralized configuration values
 */

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
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
} as const;
