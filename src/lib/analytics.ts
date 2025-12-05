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
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, params);
  } catch (error: any) {
    logError(error as Error, {
      component: "analytics.trackEvent",
      metadata: { eventName, params },
    });
  }
}

/**
 * Track slow API responses (>1000ms)
 */
export function trackSlowAPI(endpoint: string, duration: number): void {
  if (duration > 1000) {
    trackEvent("slow_api", {
      endpoint,
      duration_ms: duration,
      threshold: 1000,
    });
  }
}

/**
 * Track API errors
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
