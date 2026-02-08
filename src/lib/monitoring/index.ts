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

// Error tracking
export {
  trackError,
  trackApiError,
  trackAuthError,
  trackValidationError,
  trackDatabaseError,
  trackComponentError,
  trackPermissionError,
  setErrorTrackingUser,
  clearErrorTrackingUser,
  withErrorTracking,
  setupGlobalErrorHandler,
  ErrorSeverity,
  ErrorCategory,
  type TrackedError,
  type ErrorContext,
} from "./error-tracking";

// Cache metrics
export {
  getCacheMetrics,
  recordCacheHit,
  recordCacheMiss,
  resetCacheMetrics,
  getCacheHitRate,
  isCacheHitRateLow,
  getCacheStatistics,
  getCacheDashboardData,
  monitorCachePerformance,
  setupCacheMonitoring,
} from "./cache-metrics";
