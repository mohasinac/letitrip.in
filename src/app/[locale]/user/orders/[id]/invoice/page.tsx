"use client";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { useOrder, ROUTES, Div, Row, Span, Stack, Table, Thead, Tbody, Tr, Th, Td, Text, Heading, Button } from "@mohasinac/appkit/client";

function paise(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n / 100);
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

type OrderData = NonNullable<ReturnType<typeof useOrder>["order"]>;

function renderInvoiceActionBar(id: string) {
  return (
    <Row
      justify="between"
      align="center"
      gap="md"
      className="print:hidden sticky top-[var(--header-height,0px)] z-[var(--appkit-z-dropdown)] px-6 border-b border-zinc-200 dark:border-slate-700" surface="default" padding="y-sm"
    >
      <Link
        href={String(ROUTES.USER.ORDER_DETAIL(id))}
        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        ← Back to order
      </Link>
      <Button size="sm" onClick={() => window.print()}>
        Print / Save as PDF
      </Button>
    </Row>
  );
}

function renderInvoiceHeader(order: OrderData, orderDate: string) {
  return (
    <Row justify="between" align="start" className="mb-8 print:mb-6">
      <Div>
        <Heading level={2} className="print:text-black" size="2xl" weight="bold">LetItRip</Heading>
        <Text variant="secondary" className="mt-0.5 print:text-gray-500" size="xs">letitrip.in</Text>
      </Div>
      <Div className="text-right">
        <Text className="print:text-black" color="primary" size="lg" weight="semibold">
          Invoice
        </Text>
        <Text variant="secondary" className="mt-0.5 print:text-gray-500" size="xs">
          #{order.id.slice(-8).toUpperCase()}
        </Text>
        {orderDate && (
          <Text variant="secondary" className="print:text-gray-500" size="xs">{orderDate}</Text>
        )}
      </Div>
    </Row>
  );
}

function renderInvoiceAddress(a: NonNullable<OrderData["address"]>) {
  return (
    <Stack gap="xs" className="mb-6">
      <Text className="tracking-wider print:text-gray-500" color="faint" size="xs" weight="semibold" transform="uppercase">
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
        <Text variant="secondary" className="print:text-gray-500" size="sm">{a.country}</Text>
      )}
    </Stack>
  );
}

function renderInvoiceItemsTable(order: OrderData) {
  return (
    <Table className="w-full text-sm mb-6 border-collapse">
      <Thead>
        <Tr className="print:border-gray-300" border="default">
          {(["Item", "Qty", "Price"] as const).map((h, i) => (
            <Th
              key={h}
              className={[
                "py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 print:text-gray-500",
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
              <Td className="py-2.5 print:text-black" color="primary">
                {item.title}
                {item.attributes && Object.keys(item.attributes).length > 0 && (
                  <Span size="xs" className="ml-1.5 print:text-gray-500" color="faint">
                    ({Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")})
                  </Span>
                )}
              </Td>
              <Td className="py-2.5 text-center print:text-black" color="muted">
                {item.quantity}
              </Td>
              <Td className="py-2.5 text-right print:text-black" color="primary">
                {paise(item.price * item.quantity, item.currency)}
              </Td>
            </Tr>
          ),
        )}
      </Tbody>
    </Table>
  );
}

function renderInvoiceTotals(order: OrderData) {
  return (
    <Stack gap="xs" className="ml-auto max-w-xs">
      <Row justify="between" className="text-sm">
        <Text variant="secondary">Subtotal</Text>
        <Text>{paise(order.subtotal, order.currency)}</Text>
      </Row>
      {order.shippingCost !== undefined && (
        <Row justify="between" className="text-sm">
          <Text variant="secondary">Shipping</Text>
          <Text>{order.shippingCost === 0 ? "Free" : paise(order.shippingCost, order.currency)}</Text>
        </Row>
      )}
      {order.discount !== undefined && order.discount > 0 && (
        <Row justify="between" className="text-sm">
          <Text variant="secondary">
            Discount{order.couponCode ? ` (${order.couponCode})` : ""}
          </Text>
          <Text className="text-success print:text-black">
            −{paise(order.discount, order.currency)}
          </Text>
        </Row>
      )}
      {order.tax !== undefined && order.tax > 0 && (
        <Row justify="between" className="text-sm">
          <Text variant="secondary">Tax (GST)</Text>
          <Text>{paise(order.tax, order.currency)}</Text>
        </Row>
      )}
      <Row
        justify="between"
        className="text-sm font-semibold border-t border-zinc-200 dark:border-slate-700 print:border-gray-300 mt-1" padding="t-xs"
      >
        <Text className="print:text-black" color="primary" weight="semibold">Total</Text>
        <Text className="print:text-black" color="primary" weight="semibold">
          {paise(order.total, order.currency)}
        </Text>
      </Row>
    </Stack>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { order, isLoading } = useOrder(id, { endpoint: `/api/user/orders/${id}` });

  if (isLoading) {
    return (
      <Row className="py-24" align="center" justify="center">
        <Text variant="secondary" size="sm">Loading invoice…</Text>
      </Row>
    );
  }

  if (!order) {
    return (
      <Row className="py-24" align="center" justify="center">
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
      <Div className="max-w-2xl mx-auto px-6 print:px-0 print:py-0 print:max-w-none" padding="y-2xl">
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
    </>
  );
}
