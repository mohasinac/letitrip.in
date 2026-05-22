"use client";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import {
  useOrder,
  OrderDetailView,
  CodeRevealPanel,
  type RevealedCode,
  ROUTES,
  ACTIONS,
  Div,
  Text,
  Row,
  Stack,
  Button,
} from "@mohasinac/appkit/client";
import {
  groupOrderItemsByBundle,
  BUNDLE_COPY,
  type BundleOrderGroup,
} from "@mohasinac/appkit";

const STATUS_COLORS: Record<string, string> = {
  pending:          "bg-warning-surface text-warning",
  confirmed:        "bg-info-surface text-info",
  processing:       "bg-info-surface text-info",
  shipped:          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered:        "bg-success-surface text-success",
  cancelled:        "bg-error-surface text-error",
  refunded:         "bg-warning-surface text-warning",
  return_requested: "bg-warning-surface text-warning",
  returned:         "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-zinc-400",
};

function paise(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n / 100);
}

// ─── Order group renderer ───────────────────────────────────────────────────

const CODE_REVEAL_STATUSES = new Set(["confirmed", "processing", "delivered"]);

async function fetchOrderCode(orderId: string): Promise<RevealedCode> {
  const res = await fetch(`/api/orders/${orderId}/code`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Could not retrieve code");
  return body.data as RevealedCode;
}

type OrderItemT = {
  listingType?: string;
  prizeRevealStatus?: string;
  prizeRevealDeadline?: string | number | null;
  revealedItemNumber?: number | null;
  image?: string;
  title: string;
  attributes?: Record<string, string>;
  quantity: number;
  price: number;
  currency?: string;
  /** Required by OrderItemForBundleGrouping constraint on groupOrderItemsByBundle */
  bundleCategorySlug?: string;
  bundleProductIds?: string[];
};

type OrderGroup = BundleOrderGroup<OrderItemT>;

function renderItemRow(item: OrderItemT, key: string | number) {
  const isPrizeDraw = item.listingType === "prize-draw";
  const revealStatus = item.prizeRevealStatus;
  const revealDeadline = item.prizeRevealDeadline
    ? new Date(item.prizeRevealDeadline as string | number)
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
          <Row gap="sm" className="mt-1 flex-wrap">
            {revealStatus === "revealed" ? (
              <span className="inline-flex items-center rounded-full bg-success-surface px-2 py-0.5 text-[10px] font-semibold text-success">
                Prize revealed{item.revealedItemNumber != null ? ` (#${item.revealedItemNumber})` : ""}
              </span>
            ) : revealStatus === "open" ? (
              <span className="inline-flex items-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                Reveal pending
              </span>
            ) : revealStatus === "pending" ? (
              <span className="inline-flex items-center rounded-full bg-warning-surface px-2 py-0.5 text-[10px] font-semibold text-warning">
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
}

function renderOrderGroup(g: OrderGroup, gi: number) {
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
}

// ─── Render helpers ─────────────────────────────────────────────────────────

type OrderData = ReturnType<typeof useOrder>["order"];

function renderBack() {
  return (
    <Link
      href={String(ROUTES.USER.ORDERS)}
      className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2"
    >
      ← My Orders
    </Link>
  );
}

function renderOrderHeader(order: NonNullable<OrderData>) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const statusColor = STATUS_COLORS[order.orderStatus] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  return (
    <Div surface="card" padding="md" className="space-y-3">
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
}

function renderOrderItems(order: NonNullable<OrderData>) {
  if (!order.items?.length) return null;
  const groups = groupOrderItemsByBundle<OrderItemT>(order.items as OrderItemT[]);
  const hasDigitalCode = order.items.some((i: any) => i.listingType === "digital-code");
  const canReveal = CODE_REVEAL_STATUSES.has((order.orderStatus ?? "").toLowerCase());
  return (
    <Stack gap="md">
      <Div surface="card" padding="md">
        <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Items ({order.items.length})
        </Text>
        <Stack gap="md">
          {groups.map((g, gi) => renderOrderGroup(g as OrderGroup, gi))}
        </Stack>
      </Div>
      {hasDigitalCode && canReveal && (
        <CodeRevealPanel orderId={order.id} fetchCode={fetchOrderCode} />
      )}
    </Stack>
  );
}

function renderOrderAddress(order: NonNullable<OrderData>) {
  if (!order.address) return null;
  const a = order.address;
  return (
    <Div surface="card" padding="md">
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
}

function renderOrderPayment(order: NonNullable<OrderData>) {
  return (
    <Div surface="card" padding="md">
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
            <Text className="text-sm text-success">
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
}

function renderOrderActions(order: NonNullable<OrderData>, canTrack: boolean, canCancel: boolean) {
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
          <Link href={String(ROUTES.USER.ORDER_CANCEL(order.id))}>{ACTIONS.USER["cancel-order"].label}</Link>
        </Button>
      )}
    </Row>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

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
      renderBack={renderBack}
      renderHeader={() => order ? renderOrderHeader(order) : null}
      renderItems={() => order ? renderOrderItems(order) : null}
      renderAddress={() => order ? renderOrderAddress(order) : null}
      renderPayment={() => order ? renderOrderPayment(order) : null}
      renderActions={() => order ? renderOrderActions(order, canTrack, canCancel) : null}
    />
  );
}
