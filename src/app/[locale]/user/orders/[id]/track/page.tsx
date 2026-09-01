"use client";

import { Suspense } from "react";

import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Container,
  Div,
  OrderStatusTimeline,
  ROUTES,
  Row,
  Section,
  Text,
  UserOrderTrackView,
  useOrder,
} from "@mohasinac/appkit/client";



function TrackOrderPageInner() {
  const params = useParams();
  const orderId = String(params.id ?? "");
  const { order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <Row className="min-h-screen" align="center" justify="center">
        <Div className="h-6 w-6 animate-spin border-2 border-[var(--appkit-color-primary)] border-t-transparent" rounded="full" />
      </Row>
    );
  }

  return (
    <Section padding="y-xl">
      <Container>
        <UserOrderTrackView
          title="Track order"
          isNotFound={!order}
          renderBack={() => (
            <Row className="mb-4">
              <Link
                href={String(ROUTES.USER.ORDERS)}
                className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
              >
                ← My Orders
              </Link>
            </Row>
          )}
          renderNotFound={() => (
            <Div rounded="xl" padding="lg" surface="muted" border="default">
              <Text size="sm" color="muted">Order not found.</Text>
            </Div>
          )}
          renderTracking={() =>
            order ? (
              <OrderStatusTimeline
                orderStatus={order.orderStatus}
                orderDate={order.orderDate}
                shippingDate={order.shippingDate}
                deliveryDate={order.deliveryDate}
                cancellationDate={order.cancellationDate}
                trackingNumber={order.trackingNumber}
                shippingCarrier={order.shippingCarrier}
                trackingUrl={order.trackingUrl}
              />
            ) : null
          }
        />
      </Container>
    </Section>
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
export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderPageInner />
    </Suspense>
  );
}
