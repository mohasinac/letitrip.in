// Thin shim - real implementation in @mohasinac/monitoring
export {
  getCacheMetrics,
  recordCacheHit,
  recordCacheMiss,
  resetCacheMetrics,
  getCacheHitRate,
  isCacheHitRateLow,
  getCacheStatistics,
} from "@mohasinac/appkit/monitoring";
