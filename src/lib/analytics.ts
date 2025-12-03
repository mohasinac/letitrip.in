/**
 * Analytics & Monitoring Helper
 * Uses Firebase Analytics (already in project - FREE tier)
 * Tracks performance metrics and user actions
 */

import { logEvent, isSupported } from "firebase/analytics";
import { analytics as firebaseAnalytics } from "@/app/api/lib/firebase/app";
import { logError } from "@/lib/firebase-error-logger";

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
  params?: Record<string, any>,
): void {
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, params);
  } catch (error) {
    logError(error, { component: "analytics.trackEvent", eventName, params });
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

/**
 * Track product view
 */
export function trackProductView(productId: string, productName: string): void {
  trackEvent("view_item", {
    item_id: productId,
    item_name: productName,
  });
}

/**
 * Track auction bid
 */
export function trackAuctionBid(auctionId: string, bidAmount: number): void {
  trackEvent("auction_bid", {
    auction_id: auctionId,
    bid_amount: bidAmount,
  });
}

/**
 * Track cart actions
 */
export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number,
): void {
  trackEvent("add_to_cart", {
    item_id: productId,
    item_name: productName,
    price,
    quantity,
  });
}

export function trackRemoveFromCart(
  productId: string,
  productName: string,
): void {
  trackEvent("remove_from_cart", {
    item_id: productId,
    item_name: productName,
  });
}

/**
 * Track checkout
 */
export function trackBeginCheckout(
  cartItems: any[],
  totalAmount: number,
): void {
  trackEvent("begin_checkout", {
    value: totalAmount,
    items: cartItems.map((item) => ({
      item_id: item.id,
      item_name: item.productName,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

export function trackPurchase(
  orderId: string,
  totalAmount: number,
  items: any[],
): void {
  trackEvent("purchase", {
    transaction_id: orderId,
    value: totalAmount,
    items: items.map((item) => ({
      item_id: item.productId,
      item_name: item.productName,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track search
 */
export function trackSearch(searchQuery: string, resultsCount: number): void {
  trackEvent("search", {
    search_term: searchQuery,
    results_count: resultsCount,
  });
}

/**
 * Track page performance
 */
export function trackPagePerformance(pageName: string, loadTime: number): void {
  trackEvent("page_performance", {
    page_name: pageName,
    load_time_ms: loadTime,
  });
}
