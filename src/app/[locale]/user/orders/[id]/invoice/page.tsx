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
      className="print:hidden sticky top-[var(--header-height,0px)] z-[var(--appkit-z-dropdown)] px-6 py-3 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-700"
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
        <Heading level={2} className="text-2xl font-bold print:text-black">LetItRip</Heading>
        <Text variant="secondary" className="text-xs mt-0.5 print:text-gray-500">letitrip.in</Text>
      </Div>
      <Div className="text-right">
        <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
          Invoice
        </Text>
        <Text variant="secondary" className="text-xs mt-0.5 print:text-gray-500">
          #{order.id.slice(-8).toUpperCase()}
        </Text>
        {orderDate && (
          <Text variant="secondary" className="text-xs print:text-gray-500">{orderDate}</Text>
        )}
      </Div>
    </Row>
  );
}

function renderInvoiceAddress(a: NonNullable<OrderData["address"]>) {
  return (
    <Stack gap="xs" className="mb-6">
      <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 print:text-gray-500">
        Delivered to
      </Text>
      <Text className="text-sm text-zinc-800 dark:text-zinc-200 print:text-black">{a.line1}</Text>
      {a.line2 && (
        <Text className="text-sm text-zinc-800 dark:text-zinc-200 print:text-black">{a.line2}</Text>
      )}
      <Text className="text-sm text-zinc-800 dark:text-zinc-200 print:text-black">
        {[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
      </Text>
      {a.country && (
        <Text variant="secondary" className="text-sm print:text-gray-500">{a.country}</Text>
      )}
    </Stack>
  );
}

function renderInvoiceItemsTable(order: OrderData) {
  return (
    <Table className="w-full text-sm mb-6 border-collapse">
      <Thead>
        <Tr className="border-b border-zinc-200 dark:border-slate-700 print:border-gray-300">
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
            <Tr key={i} className="border-b border-zinc-100 dark:border-slate-800 print:border-gray-200">
              <Td className="py-2.5 text-zinc-800 dark:text-zinc-200 print:text-black">
                {item.title}
                {item.attributes && Object.keys(item.attributes).length > 0 && (
                  <Span size="xs" className="ml-1.5 text-zinc-400 dark:text-zinc-400 print:text-gray-500">
                    ({Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")})
                  </Span>
                )}
              </Td>
              <Td className="py-2.5 text-center text-zinc-600 dark:text-zinc-300 print:text-black">
                {item.quantity}
              </Td>
              <Td className="py-2.5 text-right text-zinc-800 dark:text-zinc-200 print:text-black">
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
        className="text-sm font-semibold border-t border-zinc-200 dark:border-slate-700 print:border-gray-300 pt-2 mt-1"
      >
        <Text className="font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">Total</Text>
        <Text className="font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
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
      <Div className="flex items-center justify-center py-24">
        <Text variant="secondary" className="text-sm">Loading invoice…</Text>
      </Div>
    );
  }

  if (!order) {
    return (
      <Div className="flex items-center justify-center py-24">
        <Text variant="secondary" className="text-sm">
          Order not found.{" "}
          <Link href={String(ROUTES.USER.ORDERS)} className="underline">Back to orders</Link>
        </Text>
      </Div>
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
      <Div className="max-w-2xl mx-auto px-6 py-10 print:px-0 print:py-0 print:max-w-none">
        {renderInvoiceHeader(order, orderDate)}
        {order.address && renderInvoiceAddress(order.address)}
        {renderInvoiceItemsTable(order)}
        {renderInvoiceTotals(order)}
        <Text
          variant="secondary"
          className="mt-12 text-center text-xs print:text-gray-400 print:mt-8"
        >
          Thank you for shopping with LetItRip · letitrip.in
        </Text>
      </Div>
    </>
  );
}
