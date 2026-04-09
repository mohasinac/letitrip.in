// Thin shim - real implementation in @mohasinac/security
export {
  rateLimit,
  applyRateLimit,
  rateLimitByIdentifier,
  RateLimitPresets,
  clearRateLimitStore,
} from "@mohasinac/appkit/security";
export type {
  RateLimitConfig,
  RateLimitResult,
} from "@mohasinac/appkit/security";
