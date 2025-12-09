/**
 * Analytics & Monitoring Helper
 * Uses Firebase Analytics (already in project - FREE tier)
 * Tracks performance metrics and user actions
 *
 * CODE PATTERNS:
 * 1. Client-side only initialization with typeof window check
 * 2. Async initialization with isSupported() promise
 * 3. Defensive null checks in all tracking functions
 * 4. Error handling with logError to prevent tracking failures from breaking app
 * 5. Optional chaining (?.) for safe property access on error objects
 *
 * BUG FIXES:
 * - Fixed race condition: analytics might be null during initialization
 * - Added proper error handling with try-catch blocks
 * - Uses optional chaining for error properties to handle various error types
 */

import { analytics as firebaseAnalytics } from "@/app/api/lib/firebase/app";
import { logError } from "@/lib/firebase-error-logger";
import { isSupported, logEvent } from "firebase/analytics";

// Initialize analytics (client-side only)
// Note: This is async, so analytics may be null initially
let analytics: any = null;
let analyticsInitialized = false;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = firebaseAnalytics;
        analyticsInitialized = true;
      }
    })
    .catch((error) => {
      console.warn("Firebase Analytics initialization failed:", error);
      analyticsInitialized = false;
    });
}

/**
 * Track custom event
 *
 * PATTERN: Safe event tracking with validation and error handling
 * - Validates input before attempting to log
 * - Handles analytics being null (SSR or unsupported browsers)
 * - Catches and logs errors without breaking app flow
 *
 * @param eventName - Name of the event to track (required)
 * @param params - Optional event parameters
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  if (!analytics) return;

  // Input validation: eventName must be non-empty string
  if (!eventName || typeof eventName !== "string") {
    console.warn("trackEvent: Invalid event name", eventName);
    return;
  }

  // Trim and validate eventName is not just whitespace
  const trimmedEventName = eventName.trim();
  if (!trimmedEventName) {
    console.warn(
      "trackEvent: Event name is empty or whitespace only",
      eventName
    );
    return;
  }

  try {
    logEvent(analytics, trimmedEventName, params);
  } catch (error: any) {
    logError(error as Error, {
      component: "analytics.trackEvent",
      metadata: { eventName: trimmedEventName, params },
    });
  }
}

/**
 * Track slow API responses (>1000ms)
 *
 * PATTERN: Performance monitoring with threshold-based tracking
 * - Only tracks when duration exceeds threshold (>1000ms, not >=)
 * - Includes endpoint, duration, and threshold in event data
 * - Validates inputs before tracking
 *
 * EDGE CASES HANDLED:
 * - NaN duration: Won't track (NaN > 1000 is false)
 * - Negative duration: Won't track
 * - Infinity duration: Will track (considered slow)
 * - Zero duration: Won't track
 *
 * @param endpoint - API endpoint path
 * @param duration - Request duration in milliseconds
 */
export function trackSlowAPI(endpoint: string, duration: number): void {
  // Validate inputs
  if (typeof duration !== "number" || isNaN(duration)) {
    console.warn("trackSlowAPI: Invalid duration", { endpoint, duration });
    return;
  }

  if (!endpoint || typeof endpoint !== "string") {
    console.warn("trackSlowAPI: Invalid endpoint", { endpoint, duration });
    return;
  }

  // Trim endpoint and validate it's not just whitespace
  const trimmedEndpoint = endpoint.trim();
  if (!trimmedEndpoint) {
    console.warn("trackSlowAPI: Endpoint is empty or whitespace only", {
      endpoint,
      duration,
    });
    return;
  }

  // Track only if duration exceeds threshold
  if (duration > 1000) {
    trackEvent("slow_api", {
      endpoint: trimmedEndpoint,
      duration_ms: duration,
      threshold: 1000,
    });
  }
}

/**
 * Track API errors
 *
 * PATTERN: Error tracking with safe property access
 * - Uses optional chaining (?.) for safe property access
 * - Handles various error types: Error objects, strings, null, undefined
 * - Provides sensible defaults for missing properties
 * - Validates endpoint input
 *
 * ERROR TYPES HANDLED:
 * - Error objects: { message, code, stack }
 * - String errors: "Something went wrong"
 * - null/undefined: Defaults to "Unknown error"
 * - Plain objects: { status, details } without message property
 *
 * @param endpoint - API endpoint that failed
 * @param error - Error object, string, or any error-like value
 */
export function trackAPIError(endpoint: string, error: any): void {
  // Validate endpoint
  if (!endpoint || typeof endpoint !== "string") {
    console.warn("trackAPIError: Invalid endpoint", { endpoint, error });
    // Still track with empty endpoint to not lose error data, but only if error is valid
    if (!error) {
      return; // Don't track if both endpoint and error are invalid
    }
  }

  // Extract error message with fallbacks for different error types
  let errorMessage = "Unknown error";
  if (error) {
    if (typeof error === "string") {
      errorMessage = error;
    } else {
      // Try to access message property safely (getter might throw)
      try {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.toString) {
          try {
            const str = error.toString();
            if (str !== "[object Object]") {
              errorMessage = str;
            }
          } catch {
            // toString() threw an error, keep default message
          }
        }
      } catch {
        // Property access threw an error (getter), keep default message
      }
    }
  }

  // Extract error code with type safety
  const errorCode = error?.code?.toString() || "unknown";

  trackEvent("api_error", {
    endpoint: endpoint || "unknown_endpoint",
    error_message: errorMessage,
    error_code: errorCode,
  });
}

/**
 * Track cache performance
 *
 * PATTERN: Cache performance monitoring
 * - Tracks both cache hits (true) and misses (false)
 * - Includes cache key for identifying which resource was accessed
 * - Validates inputs to ensure data quality
 *
 * USE CASES:
 * - Product data caching: trackCacheHit("product:123", true)
 * - Search result caching: trackCacheHit("search:electronics", false)
 * - User profile caching: trackCacheHit("user:abc", true)
 *
 * @param cacheKey - Unique identifier for the cached resource
 * @param hit - true if cache hit, false if cache miss
 */
export function trackCacheHit(cacheKey: string, hit: boolean): void {
  // Validate inputs
  if (typeof cacheKey !== "string") {
    console.warn("trackCacheHit: Invalid cache key", { cacheKey, hit });
    return;
  }

  if (typeof hit !== "boolean") {
    console.warn("trackCacheHit: Invalid hit value", { cacheKey, hit });
    return;
  }

  // Trim cache key and validate it's not just whitespace
  const trimmedCacheKey = cacheKey.trim();
  if (!trimmedCacheKey) {
    console.warn("trackCacheHit: Cache key is empty or whitespace only", {
      cacheKey,
      hit,
    });
    return;
  }

  trackEvent("cache_performance", {
    cache_key: trimmedCacheKey,
    cache_hit: hit,
  });
}

// Removed unused analytics functions:
// - trackProductView, trackAuctionBid, trackAddToCart, trackRemoveFromCart
// - trackBeginCheckout, trackPurchase, trackSearch, trackPagePerformance
// These were only referenced in test files and not used in production code
// If needed in the future, use trackEvent() directly with custom params
