"use client";

import { useSearchParams } from "next/navigation";
import {
  Button,
  CheckoutSuccessView,
  Div,
  Heading,
  MediaImage,
  ROUTES,
  Row,
  Stack,
  Text,
  TextLink,
  formatCurrency,
  isManualPaymentMethod,
  useOrder,
} from "@mohasinac/appkit/client";

/*
 * 🛑 THIS PAGE USED TO SAY "Order details will appear here."
 *
 * Not a loading state and not a fallback — a hardcoded string, shown to a
 * customer who had just paid. Measured on production: a real Cash-on-Delivery
 * order (order-1-20261002-rw7jw6, ₹1,287.80) landed here and the page rendered,
 * in full: "Order Confirmed / Thank you for your order / Your order has been
 * placed successfully. / Order details will appear here. / Continue Shopping".
 * No order number, no item, no address, no total — with the orderId sitting in
 * the query string the whole time. Polled from t=0 to 10s: byte-identical, so
 * it was never a hydration race.
 *
 * It was not the usual zero-render-props gap either (Root Cause #8): every slot
 * WAS supplied. `renderOrderCard` just returned a placeholder, and the component
 * never read `orderId`, never called `useSearchParams` and never fetched.
 *
 * And "Continue Shopping" was wired to nothing: a <button type="button"> with no
 * onClick and no enclosing anchor — clicking it left the URL unchanged. The
 * shell is complicit there, passing `renderActions?.(() => {})`, a no-op
 * onContinue, so even a correctly-wired consumer got a dead button. This file
 * therefore ignores that callback and uses a real link.
 *
 * WHY IT MATTERED MORE THAN A COSMETIC GAP: a manual-payment order (cash, UPI,
 * EMI) owes money immediately, and the checkout's own copy promises "15 minutes
 * to pay and upload your UTR/reference number + a screenshot", with the order
 * auto-cancelled if that lapses. The buyer's only route to paying was the
 * browser's back button. Hence the manual-payment CTA below, which is the second
 * caller ROUTES.USER.ORDER_PAYMENT has ever had (Root Cause #57).
 */
export function CheckoutSuccessRouteClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const { order, isLoading } = useOrder(orderId, { enabled: !!orderId });

  // The order number people actually quote is the tail of the generated id
  // (order-{n}-{YYYYMMDD}-{rand6}) — it is what /user/orders shows as "#RW7JW6".
  const shortRef = orderId ? orderId.split("-").pop()?.toUpperCase() : undefined;
  const owesPayment = isManualPaymentMethod(order?.paymentMethod) && order?.paymentStatus !== "paid";

  return (
    <CheckoutSuccessView
      labels={{ title: "Order Confirmed" }}
      renderHero={() => (
        <Div className="border border-success/20" surface="success-surface" rounded="xl" padding="md">
          <Heading level={2} className="mb-2 text-success" size="lg" weight="semibold">
            Thank you for your order
          </Heading>
          <Text className="text-success">
            {shortRef ? `Order #${shortRef} has been placed successfully.` : "Your order has been placed successfully."}
          </Text>
        </Div>
      )}
      renderOrderCard={() => {
        /*
         * No orderId in the URL is a different situation from a slow fetch, and
         * conflating them is how the old placeholder read as permanent. A
         * bookmarked /checkout/success with no param has no order to show and
         * should say so, not spin.
         */
        if (!orderId) {
          return (
            <Div surface="card" padding="md">
              <Text size="sm" color="muted">
                This page shows a specific order. Open it from{" "}
                <TextLink href={String(ROUTES.USER.ORDERS)}>your orders</TextLink> to see one.
              </Text>
            </Div>
          );
        }
        if (isLoading) {
          return (
            <Div surface="card" padding="md">
              <Text size="sm" color="muted">Loading your order…</Text>
            </Div>
          );
        }
        if (!order) {
          return (
            <Div surface="card" padding="md">
              <Stack gap="xs">
                <Text size="sm">
                  Your order was placed, but we could not load its details just now.
                </Text>
                <Text size="sm" color="muted">
                  It is safe in{" "}
                  <TextLink href={String(ROUTES.USER.ORDERS)}>your orders</TextLink> — nothing is lost.
                </Text>
              </Stack>
            </Div>
          );
        }
        return (
          <Div surface="card" padding="md">
            <Stack gap="comfortable">
              {order.items.map((item) => (
                <Row key={`${item.productId}-${item.title}`} gap="dense" align="center">
                  {item.image ? (
                    <MediaImage src={item.image} alt={item.title} size="thumbnail" />
                  ) : null}
                  <Stack gap="none" className="min-w-0 flex-1">
                    <Text size="sm" weight="medium" truncate>{item.title}</Text>
                    <Text size="xs" color="muted">
                      {`Qty ${item.quantity} · ${formatCurrency(item.price, item.currency ?? order.currency)}`}
                    </Text>
                  </Stack>
                </Row>
              ))}

              {order.address ? (
                /*
                 * `UserAddress` is line1/line2/city/state/postalCode — NOT the
                 * fullName/addressLine1 shape `OrderDocument.shippingAddress`
                 * uses. Two address shapes exist and the client-facing Order
                 * carries this one; reading the other compiles only if you cast,
                 * which is how a blank address block gets shipped.
                 */
                <Stack gap="none">
                  <Text size="xs" color="muted" transform="uppercase">Delivering to</Text>
                  {order.address.label ? <Text size="sm">{order.address.label}</Text> : null}
                  <Text size="sm" color="muted">
                    {[
                      order.address.line1,
                      order.address.line2,
                      order.address.city,
                      order.address.state,
                      order.address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </Stack>
              ) : null}

              <Row justify="between" align="center">
                <Text size="sm" color="muted">Total</Text>
                <Text size="sm" weight="semibold">{formatCurrency(order.total, order.currency)}</Text>
              </Row>

              {owesPayment ? (
                <Div className="border border-warning/30" surface="warning-surface" rounded="lg" padding="sm">
                  <Stack gap="xs">
                    <Text size="sm" weight="medium">This order is awaiting your payment.</Text>
                    <Text size="xs">
                      Pay now and upload your reference number — the payment window is short, and an
                      unpaid order is cancelled automatically.
                    </Text>
                    <TextLink href={String(ROUTES.USER.ORDER_PAYMENT(order.id))}>
                      Complete payment →
                    </TextLink>
                  </Stack>
                </Div>
              ) : null}

              <TextLink href={String(ROUTES.USER.ORDER_DETAIL(order.id))}>View order details →</TextLink>
            </Stack>
          </Div>
        );
      }}
      renderActions={() => (
        /*
         * A real link, not a button. The shell hands `renderActions` a no-op
         * `onContinue`, so a <Button onClick={onContinue}> here would be the dead
         * control this page already shipped once.
         */
        <Button asChild className="w-full sm:w-auto">
          <TextLink href={String(ROUTES.PUBLIC.PRODUCTS)}>Continue Shopping</TextLink>
        </Button>
      )}
    />
  );
}
