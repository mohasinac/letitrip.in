"use client";
import { use, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  useOrder,
  OrderDetailView,
  CodeRevealPanel,
  type RevealedCode,
  ROUTES,
  ACTIONS,
  Div,
  Span,
  Text,
  Row,
  Stack,
  Button,
  MediaImage,
} from "@mohasinac/appkit/client";
import {
  groupOrderItemsByBundle,
  BUNDLE_COPY,
  useProduct,
  PrizeRevealModal,
  type BundleOrderGroup,
} from "@mohasinac/appkit";
import { getOrderDigitalCode } from "@/lib/api/user-client";
import { API_ROUTES } from "@/constants";

const CLS_BUNDLE_BADGE = "inline-flex items-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 px-[var(--appkit-space-2)] py-[var(--appkit-space-0-5)] text-[10px] font-semibold text-fuchsia-700 dark:text-fuchsia-300";

const STATUS_COLORS: Record<string, string> = {
  pending:          "bg-warning-surface text-warning",
  confirmed:        "bg-info-surface text-info",
  processing:       "bg-info-surface text-info",
  shipped:          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered:        "bg-success-surface text-success",
  cancelled:        "bg-error-surface text-error",
  refunded:         "bg-warning-surface text-warning",
  return_requested: "bg-warning-surface text-warning",
  returned:         "bg-[var(--appkit-color-surface)] text-[var(--appkit-color-text-muted)] bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text-muted)]",
};

function paise(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n / 100);
}

// ─── Order group renderer ───────────────────────────────────────────────────

const CODE_REVEAL_STATUSES = new Set(["confirmed", "processing", "delivered"]);

async function fetchOrderCode(orderId: string): Promise<RevealedCode> {
  const res = await getOrderDigitalCode(API_ROUTES.ORDERS.CODE(orderId));
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Could not retrieve code");
  return body.data as RevealedCode;
}

type OrderItemT = {
  productId: string;
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

function renderItemRow(item: OrderItemT, key: string | number, onOpenReveal?: () => void) {
  const isPrizeDraw = item.listingType === "prize-draw";
  const revealStatus = item.prizeRevealStatus;
  const revealDeadline = item.prizeRevealDeadline
    ? new Date(item.prizeRevealDeadline as string | number)
    : null;
  return (
    <Row key={key} gap="3" align="start">
      {item.image && (
        <Div className="h-16 w-16 shrink-0" surface="elevated" rounded="lg" overflow="hidden">
          <MediaImage src={item.image} alt={item.title} size="thumbnail" />
        </Div>
      )}
      <Div className="flex-1 min-w-0">
        <Text className="line-clamp-2" color="primary" size="sm" weight="medium">
          {item.title}
        </Text>
        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <Text variant="secondary" className="mt-0.5" size="xs">
            {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
          </Text>
        )}
        {isPrizeDraw && revealStatus && (
          <Row gap="sm" className="mt-1" wrap>
            {revealStatus === "revealed" ? (
              <Span layout="inline-flex" color="success" surface="success-surface" weight="semibold" className="text-[10px]" rounded="full" padding="pill-xs">
                Prize revealed{item.revealedItemNumber != null ? ` (#${item.revealedItemNumber})` : ""}
              </Span>
            ) : revealStatus === "open" ? (
              onOpenReveal ? (
                <Button variant="primary" size="sm" onClick={onOpenReveal}>
                  Reveal my prize
                </Button>
              ) : (
                <Span className={CLS_BUNDLE_BADGE}>
                  Reveal pending
                </Span>
              )
            ) : revealStatus === "pending" ? (
              <Span layout="inline-flex" color="warning" surface="warning-surface" weight="semibold" className="text-[10px]" rounded="full" padding="pill-xs">
                Awaiting reveal window
              </Span>
            ) : (
              <Span layout="inline-flex" weight="semibold" className="text-[10px]" rounded="full" padding="pill-xs" surface="subtle" color="primary">
                Reveal closed
              </Span>
            )}
            {revealDeadline && revealStatus !== "revealed" && (
              <Text variant="secondary" className="text-[10px]">
                by {revealDeadline.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              </Text>
            )}
          </Row>
        )}
        <Row justify="between" className="mt-1">
          <Text variant="secondary" size="xs">×{item.quantity}</Text>
          <Text size="sm" weight="medium" color="primary">
            {paise(item.price * item.quantity, item.currency)}
          </Text>
        </Row>
      </Div>
    </Row>
  );
}

function renderOrderGroup(g: OrderGroup, gi: number, onOpenReveal?: (productId: string) => void) {
  if (g.kind === "single") {
    const item = g.item;
    return renderItemRow(
      item,
      gi,
      item.listingType === "prize-draw" ? () => onOpenReveal?.(item.productId) : undefined,
    );
  }
  // SB-UNI-5 2026-05-13 — bundle group: header + nested member rows.
  const headerLine = g.items[0].item;
  return (
    <Div
      key={`bundle-${gi}`} rounded="lg" padding="sm" border="default"
    >
      <Row gap="sm" align="center" justify="between" className="mb-2" wrap>
        <Text size="sm" weight="semibold" color="primary">
          {BUNDLE_COPY.orderDetail.bundleHeader(headerLine.title)}
        </Text>
        <Text variant="secondary" size="xs">
          {BUNDLE_COPY.orderDetail.bundleItemCount(g.memberCount)}
        </Text>
      </Row>
      <Stack gap="sm">
        {g.items.map(({ item, index }) =>
          renderItemRow(
            item,
            `bundle-${gi}-${index}`,
            item.listingType === "prize-draw" ? () => onOpenReveal?.(item.productId) : undefined,
          ),
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
      className="inline-flex items-center gap-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2"
    >
      ← My Orders
    </Link>
  );
}

function renderOrderHeader(order: NonNullable<OrderData>) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const statusColor = STATUS_COLORS[order.orderStatus] ?? "bg-[var(--appkit-color-surface)] text-[var(--appkit-color-text-muted)] bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text-muted)]";
  return (
    <Stack surface="card" padding="md" gap="3">
      <Row justify="between" wrap gap="3" align="start">
        <Div>
          <Text className="tracking-wider" color="muted" size="xs" transform="uppercase">Order</Text>
          <Text className="mt-0.5" color="primary" size="base" weight="semibold">
            #{order.id.slice(-8).toUpperCase()}
          </Text>
          {date && <Text variant="secondary" className="mt-0.5" size="xs">{date}</Text>}
        </Div>
        <Span size="xs" weight="semibold" className={`capitalize ${statusColor}`} rounded="full" padding="pill-md">
          {order.orderStatus.replace(/_/g, " ")}
        </Span>
      </Row>
      {order.trackingNumber && (
        <Div textSize="xs" color="muted">
          Tracking: <Span weight="medium" color="muted">{order.trackingNumber}</Span>
          {order.shippingCarrier && (
            <Span className="ml-1.5">via {order.shippingCarrier}</Span>
          )}
        </Div>
      )}
    </Stack>
  );
}

function renderOrderItems(order: NonNullable<OrderData>, onOpenReveal?: (productId: string) => void) {
  if (!order.items?.length) return null;
  const groups = groupOrderItemsByBundle<OrderItemT>(order.items as OrderItemT[]);
  const hasDigitalCode = order.items.some((i: any) => i.listingType === "digital-code");
  const canReveal = CODE_REVEAL_STATUSES.has((order.orderStatus ?? "").toLowerCase());
  return (
    <Stack gap="md">
      <Div surface="card" padding="md">
        <Text className="mb-4" color="primary" size="sm" weight="semibold">
          Items ({order.items.length})
        </Text>
        <Stack gap="md">
          {groups.map((g, gi) => renderOrderGroup(g as OrderGroup, gi, onOpenReveal))}
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
      <Text className="mb-3" color="primary" size="sm" weight="semibold">Delivery Address</Text>
      <Stack gap="xs">
        <Text size="sm" color="primary">{a.line1}</Text>
        {a.line2 && <Text size="sm" color="primary">{a.line2}</Text>}
        <Text size="sm" color="primary">
          {[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
        </Text>
        {a.country && <Text variant="secondary" size="sm">{a.country}</Text>}
        {a.phone && <Text variant="secondary" size="sm">{a.phone}</Text>}
      </Stack>
    </Div>
  );
}

function renderOrderPayment(order: NonNullable<OrderData>) {
  return (
    <Div surface="card" padding="md">
      <Text className="mb-3" color="primary" size="sm" weight="semibold">Payment Summary</Text>
      <Stack gap="xs">
        <Row justify="between">
          <Text variant="secondary" size="sm">Subtotal</Text>
          <Text size="sm">{paise(order.subtotal, order.currency)}</Text>
        </Row>
        {order.shippingCost !== undefined && (
          <Row justify="between">
            <Text variant="secondary" size="sm">Shipping</Text>
            <Text size="sm">
              {order.shippingCost === 0 ? "Free" : paise(order.shippingCost, order.currency)}
            </Text>
          </Row>
        )}
        {order.discount !== undefined && order.discount > 0 && (
          <Row justify="between">
            <Text variant="secondary" size="sm">
              Discount{order.couponCode ? ` (${order.couponCode})` : ""}
            </Text>
            <Text className="text-success" size="sm">
              −{paise(order.discount, order.currency)}
            </Text>
          </Row>
        )}
        {order.tax !== undefined && order.tax > 0 && (
          <Row justify="between">
            <Text variant="secondary" size="sm">Tax</Text>
            <Text size="sm">{paise(order.tax, order.currency)}</Text>
          </Row>
        )}
        <Div border="subtle" className="border-t mt-1" padding="t-xs">
          <Row justify="between">
            <Text size="sm" weight="semibold" color="primary">Total</Text>
            <Text size="sm" weight="semibold" color="primary">
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
    endpoint: API_ROUTES.USER.ORDER_BY_ID(id),
  });

  const canCancel = order?.orderStatus === "pending" || order?.orderStatus === "confirmed";
  const canTrack  = !!order?.trackingNumber;

  const [revealProductId, setRevealProductId] = useState<string | null>(null);
  // Reveal-mode prize draws (SB4-H/SB8-C) — fetch the public (spoiler-free)
  // product doc for the collage once the buyer opens the reveal modal.
  const { product: revealProduct } = useProduct(revealProductId ?? "", {
    enabled: !!revealProductId,
  });

  return (
    <>
      <OrderDetailView
        labels={{ title: order ? `Order #${order.id.slice(-8).toUpperCase()}` : "Order Details" }}
        isLoading={isLoading}
        isNotFound={!isLoading && !order}
        renderBack={renderBack}
        renderHeader={() => order ? renderOrderHeader(order) : null}
        renderItems={() => order ? renderOrderItems(order, setRevealProductId) : null}
        renderAddress={() => order ? renderOrderAddress(order) : null}
        renderPayment={() => order ? renderOrderPayment(order) : null}
        renderActions={() => order ? renderOrderActions(order, canTrack, canCancel) : null}
      />
      {order && revealProductId && (
        <PrizeRevealModal
          open={!!revealProductId}
          onClose={() => setRevealProductId(null)}
          items={(revealProduct as { prizeDrawItems?: any[] } | undefined)?.prizeDrawItems ?? []}
          orderId={order.id}
          productId={revealProductId}
          initialPrizeWon={order.prizeWon}
        />
      )}
    </>
  );
}
