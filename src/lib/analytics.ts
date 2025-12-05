/**
 * @fileoverview TypeScript Module
 * @module src/lib/analytics
 * @description This file contains functionality related to analytics
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Analytics & Monitoring Helper
 * Uses Firebase Analytics (already in project - FREE tier)
 * Tracks performance metrics and user actions
 */

import { analytics as firebaseAnalytics } from "@/app/api/lib/firebase/app";
import { logError } from "@/lib/firebase-error-logger";
import { isSupported, logEvent } from "firebase/analytics";

// Initialize analytics (client-side only)
let analytics: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = firebaseAnalytics;
    }
  });
}

/**
 * Track custom event
 */
/**
 * Performs track event operation
 *
 * @param {string} eventName - Name of event
 * @param {Record<string, any>} [params] - The params
 *
 * @returns {void} No return value
 *
 * @example
 * trackEvent("example", params);
 */

/**
 * Performs track event operation
 *
 * @returns {string} The trackevent result
 *
 * @example
 * trackEvent();
 */

export function trackEvent(
  /** Event Name */
  eventName: string,
  /** Params */
  params?: Record<string, any>
): void {
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, params);
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "analytics.trackEvent",
      /** Metadata */
      metadata: { eventName, params },
    });
  }
}

/**
 * Track slow API responses (>1000ms)
 */
/**
 * Performs track slow a p i operation
 *
 * @param {string} endpoint - The endpoint
 * @param {number} duration - The duration
 *
 * @returns {void} No return value
 *
 * @example
 * trackSlowAPI("example", 123);
 */

/**
 * Performs track slow a p i operation
 *
 * @param {string} endpoint - The endpoint
 * @param {number} duration - The duration
 *
 * @returns {void} No return value
 *
 * @example
 * trackSlowAPI("example", 123);
 */

export function trackSlowAPI(endpoint: string, duration: number): void {
  if (duration > 1000) {
    trackEvent("slow_api", {
      endpoint,
      duration_ms: duration,
      /** Threshold */
      threshold: 1000,
    });
  }
}

/**
 * Track API errors
 */
/**
 * Performs track a p i error operation
 *
 * @param {string} endpoint - The endpoint
 * @param {any} error - Error object
 *
 * @returns {void} No return value
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * trackAPIError("example", error);
 */

/**
 * Performs track a p i error operation
 *
 * @param {string} endpoint - The endpoint
 * @param {any} error - Error object
 *
 * @returns {void} No return value
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * trackAPIError("example", error);
 */

export function trackAPIError(endpoint: string, error: any): void {
  trackEvent("api_error", {
    endpoint,
    error_message: error?.message || "Unknown error",
    error_code: error?.code || "unknown",
  });
}

/**
 * Track cache performance
 */
/**
 * Performs track cache hit operation
 *
 * @param {string} cacheKey - The cache key
 * @param {boolean} hit - Whether hit
 *
 * @returns {void} No return value
 *
 * @example
 * trackCacheHit("example", true);
 */

/**
 * Performs track cache hit operation
 *
 * @param {string} cacheKey - The cache key
 * @param {boolean} hit - Whether hit
 *
 * @returns {void} No return value
 *
 * @example
 * trackCacheHit("example", true);
 */

export function trackCacheHit(cacheKey: string, hit: boolean): void {
  trackEvent("cache_performance", {
    cache_key: cacheKey,
    cache_hit: hit,
  });
}

// Removed unused analytics functions:
// - trackProductView, trackAuctionBid, trackAddToCart, trackRemoveFromCart
// - trackBeginCheckout, trackPurchase, trackSearch, trackPagePerformance
// These were only referenced in test files and not used in production code
// If needed in the future, use trackEvent() directly with custom params
