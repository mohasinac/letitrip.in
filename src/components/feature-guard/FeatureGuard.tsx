"use client";

import { type FeatureFlag } from "@/lib/features";

interface FeatureGuardProps {
  /** The feature flag name to check (e.g. "AUCTIONS") */
  flag: FeatureFlag;
  /** Whether the flag is currently enabled (resolved server-side, passed as prop) */
  enabled: boolean;
  children: React.ReactNode;
  /** What to render when disabled. Defaults to null. */
  fallback?: React.ReactNode;
}

/**
 * Client-side guard that renders children only when `enabled` is true.
 * The `enabled` value must be resolved server-side via getFlag() and passed
 * as a prop — this component never reads process.env directly (client safety).
 *
 * Usage in a Server Component:
 *   import { getFlag } from "@/lib/features";
 *   <FeatureGuard flag="AUCTIONS" enabled={getFlag("AUCTIONS")}>
 *     <AuctionNav />
 *   </FeatureGuard>
 */
export function FeatureGuard({ enabled, children, fallback = null }: FeatureGuardProps) {
  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}
