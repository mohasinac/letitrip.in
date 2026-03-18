// Thin shim - real implementation in @mohasinac/security
export {
  rateLimit,
  applyRateLimit,
  rateLimitByIdentifier,
  RateLimitPresets,
  clearRateLimitStore,
} from "@mohasinac/security";
export type { RateLimitConfig, RateLimitResult } from "@mohasinac/security";
