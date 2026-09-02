"use client";

import { Suspense } from "react";
import { UserReturnsView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";



function PageInner() {
  const router = useRouter();
  return (
    <UserReturnsView
      onOrderClick={(order) => router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))}
    />
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
