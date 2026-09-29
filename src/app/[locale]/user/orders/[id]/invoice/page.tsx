"use client";
import {use, Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { useOrder, ROUTES, Div, Row, Span, Stack, Table, Thead, Tbody, Tr, Th, Td, Text, Heading, Button, StickyToolbar, formatCurrency, shortOrderRef } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";



// ─── Sub-renderers ────────────────────────────────────────────────────────────

type OrderData = NonNullable<ReturnType<typeof useOrder>["order"]>;

function renderInvoiceActionBar(id: string) {
  return (
    <StickyToolbar offset="header" tone="default" border padding="md" z="above-toolbar" className="print:hidden">
      <Row justify="between" align="center" gap="md">
        <Link
          href={String(ROUTES.USER.ORDER_DETAIL(id))}
          className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to order
        </Link>
        <Button size="sm" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </Row>
    </StickyToolbar>
  );
}

function renderInvoiceHeader(order: OrderData, orderDate: string) {
  return (
    <Row justify="between" align="start" className="mb-8 print:mb-6">
      <Div>
        <Heading level={2} className="print:text-black" size="2xl" weight="bold">LetItRip</Heading>
        <Text variant="secondary" className="mt-0.5 print:text-[var(--appkit-color-text-muted)]" size="xs">letitrip.in</Text>
      </Div>
      <Div className="text-right">
        <Text className="print:text-black" color="primary" size="lg" weight="semibold">
          Invoice
        </Text>
        <Text variant="secondary" className="mt-0.5 print:text-[var(--appkit-color-text-muted)]" size="xs">
          #{shortOrderRef(order.id)}
        </Text>
        {orderDate && (
          <Text variant="secondary" className="print:text-[var(--appkit-color-text-muted)]" size="xs">{orderDate}</Text>
        )}
      </Div>
    </Row>
  );
}

function renderInvoiceAddress(a: NonNullable<OrderData["address"]>) {
  return (
    <Stack gap="xs" className="mb-6">
      <Text className="tracking-wider print:text-[var(--appkit-color-text-muted)]" color="faint" size="xs" weight="semibold" transform="uppercase">
        Delivered to
      </Text>
      <Text className="print:text-black" color="primary" size="sm">{a.line1}</Text>
      {a.line2 && (
        <Text className="print:text-black" color="primary" size="sm">{a.line2}</Text>
      )}
      <Text className="print:text-black" color="primary" size="sm">
        {[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
      </Text>
      {a.country && (
        <Text variant="secondary" className="print:text-[var(--appkit-color-text-muted)]" size="sm">{a.country}</Text>
      )}
    </Stack>
  );
}

function renderInvoiceItemsTable(order: OrderData) {
  return (
    <Table className="mb-6" size="sm">
      <Thead>
        <Tr className="print:border-gray-300" border="default">
          {(["Item", "Qty", "Price"] as const).map((h, i) => (
            <Th
              key={h}
              className={[
                "py-[var(--appkit-space-2)] text-[length:var(--appkit-text-xs)] font-semibold uppercase tracking-wider text-[var(--appkit-color-text-faint)] print:text-[var(--appkit-color-text-muted)]",
                i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right",
              ].join(" ")}
            >
              {h}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {order.items?.map(
          (item: NonNullable<typeof order>["items"][number], i: number) => (
            <Tr key={i} className="print:border-gray-200" border="subtle">
              <Td className="print:text-black" padding="sm" color="primary">
                {item.title}
                {item.attributes && Object.keys(item.attributes).length > 0 && (
                  <Span size="xs" className="ml-1.5 print:text-[var(--appkit-color-text-muted)]" color="faint">
                    ({Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")})
                  </Span>
                )}
              </Td>
              <Td className="text-center print:text-black" padding="sm" color="muted">
                {item.quantity}
              </Td>
              <Td className="text-right print:text-black" padding="sm" color="primary">
                {formatCurrency(item.price * item.quantity, item.currency)}
              </Td>
            </Tr>
          ),
        )}
      </Tbody>
    </Table>
  );
}

/**
 * One fee row, rendered only when the buyer was actually charged it.
 *
 * A shared helper rather than six copies of the same conditional: the six
 * differ only in label and field, and the one that was hand-written (GST) is
 * the one that silently stopped working.
 */
function feeRow(label: string, amount: number | undefined, currency: string | undefined) {
  if (amount === undefined || amount <= 0) return null;
  return (
    <Row textSize="sm" justify="between" key={label}>
      <Text variant="secondary">{label}</Text>
      <Text>{formatCurrency(amount, currency)}</Text>
    </Row>
  );
}

function renderInvoiceTotals(order: OrderData) {
  return (
    <Stack gap="xs" className="ml-auto max-w-xs">
      <Row textSize="sm" justify="between">
        <Text variant="secondary">Subtotal</Text>
        <Text>{formatCurrency(order.subtotal, order.currency)}</Text>
      </Row>
      {order.shippingCost !== undefined && (
        <Row textSize="sm" justify="between">
          <Text variant="secondary">Shipping</Text>
          <Text>{order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost, order.currency)}</Text>
        </Row>
      )}
      {order.appliedDiscounts && order.appliedDiscounts.length > 0
        ? order.appliedDiscounts.map((d) => (
            <Row textSize="sm" justify="between" key={d.code}>
              <Text variant="secondary">Discount ({d.code})</Text>
              <Text className="text-success print:text-black">
                −{formatCurrency(d.discountAmount, order.currency)}
              </Text>
            </Row>
          ))
        : order.discount !== undefined &&
          order.discount > 0 && (
            <Row textSize="sm" justify="between">
              <Text variant="secondary">
                Discount{order.couponCode ? ` (${order.couponCode})` : ""}
              </Text>
              <Text className="text-success print:text-black">
                −{formatCurrency(order.discount, order.currency)}
              </Text>
            </Row>
          )}
      {/*
        * 🛑 EVERY FEE THE BUYER PAID GETS A LINE, or the invoice does not add up.
        *
        * It listed Subtotal and Shipping only. Measured on a real order:
        * ₹899.00 + ₹77.00 against a stated Total of ₹997.80, leaving ₹21.80
        * with nothing to explain it — the ₹10 platform fee, ₹10 WhatsApp
        * updates and ₹1.80 GST were all in the total and none had a row. The GST
        * row below existed but could never render, because the order adapter
        * never mapped `gstAmount` onto `tax` (fixed there).
        *
        * An invoice whose own lines do not sum to its own total is a GST
        * document that cannot be reconciled, so this is correctness rather
        * than presentation. Each row is conditional on a non-zero value, so an
        * order that was never charged a fee still shows a clean invoice.
        */}
      {feeRow("COD handling", order.codHandlingFee, order.currency)}
      {feeRow("WhatsApp updates", order.whatsappNotifyFee, order.currency)}
      {feeRow("Gift wrap", order.giftWrapFee, order.currency)}
      {feeRow("Shipment protection", order.shipmentProtectionFee, order.currency)}
      {feeRow("Platform fee", order.platformFee, order.currency)}
      {feeRow("Tax (GST)", order.tax, order.currency)}
      <Row textWeight="semibold" textSize="sm" border="default" 
        justify="between"
        className="border-t print:border-gray-300 mt-1" padding="t-xs"
      >
        <Text className="print:text-black" color="primary" weight="semibold">Total</Text>
        <Text className="print:text-black" color="primary" weight="semibold">
          {formatCurrency(order.total, order.currency)}
        </Text>
      </Row>
    </Stack>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function InvoicePageInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { order, isLoading } = useOrder(id, { endpoint: API_ROUTES.USER.ORDER_BY_ID(id) });

  if (isLoading) {
    return (
      <Row padding="y-6xl" align="center" justify="center">
        <Text variant="secondary" size="sm">Loading invoice…</Text>
      </Row>
    );
  }

  if (!order) {
    return (
      <Row padding="y-6xl" align="center" justify="center">
        <Text variant="secondary" size="sm">
          Order not found.{" "}
          <Link href={String(ROUTES.USER.ORDERS)} className="underline">Back to orders</Link>
        </Text>
      </Row>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <>
      {renderInvoiceActionBar(id)}
      <Div className="print:px-[0] print:py-[0] print:max-w-none">
      <Div className="max-w-2xl mx-auto" paddingX="x-lg" paddingY="y-2xl">
        {renderInvoiceHeader(order, orderDate)}
        {order.address && renderInvoiceAddress(order.address)}
        {renderInvoiceItemsTable(order)}
        {renderInvoiceTotals(order)}
        <Text
          variant="secondary"
          className="mt-12 text-center print:text-gray-400 print:mt-8" size="xs"
        >
          Thank you for shopping with LetItRip · letitrip.in
        </Text>
      </Div>
      </Div>
    </>
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
export default function InvoicePage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <InvoicePageInner {...props} />
    </Suspense>
  );
}
