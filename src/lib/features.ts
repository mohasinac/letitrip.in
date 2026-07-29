import { cache } from "react";
import { NextResponse } from "next/server";

/**
 * All feature flags. Each maps to a FEATURE_<NAME>=true/false env var.
 * Default is false (disabled) — every flag must be explicitly enabled.
 */
export const FEATURE_FLAGS = [
  "AUCTIONS",
  "PREORDERS",
  "PRIZE_DRAWS",
  "RAFFLE",
  "BLOG",
  "EVENTS",
  "CHAT",
  "SCAM_REGISTRY",
  "RAZORPAY",
  "COD",
  "COUPONS",
  "PAYOUTS",
  "SHIPROCKET",
  "ANALYTICS_FUNCTION",
  "GST",
  "MOCK_PAYMENT",
] as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];

/**
 * Returns true if the feature flag FEATURE_<name> is set to "true".
 * Wrapped in React.cache so repeated calls within one request are free.
 * Server-only — reads process.env at request time.
 */
export const getFlag = cache((name: FeatureFlag): boolean => {
  const val = process.env[`FEATURE_${name}`];
  return val?.toLowerCase() === "true";
});

/**
 * Returns true if ALL the given flags are enabled.
 */
export function allFlagsEnabled(...names: FeatureFlag[]): boolean {
  return names.every((n) => getFlag(n));
}

/**
 * Returns true if ANY of the given flags is enabled.
 */
export function anyFlagEnabled(...names: FeatureFlag[]): boolean {
  return names.some((n) => getFlag(n));
}

/**
 * Wraps a route handler so that it returns 404 when the feature flag is off.
 * Use at the export site:
 *   export const GET = withFeatureGuard("AUCTIONS", withProviders(handler));
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- route handler signatures vary
export function withFeatureGuard(flag: FeatureFlag, handler: (...args: any[]) => any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- route handler signatures vary
  return (...args: any[]) => {
    if (!getFlag(flag)) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return handler(...args);
  };
}
