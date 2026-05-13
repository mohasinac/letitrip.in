"use client";
import { use } from "react";
import Link from "next/link";
import {
  useOrder,
  OrderDetailView,
  ROUTES,
  Div,
  Text,
  Row,
  Stack,
  Button,
} from "@mohasinac/appkit/client";
import {
  groupOrderItemsByBundle,
  BUNDLE_COPY,
} from "@mohasinac/appkit";

const STATUS_COLORS: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed:        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing:       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered:        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded:         "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  return_requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  returned:         "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-zinc-400",
};

function paise(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n / 100);
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { order, isLoading } = useOrder(id, {
    endpoint: `/api/user/orders/${id}`,
  });

  const canCancel = order?.orderStatus === "pending" || order?.orderStatus === "confirmed";
  const canTrack  = !!order?.trackingNumber;

  return (
    <OrderDetailView
      labels={{ title: order ? `Order #${order.id.slice(-8).toUpperCase()}` : "Order Details" }}
      isLoading={isLoading}
      isNotFound={!isLoading && !order}
      renderBack={() => (
        <Link
          href={String(ROUTES.USER.ORDERS)}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2"
        >
          ← My Orders
        </Link>
      )}
      renderHeader={() => {
        if (!order) return null;
        const date = order.createdAt
          ? new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
          : "";
        const statusColor = STATUS_COLORS[order.orderStatus] ?? "bg-zinc-100 text-zinc-600";
        return (
          <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <Row justify="between" wrap gap="3" align="start">
              <Div>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Order</Text>
                <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  #{order.id.slice(-8).toUpperCase()}
                </Text>
                {date && <Text variant="secondary" className="text-xs mt-0.5">{date}</Text>}
              </Div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColor}`}>
                {order.orderStatus.replace(/_/g, " ")}
              </span>
            </Row>
            {order.trackingNumber && (
              <Div className="text-xs text-zinc-500 dark:text-zinc-400">
                Tracking: <span className="font-medium text-zinc-700 dark:text-zinc-300">{order.trackingNumber}</span>
                {order.shippingCarrier && (
                  <span className="ml-1.5">via {order.shippingCarrier}</span>
                )}
              </Div>
            )}
          </Div>
        );
      }}
      renderItems={() => {
        if (!order?.items?.length) return null;
        type OrderItemT = NonNullable<typeof order>["items"][number];
        const groups = groupOrderItemsByBundle<OrderItemT>(order.items as OrderItemT[]);
        const renderItemRow = (item: OrderItemT, key: string | number) => {
          const isPrizeDraw = item.listingType === "prize-draw";
          const revealStatus = item.prizeRevealStatus;
          const revealDeadline = item.prizeRevealDeadline
            ? new Date(item.prizeRevealDeadline)
            : null;
          return (
            <Row key={key} gap="3" align="start">
              {item.image && (
                <Div
                  role="img"
                  aria-label={item.title}
                  className="h-16 w-16 rounded-lg shrink-0 bg-cover bg-center bg-zinc-100 dark:bg-slate-800"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              )}
              <Div className="flex-1 min-w-0">
                <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                  {item.title}
                </Text>
                {item.attributes && Object.keys(item.attributes).length > 0 && (
                  <Text variant="secondary" className="text-xs mt-0.5">
                    {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </Text>
                )}
                {isPrizeDraw && revealStatus && (
                  <Row gap="sm" className="mt-1 flex-wrap items-center">
                    {revealStatus === "revealed" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Prize revealed{item.revealedItemNumber != null ? ` (#${item.revealedItemNumber})` : ""}
                      </span>
                    ) : revealStatus === "open" ? (
                      <span className="inline-flex items-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                        Reveal pending
                      </span>
                    ) : revealStatus === "pending" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        Awaiting reveal window
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-200">
                        Reveal closed
                      </span>
                    )}
                    {revealDeadline && revealStatus !== "revealed" && (
                      <Text variant="secondary" className="text-[10px]">
                        by {revealDeadline.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </Text>
                    )}
                  </Row>
                )}
                <Row justify="between" className="mt-1">
                  <Text variant="secondary" className="text-xs">×{item.quantity}</Text>
                  <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {paise(item.price * item.quantity, item.currency)}
                  </Text>
                </Row>
              </Div>
            </Row>
          );
        };
        return (
          <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Items ({order.items.length})
            </Text>
            <Stack gap="md">
              {groups.map((g, gi) => {
                if (g.kind === "single") {
                  return renderItemRow(g.item, gi);
                }
                // SB-UNI-5 2026-05-13 — bundle group: header + nested member rows.
                const headerLine = g.items[0].item;
                return (
                  <Div
                    key={`bundle-${gi}`}
                    className="rounded-lg border border-zinc-200 dark:border-slate-700 p-3"
                  >
                    <Row gap="sm" align="center" justify="between" className="mb-2 flex-wrap">
                      <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {BUNDLE_COPY.orderDetail.bundleHeader(headerLine.title)}
                      </Text>
                      <Text variant="secondary" className="text-xs">
                        {BUNDLE_COPY.orderDetail.bundleItemCount(g.memberCount)}
                      </Text>
                    </Row>
                    <Stack gap="sm">
                      {g.items.map(({ item, index }) =>
                        renderItemRow(item, `bundle-${gi}-${index}`),
                      )}
                    </Stack>
                  </Div>
                );
              })}
            </Stack>
          </Div>
        );
      }}
      renderAddress={() => {
        if (!order?.address) return null;
        const a = order.address;
        return (
          <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Delivery Address</Text>
            <Stack gap="xs">
              <Text className="text-sm text-zinc-800 dark:text-zinc-200">{a.line1}</Text>
              {a.line2 && <Text className="text-sm text-zinc-800 dark:text-zinc-200">{a.line2}</Text>}
              <Text className="text-sm text-zinc-800 dark:text-zinc-200">
                {[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
              </Text>
              {a.country && <Text variant="secondary" className="text-sm">{a.country}</Text>}
              {a.phone && <Text variant="secondary" className="text-sm">{a.phone}</Text>}
            </Stack>
          </Div>
        );
      }}
      renderPayment={() => {
        if (!order) return null;
        return (
          <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Payment Summary</Text>
            <Stack gap="xs">
              <Row justify="between">
                <Text variant="secondary" className="text-sm">Subtotal</Text>
                <Text className="text-sm">{paise(order.subtotal, order.currency)}</Text>
              </Row>
              {order.shippingCost !== undefined && (
                <Row justify="between">
                  <Text variant="secondary" className="text-sm">Shipping</Text>
                  <Text className="text-sm">
                    {order.shippingCost === 0 ? "Free" : paise(order.shippingCost, order.currency)}
                  </Text>
                </Row>
              )}
              {order.discount !== undefined && order.discount > 0 && (
                <Row justify="between">
                  <Text variant="secondary" className="text-sm">
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </Text>
                  <Text className="text-sm text-green-600 dark:text-green-400">
                    −{paise(order.discount, order.currency)}
                  </Text>
                </Row>
              )}
              {order.tax !== undefined && order.tax > 0 && (
                <Row justify="between">
                  <Text variant="secondary" className="text-sm">Tax</Text>
                  <Text className="text-sm">{paise(order.tax, order.currency)}</Text>
                </Row>
              )}
              <Div className="border-t border-zinc-100 dark:border-slate-800 pt-2 mt-1">
                <Row justify="between">
                  <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Total</Text>
                  <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {paise(order.total, order.currency)}
                  </Text>
                </Row>
              </Div>
            </Stack>
          </Div>
        );
      }}
      renderActions={() => {
        if (!order) return null;
        return (
          <Row gap="3" wrap>
            <Button variant="outline" size="sm" asChild>
              <Link href={String(ROUTES.USER.ORDER_INVOICE(order.id))} target="_blank" rel="noopener noreferrer">
                Download Invoice
              </Link>
            </Button>
            {canTrack && (
              <Button variant="outline" size="sm" asChild>
                <Link href={String(ROUTES.USER.ORDER_TRACK(order.id))}>Track Shipment</Link>
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" size="sm" asChild>
                <Link href={String(ROUTES.USER.ORDER_CANCEL(order.id))}>Cancel Order</Link>
              </Button>
            )}
          </Row>
        );
      }}
    />
  );
}
