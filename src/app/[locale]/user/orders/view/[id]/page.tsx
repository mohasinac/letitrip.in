"use client";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
        return (
          <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Items ({order.items.length})
            </Text>
            <Stack gap="md">
              {order.items.map((item: NonNullable<typeof order>["items"][number], i: number) => (
                <Row key={i} gap="3" align="start">
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
                    <Row justify="between" className="mt-1">
                      <Text variant="secondary" className="text-xs">×{item.quantity}</Text>
                      <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {paise(item.price * item.quantity, item.currency)}
                      </Text>
                    </Row>
                  </Div>
                </Row>
              ))}
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
            {canTrack && (
              <Link
                href={String(ROUTES.USER.ORDER_TRACK(order.id))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
              >
                Track Shipment
              </Link>
            )}
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/user/orders/${order.id}/cancel`)}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
              >
                Cancel Order
              </Button>
            )}
          </Row>
        );
      }}
    />
  );
}
