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
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
