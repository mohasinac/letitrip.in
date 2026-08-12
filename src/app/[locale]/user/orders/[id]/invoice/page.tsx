"use client";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { useOrder, ROUTES, Div, Row, Span, Stack, Table, Thead, Tbody, Tr, Th, Td, Text, Heading, Button } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

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
    <Row border="default" 
      justify="between"
      align="center"
      gap="md"
      className="print:hidden sticky top-[var(--header-height,0px)] z-[var(--appkit-z-dropdown)] border-b" surface="default" paddingY="y-sm" paddingX="x-lg"
    >
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
          #{order.id.slice(-8).toUpperCase()}
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
      <Row textSize="sm" justify="between">
        <Text variant="secondary">Subtotal</Text>
        <Text>{paise(order.subtotal, order.currency)}</Text>
      </Row>
      {order.shippingCost !== undefined && (
        <Row textSize="sm" justify="between">
          <Text variant="secondary">Shipping</Text>
          <Text>{order.shippingCost === 0 ? "Free" : paise(order.shippingCost, order.currency)}</Text>
        </Row>
      )}
      {order.discount !== undefined && order.discount > 0 && (
        <Row textSize="sm" justify="between">
          <Text variant="secondary">
            Discount{order.couponCode ? ` (${order.couponCode})` : ""}
          </Text>
          <Text className="text-success print:text-black">
            −{paise(order.discount, order.currency)}
          </Text>
        </Row>
      )}
      {order.tax !== undefined && order.tax > 0 && (
        <Row textSize="sm" justify="between">
          <Text variant="secondary">Tax (GST)</Text>
          <Text>{paise(order.tax, order.currency)}</Text>
        </Row>
      )}
      <Row textWeight="semibold" textSize="sm" border="default" 
        justify="between"
        className="border-t print:border-gray-300 mt-1" padding="t-xs"
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
