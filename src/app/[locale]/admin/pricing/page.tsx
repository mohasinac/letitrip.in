import { AdminPricingPageClient } from "@/components/admin/AdminPricingPageClient";

export const metadata = { title: "Pricing — Admin" };

/**
 * Admin → Finance → Pricing.
 *
 * A shim over a client component. The page fetches a join the server already
 * knows how to build (`GET /api/admin/pricing`) and refetches after every
 * change, so the read has to be per-viewer and current — `editable` is
 * computed against the caller's own role. `admin/layout.tsx` already awaits
 * the session and makes this subtree dynamic, so a server read here would
 * still be prerender-attempted for no gain.
 */
export default function Page() {
  return <AdminPricingPageClient />;
}
