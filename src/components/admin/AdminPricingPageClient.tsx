"use client";

import { AdminPricingView } from "@mohasinac/appkit/features/pricing/components/AdminPricingView";

/**
 * The consumer-side mount. Exists so the page shim stays a server component
 * and the `"use client"` boundary sits at one named file — the same shape as
 * `AdminDisputeReasonsPageClient`.
 */
export function AdminPricingPageClient() {
  return <AdminPricingView />;
}
