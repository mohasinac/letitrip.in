/**
 * Monitoring Module
 *
 * Centralized exports for all monitoring utilities
 */

// Performance monitoring
export {
  startTrace,
  stopTrace,
  addTraceAttribute,
  addTraceMetric,
  incrementTraceMetric,
  measureAsync,
  measureSync,
  trackPageLoad,
  trackApiRequest,
  trackComponentRender,
  PERFORMANCE_TRACES,
  type PerformanceTraceType,
} from "./performance";

// Analytics
export {
  trackEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  trackPageView,
  trackAuth,
  trackEcommerce,
  trackContent,
  trackForm,
  trackAdmin,
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
} from "./analytics";

// Error tracking — core from @mohasinac/monitoring (via shim), stubs appended below
import { trackError as _trackError } from "./error-tracking";
export {
  trackError,
  trackApiError,
  trackAuthError,
  trackValidationError,
  trackDatabaseError,
  trackPermissionError,
  ErrorSeverity,
  ErrorCategory,
  type TrackedError,
  type ErrorContext,
} from "./error-tracking";

// Error tracking — extras not yet in package (stubs)
export function trackComponentError(
  _error: unknown,
  _component?: string,
): void {}
export function setErrorTrackingUser(_uid: string | null): void {}
export function clearErrorTrackingUser(): void {}
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
): T {
  return fn;
}
/** Sets up window.onerror / unhandledrejection handlers for client-side tracking. */
export function setupGlobalErrorHandler(): void {
  if (typeof window === "undefined") return;
  window.addEventListener("unhandledrejection", (event) => {
    _trackError(event.reason);
  });
}

// Cache metrics — core from @mohasinac/monitoring (via shim), stubs appended below
export {
  getCacheMetrics,
  recordCacheHit,
  recordCacheMiss,
  resetCacheMetrics,
  getCacheHitRate,
  isCacheHitRateLow,
  getCacheStatistics,
} from "./cache-metrics";

// Cache metrics — extras not yet in package (stubs)
import { getCacheStatistics as _getCacheStats } from "./cache-metrics";
export function getCacheDashboardData(): Record<string, unknown> {
  return _getCacheStats();
}
export function monitorCachePerformance(): void {}
export function setupCacheMonitoring(): void {}
