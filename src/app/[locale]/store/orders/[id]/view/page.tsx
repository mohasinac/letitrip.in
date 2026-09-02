"use client";

import { Suspense } from "react";

import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Container, ROUTES, Row, SELLER_ENDPOINTS, SellerOrderDetailPanel, Section, Text } from "@mohasinac/appkit/client";



function StoreOrderViewPageInner() {
  const router = useRouter();
  const params = useParams();
  const orderId = String(params.id ?? "");

  return (
    <Section padding="y-xl">
      <Container>
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.STORE.ORDERS)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← Orders
          </Link>
        </Row>
        <Text weight="medium" size="lg" className="mb-4">
          Order {orderId}
        </Text>
        <SellerOrderDetailPanel
          orderId={orderId}
          apiBase={SELLER_ENDPOINTS.ORDERS}
          onClose={() => router.push(String(ROUTES.STORE.ORDERS))}
        />
      </Container>
    </Section>
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
export default function StoreOrderViewPage() {
  return (
    <Suspense>
      <StoreOrderViewPageInner />
    </Suspense>
  );
}
