import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { ACCOUNT_ENDPOINTS, ROUTES } from "@mohasinac/appkit";

/*
 * Auth-gated editor behind RoleGuard, rendering per-record data — there is
 * nothing meaningful to prerender, and the client editor inside reaches
 * useSearchParams(), which throws during static export without a Suspense
 * boundary (Root Cause #17). Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export const metadata = { title: "Bid" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="buyer"
      endpoint={ACCOUNT_ENDPOINTS.BID_BY_ID}
      backHref={String(ROUTES.USER.BIDS)}
      backLabel="Back to my bids"
    />
  );
}
