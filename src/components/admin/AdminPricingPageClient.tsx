"use client";

import { AdminPricingView } from "@mohasinac/appkit/features/pricing/components/AdminPricingView";
import { API_ROUTES } from "@/constants/api";

/**
 * The consumer-side mount. Exists so the page shim stays a server component
 * and the `"use client"` boundary sits at one named file — the same shape as
 * `AdminDisputeReasonsPageClient`.
 */
export function AdminPricingPageClient() {
  return <AdminPricingView endpoint={API_ROUTES.ADMIN.PRICING} />;
}
