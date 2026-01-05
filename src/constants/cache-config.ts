/**
 * Cache Configuration Constants
 *
 * Centralized cache duration settings for various API integrations and features.
 */

import { TIME_MS } from "./time-constants";

/**
 * Address API Cache Configuration
 * Controls caching behavior for postal code and ZIP code lookups
 */
export const ADDRESS_API_CACHE = {
  /**
   * Postal PIN code cache (India-specific)
   * PIN codes change infrequently, so a 24-hour cache is appropriate
   */
  POSTAL_PINCODE: {
    duration: TIME_MS.DAY,
    description: "24 hours - PIN codes don't change frequently",
  },

  /**
   * International postal code cache (Zippopotam.us)
   * Similar to PIN codes, international codes are static
   */
  ZIPPOPOTAM: {
    duration: TIME_MS.DAY,
    description: "24 hours - international codes are static",
  },
} as const;

/**
 * General Cache Durations
 * Standard cache durations for common use cases
 */
export const CACHE_DURATIONS = {
  VERY_SHORT: TIME_MS.MINUTE * 5, // 5 minutes
  SHORT: TIME_MS.MINUTE * 15, // 15 minutes
  MEDIUM: TIME_MS.HOUR, // 1 hour
  LONG: TIME_MS.DAY, // 24 hours
  EXTRA_LONG: TIME_MS.DAY * 7, // 7 days
} as const;

/**
 * Feature-Specific Cache Configurations
 */
export const FEATURE_CACHE = {
  /**
   * Category listings - cached for medium duration
   * Categories change less frequently than products
   */
  CATEGORIES: {
    duration: CACHE_DURATIONS.MEDIUM,
    description: "1 hour - categories change infrequently",
  },

  /**
   * Product search results - cached for short duration
   * Products and inventory change frequently
   */
  PRODUCT_SEARCH: {
    duration: CACHE_DURATIONS.SHORT,
    description: "15 minutes - inventory changes frequently",
  },

  /**
   * User profile data - minimal caching
   * User data should be relatively fresh
   */
  USER_PROFILE: {
    duration: CACHE_DURATIONS.VERY_SHORT,
    description: "5 minutes - user data should be fresh",
  },

  /**
   * Auction data - minimal caching
   * Auction state changes frequently (bids, time remaining)
   */
  AUCTION_DATA: {
    duration: CACHE_DURATIONS.VERY_SHORT,
    description: "5 minutes - auction state changes frequently",
  },

  /**
   * Static content (blog posts, about pages)
   * Can be cached longer as changes are infrequent
   */
  STATIC_CONTENT: {
    duration: CACHE_DURATIONS.LONG,
    description: "24 hours - static content changes rarely",
  },
} as const;

// Type exports for stricter typing
export type AddressCacheConfig = typeof ADDRESS_API_CACHE;
export type FeatureCacheConfig = typeof FEATURE_CACHE;
