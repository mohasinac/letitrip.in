"use client";

import { Suspense } from "react";

import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Button,
  Container,
  Div,
  MediaImage,
  OrderStatusTimeline,
  ROUTES,
  Row,
  Section,
  Span,
  Stack,
  Text,
  TextLink,
  UserOrderTrackView,
  shortOrderRef,
  useOrder,
} from "@mohasinac/appkit/client";

/**
 * /user/orders/[id]/track
 *
 * 🛑 This page used to render the timeline and NOTHING else — no items, no
 * delivery address, no carrier, no way on to the invoice or a return. All of
 * that is already on the order document, so it was a wiring gap rather than a
 * data gap (Root Cause #52's shape: a surface never connected to data already
 * in hand).
 *
 * No money anywhere on this page. "Where is my parcel" does not need a total,
 * and omitting it keeps the page clear of the guest-price question entirely.
 */
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

  const items = order?.items ?? [];

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
              <Stack gap="lg">
                {/*
                  The reference a buyer actually quotes to support.
                  `shortOrderRef` takes the id's last hyphenated SEGMENT — a
                  fixed `slice(-8)` straddles the delimiter and renders the last
                  digit of the DATE as part of the reference.
                */}
                <Text size="sm" color="muted">
                  Order <Span className="font-mono">#{shortOrderRef(order.id)}</Span>
                </Text>

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

                {/* What is in the parcel. Denormalised onto the order already. */}
                {items.length > 0 && (
                  <Div rounded="xl" padding="md" surface="muted" border="subtle">
                    <Stack gap="sm">
                      <Text size="sm" weight="semibold">
                        In this order
                      </Text>
                      {items.map((item, i) => (
                        <Row key={`${item.productId}-${i}`} gap="sm" align="center">
                          {item.image && (
                            <Div className="relative h-10 w-10 flex-shrink-0" rounded="lg" overflow="hidden">
                              <MediaImage src={item.image} alt={item.title} size="thumbnail" />
                            </Div>
                          )}
                          <Stack gap="xs" className="min-w-0">
                            <Text size="sm" truncate>{item.title}</Text>
                            <Text size="xs" color="faint">×{item.quantity}</Text>
                          </Stack>
                        </Row>
                      ))}
                    </Stack>
                  </Div>
                )}

                {/*
                  Where it is going.

                  🛑 `order.address`, a structured UserAddress on the client
                  DTO — NOT `shippingAddress`, which is the string on
                  OrderDocument and is not mapped onto the DTO at all. Reaching
                  for the document field name here is how a branch gates on
                  `undefined` and silently renders nothing (Root Cause #57).
                */}
                {order.address && (
                  <Div rounded="xl" padding="md" surface="muted" border="subtle">
                    <Stack gap="xs">
                      <Text size="sm" weight="semibold">Delivering to</Text>
                      <Text size="sm" color="muted">
                        {[
                          order.address.line1,
                          order.address.line2,
                          `${order.address.city}, ${order.address.state} ${order.address.postalCode}`.trim(),
                          order.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </Stack>
                  </Div>
                )}

                {/*
                  Onward actions. Every one of these routes already existed and
                  this page linked to none of them, so a buyer who wanted their
                  invoice had to go back to the list and find the order again.
                */}
                <Row gap="sm" wrap>
                  <Button asChild variant="outline" size="sm">
                    <TextLink href={String(ROUTES.USER.ORDER_DETAIL(order.id))}>
                      Order details
                    </TextLink>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <TextLink href={String(ROUTES.USER.ORDER_INVOICE(order.id))}>
                      Invoice
                    </TextLink>
                  </Button>
                  {/*
                    A return is only offered once the parcel has arrived — the
                    return flow is about an item in the buyer's hands, and
                    offering it on a pending order sends them down a dead end.
                  */}
                  {order.orderStatus === "delivered" && (
                    <Button asChild variant="ghost" size="sm">
                      <TextLink href={String(ROUTES.USER.ORDER_RETURN(order.id))}>
                        Return an item
                      </TextLink>
                    </Button>
                  )}
                  {["pending", "confirmed", "processing"].includes(
                    order.orderStatus,
                  ) && (
                    <Button asChild variant="ghost" size="sm">
                      <TextLink href={String(ROUTES.USER.ORDER_CANCEL(order.id))}>
                        Cancel order
                      </TextLink>
                    </Button>
                  )}
                </Row>
              </Stack>
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
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it (Root Cause #89).
 */
export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderPageInner />
    </Suspense>
  );
}
